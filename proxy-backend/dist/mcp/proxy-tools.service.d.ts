import { Context } from '@rekog/mcp-nest';
import { ProjectService } from '../project/project.service';
import { StorageService } from '../storage/storage.service';
export declare class ProxyToolsService {
    private readonly projectService;
    private readonly storageService;
    constructor(projectService: ProjectService, storageService: StorageService);
    listProjects(args: {
        name?: string;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    getProject(args: {
        id: number;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    createProject(args: {
        name: string;
        port: number;
        description: string;
        configs?: Array<{
            targetAddress: string;
            headers?: Record<string, string>;
        }>;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    updateProject(args: {
        id: number;
        name: string;
        port: number;
        description: string;
        configs?: Array<{
            targetAddress: string;
            headers?: Record<string, string>;
        }>;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    deleteProject(args: {
        id: number;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    startProxy(args: {
        id: number;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    stopProxy(args: {
        id: number;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    restartProxy(args: {
        id: number;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    switchConfig(args: {
        id: number;
        destination: string;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    getCookie(args: {
        id: number;
    }, _context: Context): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
}
