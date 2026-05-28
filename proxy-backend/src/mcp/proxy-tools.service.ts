import { Injectable } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { ProjectService } from '../project/project.service';
import { StorageService } from '../storage/storage.service';

const McpResponse = (text: string) => ({
  content: [{ type: 'text' as const, text }],
});

const configSchema = z.object({
  targetAddress: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
});

@Injectable()
export class ProxyToolsService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
  ) {}

  @Tool({
    name: 'list_projects',
    description: '获取所有代理项目列表，可按名称搜索',
    parameters: z.object({
      name: z.string().optional().describe('按名称模糊搜索，不传则返回全部'),
    }),
  })
  async listProjects(args: { name?: string }, _context: Context) {
    const result = await this.projectService.getProjects(args.name);
    return McpResponse(JSON.stringify(result, null, 2));
  }

  @Tool({
    name: 'get_project',
    description: '获取单个代理项目的详细信息，包括所有子配置',
    parameters: z.object({
      id: z.number().describe('项目ID'),
    }),
  })
  async getProject(args: { id: number }, _context: Context) {
    const project = await this.projectService.getProjectInfo(args.id);
    if (!project) {
      return McpResponse('项目不存在');
    }
    return McpResponse(JSON.stringify(project, null, 2));
  }

  @Tool({
    name: 'create_project',
    description: '创建新的代理项目，返回创建后的项目信息',
    parameters: z.object({
      name: z.string().describe('项目名称（唯一）'),
      port: z.number().describe('本地代理监听端口'),
      description: z.string().default('').describe('项目描述'),
      configs: z.array(configSchema).optional().describe('子配置列表，每个包含 targetAddress 和可选的 headers'),
    }),
  })
  async createProject(
    args: {
      name: string;
      port: number;
      description: string;
      configs?: Array<{ targetAddress: string; headers?: Record<string, string> }>;
    },
    _context: Context,
  ) {
    const project = await this.projectService.createProject(args);
    if (!project) {
      return McpResponse('创建失败：项目名称已存在');
    }
    return McpResponse(JSON.stringify(project, null, 2));
  }

  @Tool({
    name: 'update_project',
    description: '修改已有代理项目的配置',
    parameters: z.object({
      id: z.number().describe('项目ID'),
      name: z.string().describe('项目名称'),
      port: z.number().describe('本地代理监听端口'),
      description: z.string().default('').describe('项目描述'),
      configs: z.array(configSchema).optional().describe('子配置列表'),
    }),
  })
  async updateProject(
    args: {
      id: number;
      name: string;
      port: number;
      description: string;
      configs?: Array<{ targetAddress: string; headers?: Record<string, string> }>;
    },
    _context: Context,
  ) {
    const project = await this.projectService.modifyProject(args.id, args);
    if (!project) {
      return McpResponse('修改失败：项目名称已存在或项目不存在');
    }
    return McpResponse(JSON.stringify(project, null, 2));
  }

  @Tool({
    name: 'delete_project',
    description: '删除代理项目（会先停止运行中的代理）',
    parameters: z.object({
      id: z.number().describe('项目ID'),
    }),
  })
  async deleteProject(args: { id: number }, _context: Context) {
    const success = await this.projectService.deleteProject(args.id);
    if (!success) {
      return McpResponse('删除失败：项目不存在');
    }
    return McpResponse(`项目 ${args.id} 已删除`);
  }

  @Tool({
    name: 'start_proxy',
    description: '启动代理转发服务',
    parameters: z.object({
      id: z.number().describe('项目ID'),
    }),
  })
  async startProxy(args: { id: number }, _context: Context) {
    const success = await this.projectService.startProject(args.id);
    if (!success) {
      return McpResponse('启动失败：请检查项目是否存在、目标地址是否有效、或代理是否已在运行');
    }
    return McpResponse(`项目 ${args.id} 代理已启动`);
  }

  @Tool({
    name: 'stop_proxy',
    description: '停止代理转发服务',
    parameters: z.object({
      id: z.number().describe('项目ID'),
    }),
  })
  async stopProxy(args: { id: number }, _context: Context) {
    const success = await this.projectService.stopProject(args.id);
    if (!success) {
      return McpResponse('停止失败：代理可能未在运行');
    }
    return McpResponse(`项目 ${args.id} 代理已停止`);
  }

  @Tool({
    name: 'restart_proxy',
    description: '重启代理转发服务（停止后再启动）',
    parameters: z.object({
      id: z.number().describe('项目ID'),
    }),
  })
  async restartProxy(args: { id: number }, _context: Context) {
    const success = await this.projectService.restartProject(args.id);
    if (!success) {
      return McpResponse('重启失败：请检查项目是否存在');
    }
    return McpResponse(`项目 ${args.id} 代理已重启`);
  }

  @Tool({
    name: 'switch_config',
    description: '热切换代理目标地址（修改后需要重启代理才能生效）',
    parameters: z.object({
      id: z.number().describe('项目ID'),
      destination: z.string().describe('新的目标地址，如 https://api.example.com'),
    }),
  })
  async switchConfig(args: { id: number; destination: string }, _context: Context) {
    const success = await this.projectService.switchConfig(args.id, args.destination);
    if (!success) {
      return McpResponse('切换失败：项目不存在');
    }
    return McpResponse(`项目 ${args.id} 目标地址已切换为 ${args.destination}，请重启代理使其生效`);
  }

  @Tool({
    name: 'get_cookie',
    description: '获取项目的模拟 cookie（用于代理请求的身份认证）',
    parameters: z.object({
      id: z.number().describe('项目ID'),
    }),
  })
  async getCookie(args: { id: number }, _context: Context) {
    const cookie = await this.projectService.getCookie(args.id);
    return McpResponse(cookie);
  }
}
