import { Injectable } from '@nestjs/common';
import { StorageService, Project } from '../storage/storage.service';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class ProjectService {
  constructor(
    private storageService: StorageService,
    private proxyService: ProxyService,
  ) {}

  async getProjects(name?: string): Promise<{ list: Project[]; total: number }> {
    let projects = await this.storageService.getProjects();
    
    if (name) {
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    return { list: projects, total: projects.length };
  }

  async getProjectInfo(id: number): Promise<Project | null> {
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

  async createProject(data: {
    name: string;
    port: number;
    description: string;
    configs?: Array<{ targetAddress: string; headers?: Record<string, string> }>;
  }): Promise<Project | null> {
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

  async modifyProject(id: number, data: {
    name: string;
    port: number;
    description: string;
    configs?: Array<{ targetAddress: string; headers?: Record<string, string> }>;
  }): Promise<Project | null> {
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

  async deleteProject(id: number): Promise<boolean> {
    const project = await this.storageService.getProjectById(id);
    if (project && project.status === 'running') {
      await this.proxyService.stopProxy(id);
    }
    
    const deleted = await this.storageService.deleteProject(id);
    return deleted !== null;
  }

  async checkProjectName(name: string): Promise<boolean> {
    return this.storageService.projectExists(name);
  }

  async requestProjectPort(): Promise<number> {
    const projects = await this.storageService.getProjects();
    const usedPorts = projects.map(p => p.port);
    
    let newPort;
    do {
      newPort = Math.floor(Math.random() * 50000) + 10000;
    } while (usedPorts.includes(newPort));
    
    return newPort;
  }

  async switchConfig(id: number, destination: string): Promise<boolean> {
    const updated = await this.storageService.updateProject(id, { destination });
    return updated !== null;
  }

  async startProject(id: number): Promise<boolean> {
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

  async stopProject(id: number): Promise<boolean> {
    const success = await this.proxyService.stopProxy(id);
    if (success) {
      await this.storageService.updateProject(id, { status: 'stopped' });
    }
    
    return success;
  }

  async restartProject(id: number): Promise<boolean> {
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

  async getCookie(id: number): Promise<string> {
    return `SESSIONID=proxy_${id}_${Date.now()}`;
  }
}
