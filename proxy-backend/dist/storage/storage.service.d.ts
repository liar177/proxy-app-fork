import { OnModuleInit } from '@nestjs/common';
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
export declare class StorageService implements OnModuleInit {
    private db;
    onModuleInit(): Promise<void>;
    getProjects(): Promise<Project[]>;
    getProjectById(id: number): Promise<Project | undefined>;
    addProject(project: Omit<Project, 'id'>): Promise<Project>;
    updateProject(id: number, updates: Partial<Project>): Promise<Project | null>;
    deleteProject(id: number): Promise<Project | null>;
    projectExists(name: string, excludeId?: number): Promise<boolean>;
}
