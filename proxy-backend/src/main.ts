import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join, extname } from 'path';
import { existsSync, createReadStream } from 'fs';
import { lookup } from 'mime-types';
import { AppModule } from './app.module';

async function bootstrap() {
  const server = express();

  server.use(express.json());

  // 静态文件 + SPA fallback：手写中间件避免 Express 5 serve-static 行为问题
  const publicDir = join(__dirname, 'public');
  server.use((req, res, next) => {
    const isApiOrMcp = req.path.startsWith('/api-proxy') || req.path.startsWith('/mcp');
    if (isApiOrMcp) return next();

    if (req.method !== 'GET') return next();

    const filePath = join(publicDir, req.path === '/' ? 'index.html' : req.path);
    if (existsSync(filePath) && extname(filePath)) {
      const mime = lookup(filePath) || 'application/octet-stream';
      res.setHeader('Content-Type', mime);
      return createReadStream(filePath).pipe(res);
    }

    // SPA fallback：返回 index.html
    res.setHeader('Content-Type', 'text/html');
    createReadStream(join(publicDir, 'index.html')).pipe(res);
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // 全局前缀匹配前端 axios baseURL: "/api-proxy/"，排除 MCP 端点保持在 /mcp
  app.setGlobalPrefix('api-proxy', { exclude: ['mcp'] });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = parseInt(process.env.PROXY_APP_PORT, 10) || 3000;
  await app.listen(port);
  console.log(`Proxy Backend Server is running on http://localhost:${port}`);
}

bootstrap();
