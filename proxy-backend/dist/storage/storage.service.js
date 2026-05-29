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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const lowdb_1 = require("lowdb");
const node_1 = require("lowdb/node");
const path_1 = require("path");
const defaultData = {
    projects: [],
};
let StorageService = class StorageService {
    async onModuleInit() {
        const dataDir = process.env.DATA_DIR
            || (0, path_1.join)(__dirname, '..', '..', 'data');
        const dbPath = (0, path_1.join)(dataDir, 'db.json');
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        await fs.mkdir(dataDir, { recursive: true });
        this.db = new lowdb_1.Low(new node_1.JSONFile(dbPath), defaultData);
        await this.db.read();
        if (!this.db.data) {
            this.db.data = { projects: [] };
        }
        if (!this.db.data.projects) {
            this.db.data.projects = [];
        }
        await this.db.write();
    }
    async getProjects() {
        await this.db.read();
        return this.db.data.projects || [];
    }
    async getProjectById(id) {
        await this.db.read();
        return this.db.data.projects.find(p => p.id === id);
    }
    async addProject(project) {
        await this.db.read();
        const maxId = Math.max(...this.db.data.projects.map(p => p.id), 0);
        const newProject = {
            ...project,
            id: maxId + 1,
        };
        this.db.data.projects.push(newProject);
        await this.db.write();
        return newProject;
    }
    async updateProject(id, updates) {
        await this.db.read();
        const index = this.db.data.projects.findIndex(p => p.id === id);
        if (index === -1) {
            return null;
        }
        this.db.data.projects[index] = { ...this.db.data.projects[index], ...updates };
        await this.db.write();
        return this.db.data.projects[index];
    }
    async deleteProject(id) {
        await this.db.read();
        const index = this.db.data.projects.findIndex(p => p.id === id);
        if (index === -1) {
            return null;
        }
        const deleted = this.db.data.projects[index];
        this.db.data.projects.splice(index, 1);
        await this.db.write();
        return deleted;
    }
    async projectExists(name, excludeId) {
        await this.db.read();
        return this.db.data.projects.some(p => p.name === name && p.id !== excludeId);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
//# sourceMappingURL=storage.service.js.map