const http = require('http');
const express = require('express');

const app = express();
const port = 8888;

app.use('*', (req, res) => {
  res.json({ message: 'Proxy test server' });
});

const server = http.createServer(app).listen(port, () => {
  console.log(`Test server started on port ${port}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});