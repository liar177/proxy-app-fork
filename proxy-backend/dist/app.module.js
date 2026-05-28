"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mcp_nest_1 = require("@rekog/mcp-nest");
const project_module_1 = require("./project/project.module");
const proxy_module_1 = require("./proxy/proxy.module");
const storage_module_1 = require("./storage/storage.module");
const proxy_tools_service_1 = require("./mcp/proxy-tools.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            storage_module_1.StorageModule,
            project_module_1.ProjectModule,
            proxy_module_1.ProxyModule,
            mcp_nest_1.McpModule.forRoot({
                name: 'proxy-mcp-server',
                version: '1.0.0',
                description: '代理项目管理 MCP Server — 支持代理配置的增删改查和启停控制',
                transport: mcp_nest_1.McpTransportType.STREAMABLE_HTTP,
                mcpEndpoint: '/mcp',
                streamableHttp: {
                    enableJsonResponse: true,
                    statelessMode: true,
                },
            }),
        ],
        providers: [proxy_tools_service_1.ProxyToolsService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map