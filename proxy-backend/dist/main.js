"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const expressApp = (0, express_1.default)();
    expressApp.use(express_1.default.json());
    expressApp.use((req, res, next) => {
        if (req.path.startsWith('/project')) {
            return next();
        }
        express_1.default.static((0, path_1.join)(__dirname, 'public'))(req, res, next);
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    await app.listen(3000);
    console.log('Proxy Backend Server is running on http://localhost:3000');
}
bootstrap();
//# sourceMappingURL=main.js.map