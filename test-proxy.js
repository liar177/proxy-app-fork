const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const target = 'http://localhost:3001';

const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  proxy.web(req, res, {
    target: target,
    changeOrigin: true,
    secure: false,
  }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
  });
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: target,
    changeOrigin: true,
    secure: false,
  });
});

server.listen(8888, () => {
  console.log(`Proxy server running on http://localhost:8888`);
  console.log(`Target: ${target}`);
});

proxy.on('proxyReq', (proxyReq, req, res) => {
  console.log(`Proxy request: ${proxyReq.method} ${proxyReq.path}`);
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`Proxy response: ${proxyRes.statusCode}`);
});

proxy.on('error', (err, req, res) => {
  console.error('Global proxy error:', err);
});