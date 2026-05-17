import { mockConfig } from './mockConfig';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const successResponse = (data = null, msg = '操作成功') => ({
  code: 0,
  msg,
  data,
});

const errorResponse = (msg = '操作失败') => ({
  code: -1,
  msg,
  data: null,
});

export const mockApiRoutes = {
  async 'project/list'(params) {
    console.log('[Mock API] project/list called with params:', params);
    await delay();
    const projects = mockConfig.getMockProjects();
    let filteredProjects = projects;
    
    if (params?.name) {
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(params.name.toLowerCase())
      );
    }
    
    console.log('[Mock API] project/list returning:', filteredProjects.length, 'items');
    return successResponse({
      list: filteredProjects,
      total: filteredProjects.length,
    });
  },
  
  async 'project/info'(params) {
    console.log('[Mock API] project/info called with params:', params);
    await delay();
    const projects = mockConfig.getMockProjects();
    const project = projects.find(p => p.id === Number(params.id));
    
    if (project) {
      console.log('[Mock API] project/info found:', project.name);
      const configs = project.configs && project.configs.length > 0 
        ? project.configs 
        : [
            {
              targetAddress: project.destination,
              headers: {
                cookie: '',
              },
            },
          ];
      return successResponse({
        ...project,
        configs,
      });
    }
    console.log('[Mock API] project/info not found');
    return errorResponse('项目不存在');
  },
  
  async 'project/create'(params) {
    console.log('[Mock API] project/create called with params:', params);
    await delay(500);
    
    const projects = mockConfig.getMockProjects();
    const exists = projects.find(p => p.name === params.name);
    if (exists) {
      console.log('[Mock API] project/create name exists:', params.name);
      return errorResponse('项目名称已存在');
    }
    
    console.log('[Mock API] project/create adding new project');
    const newProject = mockConfig.addMockProject({
      name: params.name,
      port: params.port,
      description: params.description,
      destination: params.configs?.[0]?.targetAddress || '',
      config: params.description || params.name.substring(0, 20),
      configs: params.configs || [],
    });
    
    console.log('[Mock API] project/create success:', newProject);
    return successResponse(newProject, '创建成功');
  },
  
  async 'project/modify'(params) {
    console.log('[Mock API] project/modify called with params:', params);
    await delay(500);
    
    const projects = mockConfig.getMockProjects();
    const exists = projects.find(p => p.name === params.name && p.id !== Number(params.id));
    if (exists) {
      return errorResponse('项目名称已存在');
    }
    
    const updated = mockConfig.updateMockProject(Number(params.id), {
      name: params.name,
      port: params.port,
      description: params.description,
      destination: params.configs?.[0]?.targetAddress || '',
      configs: params.configs || [],
    });
    
    if (updated) {
      return successResponse(updated, '修改成功');
    }
    return errorResponse('项目不存在');
  },
  
  async 'project/delete'(params) {
    console.log('[Mock API] project/delete called with params:', params);
    await delay(300);
    
    const deleted = mockConfig.deleteMockProject(Number(params.id));
    if (deleted) {
      return successResponse(null, '删除成功');
    }
    return errorResponse('项目不存在');
  },
  
  async 'project/checkProjectName'(params) {
    console.log('[Mock API] project/checkProjectName called with params:', params);
    await delay(200);
    
    const projects = mockConfig.getMockProjects();
    const exists = projects.find(p => p.name === params.name);
    
    if (exists) {
      return successResponse({ exists: true });
    }
    return successResponse({ exists: false });
  },
  
  async 'project/requestProjectPort'() {
    console.log('[Mock API] project/requestProjectPort called');
    await delay(400);
    
    const usedPorts = mockConfig.getMockProjects().map(p => p.port);
    let newPort;
    do {
      newPort = Math.floor(Math.random() * 50000) + 10000;
    } while (usedPorts.includes(newPort));
    
    return successResponse({ port: newPort }, '端口获取成功');
  },
  
  async 'project/switchConfig'(params) {
    console.log('[Mock API] project/switchConfig called with params:', params);
    await delay(600);
    
    const updated = mockConfig.updateMockProject(Number(params.id), {
      destination: params.destination,
    });
    
    if (updated) {
      return successResponse(null, '配置切换成功');
    }
    return errorResponse('操作失败');
  },
  
  async 'project/action/start'(params) {
    console.log('[Mock API] project/action/start called with params:', params);
    await delay(800);
    
    const updated = mockConfig.updateMockProject(Number(params.id), {
      status: 'running',
    });
    
    if (updated) {
      return successResponse(null, '启动成功');
    }
    return errorResponse('启动失败');
  },
  
  async 'project/action/stop'(params) {
    console.log('[Mock API] project/action/stop called with params:', params);
    await delay(600);
    
    const updated = mockConfig.updateMockProject(Number(params.id), {
      status: 'stopped',
    });
    
    if (updated) {
      return successResponse(null, '停止成功');
    }
    return errorResponse('停止失败');
  },
  
  async 'project/action/restart'(params) {
    console.log('[Mock API] project/action/restart called with params:', params);
    await delay(1000);
    
    const updated = mockConfig.updateMockProject(Number(params.id), {
      status: 'running',
    });
    
    if (updated) {
      return successResponse(null, '重启成功');
    }
    return errorResponse('重启失败');
  },
  
  async 'project/action/getCookie'(params) {
    console.log('[Mock API] project/action/getCookie called with params:', params);
    await delay(300);
    
    return successResponse({
      cookie: `SESSIONID=mock_${params.id}_${Date.now()}`,
    });
  },
  
  async 'user/signin'(params) {
    console.log('[Mock API] user/signin called with params:', params);
    await delay(500);
    
    if (params.username && params.password) {
      return successResponse({
        token: 'mock_jwt_token',
        userInfo: {
          id: 1,
          username: params.username,
          name: '测试用户',
        },
      }, '登录成功');
    }
    return errorResponse('用户名或密码错误');
  },
  
  async 'user/signout'() {
    console.log('[Mock API] user/signout called');
    await delay(200);
    return successResponse(null, '退出成功');
  },
  
  async 'user/userInfo'() {
    console.log('[Mock API] user/userInfo called');
    await delay(300);
    return successResponse({
      id: 1,
      username: 'admin',
      name: '管理员',
    });
  },
};

export const handleMockRequest = async (url, params) => {
  console.log('[Mock API] handleMockRequest called with url:', url, 'params:', params);
  
  const path = url.replace(/^\//, '');
  console.log('[Mock API] path after stripping /:', path);
  
  if (mockApiRoutes[path]) {
    console.log('[Mock API] Found route:', path);
    try {
      const result = await mockApiRoutes[path](params);
      console.log('[Mock API] Route result:', result);
      return result;
    } catch (error) {
      console.error('[Mock API] Error in route handler:', error);
      return errorResponse('服务器内部错误');
    }
  }
  
  console.log('[Mock API] Route not found:', path);
  return errorResponse(`未找到模拟接口: ${url}`);
};
