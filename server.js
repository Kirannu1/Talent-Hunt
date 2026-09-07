// ============================================================================
// MindMesh — Local Web Server for Real Google OAuth & Multi-device Testing
// Run with: node server.js
// Access at: http://localhost:3000
// ============================================================================
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// In-memory message store for local multi-browser testing
const messageStore = [];

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = decodeURI(parsedUrl.pathname);

  // CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // --- Real-time Local Messaging API ---
  if (reqPath === '/api/messages') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const msg = JSON.parse(body);
          if (!msg.id) msg.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
          if (!msg.createdAt) msg.createdAt = Date.now();
          messageStore.push(msg);
          res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, message: msg }));
        } catch (e) {
          res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (req.method === 'GET') {
      const threadId = parsedUrl.searchParams.get('threadId');
      const uid = parsedUrl.searchParams.get('uid');
      let results = messageStore;
      if (threadId) {
        results = results.filter(m => m.threadId === threadId);
      } else if (uid) {
        results = results.filter(m => m.from === uid || m.to === uid);
      }
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, messages: results }));
      return;
    }
  }

  if (reqPath === '/api/threads') {
    const uid = parsedUrl.searchParams.get('uid');
    const threadsMap = {};
    messageStore.forEach(m => {
      if (!uid || m.from === uid || m.to === uid) {
        const thId = m.threadId || [m.from, m.to].sort().join('__');
        if (!threadsMap[thId] || threadsMap[thId].updatedAt < m.createdAt) {
          threadsMap[thId] = {
            id: thId,
            participants: [m.from, m.to],
            updatedAt: m.createdAt,
            lastMessage: m
          };
        }
      }
    });
    const threads = Object.values(threadsMap).sort((a, b) => b.updatedAt - a.updatedAt);
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, threads }));
    return;
  }

  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(DIR, reqPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`MindMesh Platform is live at: http://localhost:${PORT}`);
  console.log(`Real Google Sign-In is enabled at: http://localhost:${PORT}`);
  console.log('====================================================');
});
