import { Project } from '../storage/storage.service';
export declare class ProxyService {
    private proxyServers;
    startProxy(project: Project): Promise<boolean>;
    stopProxy(projectId: number): Promise<boolean>;
    isRunning(projectId: number): boolean;
    checkPortAvailable(port: number): Promise<boolean>;
    getAvailablePort(): Promise<number>;
}
