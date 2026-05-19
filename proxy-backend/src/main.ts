import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const expressApp = express();
  
  expressApp.use(express.json());
  
  expressApp.use((req, res, next) => {
    if (req.path.startsWith('/project')) {
      return next();
    }
    express.static(join(__dirname, 'public'))(req, res, next);
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('Proxy Backend Server is running on http://localhost:3000');
}

bootstrap();
