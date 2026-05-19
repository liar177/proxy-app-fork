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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("../storage/storage.service");
const proxy_service_1 = require("../proxy/proxy.service");
let ProjectService = class ProjectService {
    constructor(storageService, proxyService) {
        this.storageService = storageService;
        this.proxyService = proxyService;
    }
    async getProjects(name) {
        let projects = await this.storageService.getProjects();
        if (name) {
            projects = projects.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
        }
        return { list: projects, total: projects.length };
    }
    async getProjectInfo(id) {
        const project = await this.storageService.getProjectById(id);
        if (!project) {
            return null;
        }
        const configs = project.configs && project.configs.length > 0
            ? project.configs
            : [{
                    targetAddress: project.destination,
                    headers: { cookie: '' },
                }];
        return {
            ...project,
            configs,
        };
    }
    async createProject(data) {
        const exists = await this.storageService.projectExists(data.name);
        if (exists) {
            return null;
        }
        const destination = data.configs?.[0]?.targetAddress || '';
        const config = data.description || data.name.substring(0, 20);
        const newProject = await this.storageService.addProject({
            name: data.name,
            port: data.port,
            description: data.description,
            destination,
            config,
            configs: data.configs || [],
            address: `http://localhost:${data.port}`,
            status: 'stopped',
        });
        return newProject;
    }
    async modifyProject(id, data) {
        const exists = await this.storageService.projectExists(data.name, id);
        if (exists) {
            return null;
        }
        const destination = data.configs?.[0]?.targetAddress || '';
        const updated = await this.storageService.updateProject(id, {
            name: data.name,
            port: data.port,
            description: data.description,
            destination,
            configs: data.configs || [],
            address: `http://localhost:${data.port}`,
        });
        return updated;
    }
    async deleteProject(id) {
        const project = await this.storageService.getProjectById(id);
        if (project && project.status === 'running') {
            await this.proxyService.stopProxy(id);
        }
        const deleted = await this.storageService.deleteProject(id);
        return deleted !== null;
    }
    async checkProjectName(name) {
        return this.storageService.projectExists(name);
    }
    async requestProjectPort() {
        const projects = await this.storageService.getProjects();
        const usedPorts = projects.map(p => p.port);
        let newPort;
        do {
            newPort = Math.floor(Math.random() * 50000) + 10000;
        } while (usedPorts.includes(newPort));
        return newPort;
    }
    async switchConfig(id, destination) {
        const updated = await this.storageService.updateProject(id, { destination });
        return updated !== null;
    }
    async startProject(id) {
        const project = await this.storageService.getProjectById(id);
        if (!project) {
            return false;
        }
        const success = await this.proxyService.startProxy(project);
        if (success) {
            await this.storageService.updateProject(id, { status: 'running' });
        }
        return success;
    }
    async stopProject(id) {
        const success = await this.proxyService.stopProxy(id);
        if (success) {
            await this.storageService.updateProject(id, { status: 'stopped' });
        }
        return success;
    }
    async restartProject(id) {
        await this.proxyService.stopProxy(id);
        const project = await this.storageService.getProjectById(id);
        if (!project) {
            return false;
        }
        const success = await this.proxyService.startProxy(project);
        if (success) {
            await this.storageService.updateProject(id, { status: 'running' });
        }
        return success;
    }
    async getCookie(id) {
        return `SESSIONID=proxy_${id}_${Date.now()}`;
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        proxy_service_1.ProxyService])
], ProjectService);
//# sourceMappingURL=project.service.js.map