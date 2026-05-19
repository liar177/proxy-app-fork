import { ProjectService } from './project.service';
export declare class ProjectController {
    private projectService;
    constructor(projectService: ProjectService);
    getProjectList(body: {
        name?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            list: import("../storage/storage.service").Project[];
            total: number;
        };
    }>;
    getProjectInfo(body: {
        id: number;
    }): Promise<{
        code: number;
        msg: string;
        data: import("../storage/storage.service").Project;
    }>;
    createProject(body: {
        name: string;
        port: number;
        description: string;
        configs?: Array<{
            targetAddress: string;
            headers?: Record<string, string>;
        }>;
    }): Promise<{
        code: number;
        msg: string;
        data: import("../storage/storage.service").Project;
    }>;
    modifyProject(body: {
        id: number;
        name: string;
        port: number;
        description: string;
        configs?: Array<{
            targetAddress: string;
            headers?: Record<string, string>;
        }>;
    }): Promise<{
        code: number;
        msg: string;
        data: import("../storage/storage.service").Project;
    }>;
    deleteProject(body: {
        id: number;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    checkProjectName(body: {
        name: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            exists: boolean;
        };
    }>;
    requestProjectPort(): Promise<{
        code: number;
        msg: string;
        data: {
            port: number;
        };
    }>;
    switchConfig(body: {
        id: number;
        destination: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    startAction(body: {
        id: number;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    stopAction(body: {
        id: number;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    restartAction(body: {
        id: number;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    getCookie(body: {
        id: number;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            cookie: string;
        };
    }>;
}
