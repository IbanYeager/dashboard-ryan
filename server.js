const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=UTF-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Normalize URL and remove query strings or hash
  let reqUrl = req.url.split('?')[0];

  // Strip prefix /dashboard_spv_ryan if present
  if (reqUrl.startsWith('/dashboard_spv_ryan')) {
    reqUrl = reqUrl.replace('/dashboard_spv_ryan', '');
  }

  // Default to index.html
  if (reqUrl === '' || reqUrl === '/') {
    reqUrl = '/index.html';
  }

  // Safe file path resolution
  const safePath = path.normalize(path.join(ROOT_DIR, reqUrl));

  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If requested a directory or non-existent, try index.html
      const fallback = path.join(ROOT_DIR, 'index.html');
      fs.readFile(fallback, (err2, content) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'no-cache'
          });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(safePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================================`);
  console.log(`Server Dashboard SPV Ryan aktif berjalan!`);
  console.log(`Akses URL:`);
  console.log(`  -> http://localhost:${PORT}/`);
  console.log(`  -> http://localhost:${PORT}/dashboard_spv_ryan/`);
  console.log(`======================================================`);
});

