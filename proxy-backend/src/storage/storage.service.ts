import { Injectable, OnModuleInit } from '@nestjs/common';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';

export interface Project {
  id: number;
  name: string;
  config: string;
  address: string;
  destination: string;
  status: 'running' | 'stopped' | 'reloading';
  description: string;
  port: number;
  configs: Array<{
    targetAddress: string;
    headers?: Record<string, string>;
  }>;
}

interface Database {
  projects: Project[];
}

const defaultData: Database = {
  projects: [],
};

@Injectable()
export class StorageService implements OnModuleInit {
  private db: Low<Database>;

  async onModuleInit() {
    const dataDir = process.env.DATA_DIR
      || join(__dirname, '..', '..', 'data');
    const dbPath = join(dataDir, 'db.json');

    const fs = await import('fs/promises');
    await fs.mkdir(dataDir, { recursive: true });

    this.db = new Low(new JSONFile(dbPath), defaultData);
    await this.db.read();
    
    if (!this.db.data) {
      this.db.data = { projects: [] };
    }
    
    if (!this.db.data.projects) {
      this.db.data.projects = [];
    }
    
    await this.db.write();
  }

  async getProjects(): Promise<Project[]> {
    await this.db.read();
    return this.db.data.projects || [];
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    await this.db.read();
    return this.db.data.projects.find(p => p.id === id);
  }

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    await this.db.read();
    const maxId = Math.max(...this.db.data.projects.map(p => p.id), 0);
    const newProject: Project = {
      ...project,
      id: maxId + 1,
    };
    this.db.data.projects.push(newProject);
    await this.db.write();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | null> {
    await this.db.read();
    const index = this.db.data.projects.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    this.db.data.projects[index] = { ...this.db.data.projects[index], ...updates };
    await this.db.write();
    return this.db.data.projects[index];
  }

  async deleteProject(id: number): Promise<Project | null> {
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

  async projectExists(name: string, excludeId?: number): Promise<boolean> {
    await this.db.read();
    return this.db.data.projects.some(
      p => p.name === name && p.id !== excludeId
    );
  }
}
