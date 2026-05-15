const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  // Security: prevent directory traversal
  const realPath = path.resolve(filePath);
  if (!realPath.startsWith(path.resolve(__dirname))) {
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try to serve index.html for missing files (for routing)
      if (err.code === 'ENOENT' && !filePath.endsWith('.html')) {
        filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err2, data2) => {
          if (err2) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not Found');
          } else {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(data2);
          }
        });
      } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
      }
    } else {
      const ext = path.extname(filePath);
      let contentType = 'text/plain';

      if (ext === '.html') contentType = 'text/html; charset=utf-8';
      else if (ext === '.css') contentType = 'text/css; charset=utf-8';
      else if (ext === '.js') contentType = 'application/javascript; charset=utf-8';
      else if (ext === '.json') contentType = 'application/json; charset=utf-8';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.ico') contentType = 'image/x-icon';

      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    }
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
