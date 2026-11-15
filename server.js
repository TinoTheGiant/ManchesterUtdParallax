'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = __dirname;
const DATA_PATH = path.join(ROOT_DIR, 'data', 'club-data.json');

const clubData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const ALLOWED_STATIC_FILES = new Set(['/index.html', '/legends.html']);
const ALLOWED_STATIC_PREFIXES = ['/css/', '/js/', '/assets/', '/audio/'];

function sendJson(res, statusCode, payload, method) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  res.end(body);
}

function sendNotFound(res, method) {
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache'
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  res.end('404 Not Found');
}

function isAllowedStaticPath(urlPath) {
  if (ALLOWED_STATIC_FILES.has(urlPath)) {
    return true;
  }
  return ALLOWED_STATIC_PREFIXES.some((prefix) => urlPath.startsWith(prefix));
}

function createServer() {
  return http.createServer((req, res) => {
    const method = req.method || 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      sendJson(res, 405, { error: 'Method Not Allowed' }, method);
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(req.url || '/', 'http://localhost');
    } catch {
      sendNotFound(res, method);
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(parsedUrl.pathname);
    } catch {
      sendNotFound(res, method);
      return;
    }

    // API Routes
    if (pathname === '/api/health') {
      sendJson(
        res,
        200,
        {
          status: 'ok',
          club: 'Manchester United',
          founded: 1878
        },
        method
      );
      return;
    }

    if (pathname === '/api/honours') {
      sendJson(res, 200, clubData.honours, method);
      return;
    }

    if (pathname === '/api/legends') {
      const queryId = parsedUrl.searchParams.get('id');
      if (queryId) {
        const legend = clubData.legends.find(
          (item) => item.id.toLowerCase() === queryId.trim().toLowerCase()
        );
        if (!legend) {
          sendJson(res, 404, { error: 'Legend not found', id: queryId }, method);
          return;
        }
        sendJson(res, 200, legend, method);
        return;
      }

      sendJson(
        res,
        200,
        {
          club: 'Manchester United',
          count: clubData.legends.length,
          legends: clubData.legends
        },
        method
      );
      return;
    }

    if (pathname.startsWith('/api/legends/')) {
      const legendId = pathname.slice('/api/legends/'.length).replace(/\/+$/, '');
      const legend = clubData.legends.find(
        (item) => item.id.toLowerCase() === legendId.toLowerCase()
      );
      if (!legend) {
        sendJson(res, 404, { error: 'Legend not found', id: legendId }, method);
        return;
      }
      sendJson(res, 200, legend, method);
      return;
    }

    if (pathname === '/api/matchday') {
      sendJson(res, 200, clubData.matchday, method);
      return;
    }

    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'API endpoint not found' }, method);
      return;
    }

    // Static File Serving with Path-Traversal Protection
    const normalizedRoute = pathname === '/' ? '/index.html' : pathname;

    if (
      normalizedRoute.includes('\0') ||
      normalizedRoute.includes('..') ||
      normalizedRoute.includes('\\') ||
      !isAllowedStaticPath(normalizedRoute)
    ) {
      sendNotFound(res, method);
      return;
    }

    const resolvedPath = path.resolve(ROOT_DIR, '.' + normalizedRoute);
    const rootWithSep = ROOT_DIR.endsWith(path.sep) ? ROOT_DIR : ROOT_DIR + path.sep;
    if (!resolvedPath.startsWith(rootWithSep)) {
      sendNotFound(res, method);
      return;
    }

    fs.stat(resolvedPath, (statErr, stats) => {
      if (statErr || !stats.isFile()) {
        sendNotFound(res, method);
        return;
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'public, max-age=300'
      });

      if (method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs.createReadStream(resolvedPath);
      stream.on('error', () => {
        if (!res.headersSent) {
          sendNotFound(res, method);
        } else {
          res.destroy();
        }
      });
      stream.pipe(res);
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const server = createServer();
  server.listen(port, () => {
    console.log(`Manchester United server listening on http://localhost:${port}`);
  });
}

module.exports = {
  createServer,
  clubData
};
