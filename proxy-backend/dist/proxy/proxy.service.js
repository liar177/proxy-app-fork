"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const http = __importStar(require("http"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const express_1 = __importDefault(require("express"));
const url = __importStar(require("url"));
let ProxyService = class ProxyService {
    constructor() {
        this.proxyServers = new Map();
    }
    async startProxy(project) {
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
                const app = (0, express_1.default)();
                app.use(express_1.default.json({ limit: '50mb' }));
                app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
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
                const proxyOptions = {
                    target: targetOrigin,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                };
                console.log(`[DEBUG] Creating proxy middleware with options:`, JSON.stringify(proxyOptions));
                const proxy = (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions);
                console.log(`[DEBUG] Proxy middleware created successfully`);
                app.use(proxy);
                console.log(`[DEBUG] Proxy middleware attached to app`);
                const server = http.createServer(app);
                console.log(`[DEBUG] HTTP server created`);
                server.on('upgrade', (req, socket, head) => {
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
                server.on('error', (err) => {
                    console.error(`[ERROR] Failed to start proxy on port ${project.port}:`, err.message);
                    console.error(`[ERROR] Error stack:`, err.stack);
                    resolve(false);
                });
                server.on('close', () => {
                    this.proxyServers.delete(project.id);
                    console.log(`Proxy server closed for project ${project.name} (ID: ${project.id})`);
                });
                console.log(`[DEBUG] Server setup complete, waiting for listen...`);
            }
            catch (error) {
                console.error(`[EXCEPTION] Unexpected error in startProxy:`, error);
                resolve(false);
            }
        });
    }
    async stopProxy(projectId) {
        const proxyServer = this.proxyServers.get(projectId);
        if (!proxyServer) {
            return false;
        }
        return new Promise((resolve) => {
            proxyServer.server.close((err) => {
                if (err) {
                    console.error('Error stopping proxy:', err);
                    resolve(false);
                }
                else {
                    this.proxyServers.delete(projectId);
                    console.log(`Proxy server stopped for project ${projectId}`);
                    resolve(true);
                }
            });
        });
    }
    isRunning(projectId) {
        return this.proxyServers.has(projectId);
    }
    async checkPortAvailable(port) {
        return new Promise((resolve) => {
            const server = http.createServer();
            server.once('error', () => resolve(false));
            server.once('listening', () => {
                server.close(() => resolve(true));
            });
            server.listen(port);
        });
    }
    async getAvailablePort() {
        const usedPorts = Array.from(this.proxyServers.values())
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
};
exports.ProxyService = ProxyService;
exports.ProxyService = ProxyService = __decorate([
    (0, common_1.Injectable)()
], ProxyService);
//# sourceMappingURL=proxy.service.js.map