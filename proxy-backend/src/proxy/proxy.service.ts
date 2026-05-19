import { Injectable } from '@nestjs/common';
import * as http from 'http';
import { createProxyMiddleware, type Options, type RequestHandler } from 'http-proxy-middleware';
import { Express } from 'express';
import express from 'express';
import { Project } from '../storage/storage.service';

interface ProxyServer {
  server: http.Server;
  projectId: number;
}

@Injectable()
export class ProxyService {
  private proxyServers: Map<number, ProxyServer> = new Map();

  async startProxy(project: Project): Promise<boolean> {
    if (this.proxyServers.has(project.id)) {
      return false;
    }

    return new Promise((resolve) => {
      const app: Express = express();

      app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        next();
      });

      const proxyOptions: Options = {
        target: project.destination,
        changeOrigin: true,
        secure: false,
        ws: true,
      };

      const proxy: RequestHandler = createProxyMiddleware(proxyOptions);

      app.use('/', proxy);

      const server = http.createServer(app).listen(project.port, () => {
        this.proxyServers.set(project.id, { server, projectId: project.id });
        console.log(`Proxy server started for project ${project.name} on port ${project.port}`);
        resolve(true);
      });

      server.on('error', (err) => {
        console.error(`Failed to start proxy on port ${project.port}:`, err);
        resolve(false);
      });
    });
  }

  async stopProxy(projectId: number): Promise<boolean> {
    const proxyServer = this.proxyServers.get(projectId);
    if (!proxyServer) {
      return false;
    }

    return new Promise((resolve) => {
      proxyServer.server.close((err) => {
        if (err) {
          console.error('Error stopping proxy:', err);
          resolve(false);
        } else {
          this.proxyServers.delete(projectId);
          console.log(`Proxy server stopped for project ${projectId}`);
          resolve(true);
        }
      });
    });
  }

  isRunning(projectId: number): boolean {
    return this.proxyServers.has(projectId);
  }

  async checkPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = http.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port);
    });
  }

  async getAvailablePort(): Promise<number> {
    const usedPorts: number[] = Array.from(this.proxyServers.values())
      .map(ps => {
        const addr = ps.server.address();
        if (typeof addr === 'object' && addr !== null) {
          return addr.port;
        }
        return -1;
      })
      .filter(p => p > 0);
    
    for (let port = 10000; port < 65535; port++) {
      if (!usedPorts.includes(port) && await this.checkPortAvailable(port)) {
        return port;
      }
    }
    
    throw new Error('No available ports');
  }
}
