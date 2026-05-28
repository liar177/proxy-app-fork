"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyToolsService = void 0;
const common_1 = require("@nestjs/common");
const mcp_nest_1 = require("@rekog/mcp-nest");
const zod_1 = require("zod");
const project_service_1 = require("../project/project.service");
const storage_service_1 = require("../storage/storage.service");
const McpResponse = (text) => ({
    content: [{ type: 'text', text }],
});
const configSchema = zod_1.z.object({
    targetAddress: zod_1.z.string(),
    headers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
let ProxyToolsService = class ProxyToolsService {
    constructor(projectService, storageService) {
        this.projectService = projectService;
        this.storageService = storageService;
    }
    async listProjects(args, _context) {
        const result = await this.projectService.getProjects(args.name);
        return McpResponse(JSON.stringify(result, null, 2));
    }
    async getProject(args, _context) {
        const project = await this.projectService.getProjectInfo(args.id);
        if (!project) {
            return McpResponse('项目不存在');
        }
        return McpResponse(JSON.stringify(project, null, 2));
    }
    async createProject(args, _context) {
        const project = await this.projectService.createProject(args);
        if (!project) {
            return McpResponse('创建失败：项目名称已存在');
        }
        return McpResponse(JSON.stringify(project, null, 2));
    }
    async updateProject(args, _context) {
        const project = await this.projectService.modifyProject(args.id, args);
        if (!project) {
            return McpResponse('修改失败：项目名称已存在或项目不存在');
        }
        return McpResponse(JSON.stringify(project, null, 2));
    }
    async deleteProject(args, _context) {
        const success = await this.projectService.deleteProject(args.id);
        if (!success) {
            return McpResponse('删除失败：项目不存在');
        }
        return McpResponse(`项目 ${args.id} 已删除`);
    }
    async startProxy(args, _context) {
        const success = await this.projectService.startProject(args.id);
        if (!success) {
            return McpResponse('启动失败：请检查项目是否存在、目标地址是否有效、或代理是否已在运行');
        }
        return McpResponse(`项目 ${args.id} 代理已启动`);
    }
    async stopProxy(args, _context) {
        const success = await this.projectService.stopProject(args.id);
        if (!success) {
            return McpResponse('停止失败：代理可能未在运行');
        }
        return McpResponse(`项目 ${args.id} 代理已停止`);
    }
    async restartProxy(args, _context) {
        const success = await this.projectService.restartProject(args.id);
        if (!success) {
            return McpResponse('重启失败：请检查项目是否存在');
        }
        return McpResponse(`项目 ${args.id} 代理已重启`);
    }
    async switchConfig(args, _context) {
        const success = await this.projectService.switchConfig(args.id, args.destination);
        if (!success) {
            return McpResponse('切换失败：项目不存在');
        }
        return McpResponse(`项目 ${args.id} 目标地址已切换为 ${args.destination}，请重启代理使其生效`);
    }
    async getCookie(args, _context) {
        const cookie = await this.projectService.getCookie(args.id);
        return McpResponse(cookie);
    }
};
exports.ProxyToolsService = ProxyToolsService;
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'list_projects',
        description: '获取所有代理项目列表，可按名称搜索',
        parameters: zod_1.z.object({
            name: zod_1.z.string().optional().describe('按名称模糊搜索，不传则返回全部'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "listProjects", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'get_project',
        description: '获取单个代理项目的详细信息，包括所有子配置',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "getProject", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'create_project',
        description: '创建新的代理项目，返回创建后的项目信息',
        parameters: zod_1.z.object({
            name: zod_1.z.string().describe('项目名称（唯一）'),
            port: zod_1.z.number().describe('本地代理监听端口'),
            description: zod_1.z.string().default('').describe('项目描述'),
            configs: zod_1.z.array(configSchema).optional().describe('子配置列表，每个包含 targetAddress 和可选的 headers'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "createProject", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'update_project',
        description: '修改已有代理项目的配置',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
            name: zod_1.z.string().describe('项目名称'),
            port: zod_1.z.number().describe('本地代理监听端口'),
            description: zod_1.z.string().default('').describe('项目描述'),
            configs: zod_1.z.array(configSchema).optional().describe('子配置列表'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "updateProject", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'delete_project',
        description: '删除代理项目（会先停止运行中的代理）',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "deleteProject", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'start_proxy',
        description: '启动代理转发服务',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "startProxy", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'stop_proxy',
        description: '停止代理转发服务',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "stopProxy", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'restart_proxy',
        description: '重启代理转发服务（停止后再启动）',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "restartProxy", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'switch_config',
        description: '热切换代理目标地址（修改后需要重启代理才能生效）',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
            destination: zod_1.z.string().describe('新的目标地址，如 https://api.example.com'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "switchConfig", null);
__decorate([
    (0, mcp_nest_1.Tool)({
        name: 'get_cookie',
        description: '获取项目的模拟 cookie（用于代理请求的身份认证）',
        parameters: zod_1.z.object({
            id: zod_1.z.number().describe('项目ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyToolsService.prototype, "getCookie", null);
exports.ProxyToolsService = ProxyToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [project_service_1.ProjectService,
        storage_service_1.StorageService])
], ProxyToolsService);
//# sourceMappingURL=proxy-tools.service.js.map