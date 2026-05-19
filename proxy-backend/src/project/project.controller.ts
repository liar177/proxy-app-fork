import { Controller, Post, Body } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post('list')
  async getProjectList(@Body() body: { name?: string }) {
    try {
      const result = await this.projectService.getProjects(body.name);
      return {
        code: 0,
        msg: '操作成功',
        data: result,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }

  @Post('info')
  async getProjectInfo(@Body() body: { id: number }) {
    try {
      const project = await this.projectService.getProjectInfo(body.id);
      if (project) {
        return {
          code: 0,
          msg: '操作成功',
          data: project,
        };
      }
      return {
        code: -1,
        msg: '项目不存在',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }

  @Post('create')
  async createProject(@Body() body: {
    name: string;
    port: number;
    description: string;
    configs?: Array<{ targetAddress: string; headers?: Record<string, string> }>;
  }) {
    try {
      const project = await this.projectService.createProject(body);
      if (project) {
        return {
          code: 0,
          msg: '创建成功',
          data: project,
        };
      }
      return {
        code: -1,
        msg: '项目名称已存在',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }

  @Post('modify')
  async modifyProject(@Body() body: {
    id: number;
    name: string;
    port: number;
    description: string;
    configs?: Array<{ targetAddress: string; headers?: Record<string, string> }>;
  }) {
    try {
      const project = await this.projectService.modifyProject(body.id, body);
      if (project) {
        return {
          code: 0,
          msg: '修改成功',
          data: project,
        };
      }
      return {
        code: -1,
        msg: '项目名称已存在或项目不存在',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }

  @Post('delete')
  async deleteProject(@Body() body: { id: number }) {
    try {
      const success = await this.projectService.deleteProject(body.id);
      if (success) {
        return {
          code: 0,
          msg: '删除成功',
          data: null,
        };
      }
      return {
        code: -1,
        msg: '项目不存在',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }

  @Post('checkProjectName')
  async checkProjectName(@Body() body: { name: string }) {
    try {
      const exists = await this.projectService.checkProjectName(body.name);
      return {
        code: 0,
        msg: '操作成功',
        data: { exists },
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }

  @Post('requestProjectPort')
  async requestProjectPort() {
    try {
      const port = await this.projectService.requestProjectPort();
      return {
        code: 0,
        msg: '端口获取成功',
        data: { port },
      };
    } catch (error) {
      return {
        code: -1,
        msg: '端口获取失败',
        data: null,
      };
    }
  }

  @Post('switchConfig')
  async switchConfig(@Body() body: { id: number; destination: string }) {
    try {
      const success = await this.projectService.switchConfig(body.id, body.destination);
      if (success) {
        return {
          code: 0,
          msg: '配置切换成功',
          data: null,
        };
      }
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }

  @Post('action/start')
  async startAction(@Body() body: { id: number }) {
    try {
      const success = await this.projectService.startProject(body.id);
      if (success) {
        return {
          code: 0,
          msg: '启动成功',
          data: null,
        };
      }
      return {
        code: -1,
        msg: '启动失败',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '启动失败',
        data: null,
      };
    }
  }

  @Post('action/stop')
  async stopAction(@Body() body: { id: number }) {
    try {
      const success = await this.projectService.stopProject(body.id);
      if (success) {
        return {
          code: 0,
          msg: '停止成功',
          data: null,
        };
      }
      return {
        code: -1,
        msg: '停止失败',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '停止失败',
        data: null,
      };
    }
  }

  @Post('action/restart')
  async restartAction(@Body() body: { id: number }) {
    try {
      const success = await this.projectService.restartProject(body.id);
      if (success) {
        return {
          code: 0,
          msg: '重启成功',
          data: null,
        };
      }
      return {
        code: -1,
        msg: '重启失败',
        data: null,
      };
    } catch (error) {
      return {
        code: -1,
        msg: '重启失败',
        data: null,
      };
    }
  }

  @Post('action/getCookie')
  async getCookie(@Body() body: { id: number }) {
    try {
      const cookie = await this.projectService.getCookie(body.id);
      return {
        code: 0,
        msg: '操作成功',
        data: { cookie },
      };
    } catch (error) {
      return {
        code: -1,
        msg: '操作失败',
        data: null,
      };
    }
  }
}
