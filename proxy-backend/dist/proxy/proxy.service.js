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
let ProxyService = class ProxyService {
    constructor() {
        this.proxyServers = new Map();
    }
    async startProxy(project) {
        if (this.proxyServers.has(project.id)) {
            return false;
        }
        return new Promise((resolve) => {
            const app = (0, express_1.default)();
            app.use((req, res, next) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                if (req.method === 'OPTIONS') {
                    return res.sendStatus(200);
                }
                next();
            });
            const proxyOptions = {
                target: project.destination,
                changeOrigin: true,
                secure: false,
                ws: true,
            };
            const proxy = (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions);
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