-- ============================================
-- Migration: Fix signup + harden security
-- ============================================
-- Problem this fixes:
-- 1) signup-simple.html inserted a `password` column into `users` that
--    does not exist in this schema, so every signup failed.
-- 2) Passwords were stored in plaintext and readable by anyone with the
--    public anon key (embedded in the page source).
-- 3) RLS policies used `USING (true)` / `WITH CHECK (true)`, letting any
--    anonymous visitor insert or update ANY row in users/deposits/
--    transactions/withdrawals (e.g. edit their own balance).
--
-- Fix: switch signup/signin to real Supabase Auth (hashed passwords,
-- real sessions) and scope RLS to the authenticated user (auth.uid()),
-- with an is_admin() escape hatch for admin-dashboard.html, which
-- already expected a real auth session via supabase.auth.getUser().
--
-- Also: RLS was found to be DISABLED on all 4 tables in the live
-- database (not just permissively-policied) -- this migration enables
-- it for the first time.

-- ------------------------------------------------
-- 0. Migrate existing legacy accounts (created by the old plaintext-
--    password signup flow) into real Supabase Auth, preserving their
--    email + password so they can keep logging in unchanged. Must run
--    BEFORE the handle_new_user trigger exists, otherwise the trigger
--    would try to insert a second profile row with the same email and
--    violate the unique constraint.
-- ------------------------------------------------
do $$
declare
  u record;
  new_id uuid;
begin
  for u in select id, email, password, full_name from public.users where password is not null loop
    new_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_id,
      'authenticated',
      'authenticated',
      u.email,
      extensions.crypt(u.password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', u.full_name),
      false, false
    );

    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      new_id::text, new_id,
      jsonb_build_object('sub', new_id::text, 'email', u.email),
      'email', now(), now(), now()
    );

    -- Re-key the existing profile row to the new auth id and wipe the
    -- plaintext password now that Supabase Auth owns it.
    update public.users set id = new_id::text, password = null where id = u.id;
  end loop;
end $$;

-- ------------------------------------------------
-- 1. Admin flag + helper function
-- ------------------------------------------------
alter table public.users add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select is_admin from public.users where id = auth.uid()::text), false);
$$;

-- ------------------------------------------------
-- 2. Auto-create a profile row when someone signs up via Supabase Auth
--    (SECURITY DEFINER bypasses RLS for this one controlled insert)
-- ------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, phone, role, available_balance, pending_balance)
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    '',
    null,
    0,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------
-- 3. Enable RLS (was found disabled) and replace any permissive
--    policies with owner-scoped ones
-- ------------------------------------------------
alter table users enable row level security;
alter table deposits enable row level security;
alter table transactions enable row level security;
alter table withdrawals enable row level security;

-- users
drop policy if exists "Anyone can insert user profile" on users;
drop policy if exists "Users can view own profile" on users;
drop policy if exists "Users can update own profile" on users;

create policy "Users can insert own profile"
  on users for insert
  with check (auth.uid()::text = id);

create policy "Users can view own profile"
  on users for select
  using (auth.uid()::text = id or public.is_admin());

create policy "Users can update own profile"
  on users for update
  using (auth.uid()::text = id or public.is_admin())
  with check (auth.uid()::text = id or public.is_admin());

-- deposits
drop policy if exists "Users can insert own deposits" on deposits;
drop policy if exists "Users can view own deposits" on deposits;
drop policy if exists "Users can update own deposits" on deposits;

create policy "Users can insert own deposits"
  on deposits for insert
  with check (auth.uid()::text = user_id);

create policy "Users can view own deposits"
  on deposits for select
  using (auth.uid()::text = user_id or public.is_admin());

create policy "Admins can update deposits"
  on deposits for update
  using (public.is_admin())
  with check (public.is_admin());

-- transactions
drop policy if exists "Users can insert transactions" on transactions;
drop policy if exists "Users can view own transactions" on transactions;

create policy "Users can insert own transactions"
  on transactions for insert
  with check (auth.uid()::text = buyer_id);

create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid()::text = buyer_id or auth.uid()::text = seller_id or public.is_admin());

create policy "Admins can update transactions"
  on transactions for update
  using (public.is_admin())
  with check (public.is_admin());

-- withdrawals
drop policy if exists "Users can insert withdrawals" on withdrawals;
drop policy if exists "Users can view own withdrawals" on withdrawals;

create policy "Users can insert own withdrawals"
  on withdrawals for insert
  with check (auth.uid()::text = user_id);

create policy "Users can view own withdrawals"
  on withdrawals for select
  using (auth.uid()::text = user_id or public.is_admin());

create policy "Admins can update withdrawals"
  on withdrawals for update
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------
-- 4. After running this, mark your own account as admin (once you've
--    signed up normally through the new signup page):
--
--    update public.users set is_admin = true where email = 'you@example.com';
-- ------------------------------------------------
