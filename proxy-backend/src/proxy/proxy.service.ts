import { Injectable } from '@nestjs/common';
import * as http from 'http';
import { createProxyMiddleware, Options, RequestHandler } from 'http-proxy-middleware';
import { Express } from 'express';
import express from 'express';
import { Project } from '../storage/storage.service';
import * as url from 'url';

interface ProxyServer {
  server: http.Server;
  projectId: number;
}

@Injectable()
export class ProxyService {
  private proxyServers: Map<number, ProxyServer> = new Map();

  async startProxy(project: Project): Promise<boolean> {
    if (this.proxyServers.has(project.id)) {
      console.log(`Proxy server already running for project ${project.id}`);
      return false;
    }

    const targetUrl = project.destination;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      console.error('Invalid destination URL:', targetUrl);
      return false;
    }

    const parsedUrl = url.parse(targetUrl);
    const targetOrigin = `${parsedUrl.protocol}//${parsedUrl.host}`;

    console.log(`[DEBUG] Starting proxy for project ${project.name} (${project.id})`);
    console.log(`[DEBUG] Target: ${targetOrigin}`);
    console.log(`[DEBUG] Port: ${project.port}`);

    return new Promise((resolve) => {
      try {
        const app: Express = express();

        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        app.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
          res.setHeader('Access-Control-Expose-Headers', '*');
          if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
          }
          next();
        });

        const proxyOptions: Options = {
          target: targetOrigin,
          changeOrigin: true,
          secure: false,
          ws: true,
        };

        console.log(`[DEBUG] Creating proxy middleware with options:`, JSON.stringify(proxyOptions));
        const proxy: RequestHandler = createProxyMiddleware(proxyOptions);
        console.log(`[DEBUG] Proxy middleware created successfully`);

        app.use(proxy);
        console.log(`[DEBUG] Proxy middleware attached to app`);

        const server = http.createServer(app);
        console.log(`[DEBUG] HTTP server created`);

        server.on('upgrade', (req, socket: any, head: any) => {
          proxy.upgrade(req, socket, head);
        });
        console.log(`[DEBUG] WebSocket upgrade handler attached`);

        server.listen(project.port, () => {
          console.log(`[DEBUG] Server.listen callback triggered`);
          this.proxyServers.set(project.id, { server, projectId: project.id });
          console.log(`Proxy server started for project ${project.name} (ID: ${project.id}) on port ${project.port}`);
          console.log(`Target destination: ${targetOrigin}`);
          resolve(true);
        });

        server.on('error', (err: Error) => {
          console.error(`[ERROR] Failed to start proxy on port ${project.port}:`, err.message);
          console.error(`[ERROR] Error stack:`, err.stack);
          resolve(false);
        });

        server.on('close', () => {
          this.proxyServers.delete(project.id);
          console.log(`Proxy server closed for project ${project.name} (ID: ${project.id})`);
        });

        console.log(`[DEBUG] Server setup complete, waiting for listen...`);
        
      } catch (error) {
        console.error(`[EXCEPTION] Unexpected error in startProxy:`, error);
        resolve(false);
      }
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