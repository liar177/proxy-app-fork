import { StorageService, Project } from '../storage/storage.service';
import { ProxyService } from '../proxy/proxy.service';
export declare class ProjectService {
    private storageService;
    private proxyService;
    constructor(storageService: StorageService, proxyService: ProxyService);
    getProjects(name?: string): Promise<{
        list: Project[];
        total: number;
    }>;
    getProjectInfo(id: number): Promise<Project | null>;
    createProject(data: {
        name: string;
        port: number;
        description: string;
        configs?: Array<{
            targetAddress: string;
            headers?: Record<string, string>;
        }>;
    }): Promise<Project | null>;
    modifyProject(id: number, data: {
        name: string;
        port: number;
        description: string;
        configs?: Array<{
            targetAddress: string;
            headers?: Record<string, string>;
        }>;
    }): Promise<Project | null>;
    deleteProject(id: number): Promise<boolean>;
    checkProjectName(name: string): Promise<boolean>;
    requestProjectPort(): Promise<number>;
    switchConfig(id: number, destination: string): Promise<boolean>;
    startProject(id: number): Promise<boolean>;
    stopProject(id: number): Promise<boolean>;
    restartProject(id: number): Promise<boolean>;
    getCookie(id: number): Promise<string>;
}
