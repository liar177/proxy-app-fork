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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
let ProjectController = class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    async getProjectList(body) {
        try {
            const result = await this.projectService.getProjects(body.name);
            return {
                code: 0,
                msg: '操作成功',
                data: result,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
    async getProjectInfo(body) {
        try {
            const project = await this.projectService.getProjectInfo(body.id);
            if (project) {
                return {
                    code: 0,
                    msg: '操作成功',
                    data: project,
                };
            }
            return {
                code: -1,
                msg: '项目不存在',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
    async createProject(body) {
        try {
            const project = await this.projectService.createProject(body);
            if (project) {
                return {
                    code: 0,
                    msg: '创建成功',
                    data: project,
                };
            }
            return {
                code: -1,
                msg: '项目名称已存在',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
    async modifyProject(body) {
        try {
            const project = await this.projectService.modifyProject(body.id, body);
            if (project) {
                return {
                    code: 0,
                    msg: '修改成功',
                    data: project,
                };
            }
            return {
                code: -1,
                msg: '项目名称已存在或项目不存在',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
    async deleteProject(body) {
        try {
            const success = await this.projectService.deleteProject(body.id);
            if (success) {
                return {
                    code: 0,
                    msg: '删除成功',
                    data: null,
                };
            }
            return {
                code: -1,
                msg: '项目不存在',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
    async checkProjectName(body) {
        try {
            const exists = await this.projectService.checkProjectName(body.name);
            return {
                code: 0,
                msg: '操作成功',
                data: { exists },
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
    async requestProjectPort() {
        try {
            const port = await this.projectService.requestProjectPort();
            return {
                code: 0,
                msg: '端口获取成功',
                data: { port },
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '端口获取失败',
                data: null,
            };
        }
    }
    async switchConfig(body) {
        try {
            const success = await this.projectService.switchConfig(body.id, body.destination);
            if (success) {
                return {
                    code: 0,
                    msg: '配置切换成功',
                    data: null,
                };
            }
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
    async startAction(body) {
        try {
            const success = await this.projectService.startProject(body.id);
            if (success) {
                return {
                    code: 0,
                    msg: '启动成功',
                    data: null,
                };
            }
            return {
                code: -1,
                msg: '启动失败',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '启动失败',
                data: null,
            };
        }
    }
    async stopAction(body) {
        try {
            const success = await this.projectService.stopProject(body.id);
            if (success) {
                return {
                    code: 0,
                    msg: '停止成功',
                    data: null,
                };
            }
            return {
                code: -1,
                msg: '停止失败',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '停止失败',
                data: null,
            };
        }
    }
    async restartAction(body) {
        try {
            const success = await this.projectService.restartProject(body.id);
            if (success) {
                return {
                    code: 0,
                    msg: '重启成功',
                    data: null,
                };
            }
            return {
                code: -1,
                msg: '重启失败',
                data: null,
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '重启失败',
                data: null,
            };
        }
    }
    async getCookie(body) {
        try {
            const cookie = await this.projectService.getCookie(body.id);
            return {
                code: 0,
                msg: '操作成功',
                data: { cookie },
            };
        }
        catch (error) {
            return {
                code: -1,
                msg: '操作失败',
                data: null,
            };
        }
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getProjectList", null);
__decorate([
    (0, common_1.Post)('info'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getProjectInfo", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "createProject", null);
__decorate([
    (0, common_1.Post)('modify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "modifyProject", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "deleteProject", null);
__decorate([
    (0, common_1.Post)('checkProjectName'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "checkProjectName", null);
__decorate([
    (0, common_1.Post)('requestProjectPort'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "requestProjectPort", null);
__decorate([
    (0, common_1.Post)('switchConfig'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "switchConfig", null);
__decorate([
    (0, common_1.Post)('action/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "startAction", null);
__decorate([
    (0, common_1.Post)('action/stop'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "stopAction", null);
__decorate([
    (0, common_1.Post)('action/restart'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "restartAction", null);
__decorate([
    (0, common_1.Post)('action/getCookie'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getCookie", null);
exports.ProjectController = ProjectController = __decorate([
    (0, common_1.Controller)('project'),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map