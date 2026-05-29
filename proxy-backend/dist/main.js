"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const fs_1 = require("fs");
const mime_types_1 = require("mime-types");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const server = (0, express_1.default)();
    server.use(express_1.default.json());
    const publicDir = (0, path_1.join)(__dirname, 'public');
    server.use((req, res, next) => {
        const isApiOrMcp = req.path.startsWith('/api-proxy') || req.path.startsWith('/mcp');
        if (isApiOrMcp)
            return next();
        if (req.method !== 'GET')
            return next();
        const filePath = (0, path_1.join)(publicDir, req.path === '/' ? 'index.html' : req.path);
        if ((0, fs_1.existsSync)(filePath) && (0, path_1.extname)(filePath)) {
            const mime = (0, mime_types_1.lookup)(filePath) || 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            return (0, fs_1.createReadStream)(filePath).pipe(res);
        }
        res.setHeader('Content-Type', 'text/html');
        (0, fs_1.createReadStream)((0, path_1.join)(publicDir, 'index.html')).pipe(res);
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
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
//# sourceMappingURL=main.js.map