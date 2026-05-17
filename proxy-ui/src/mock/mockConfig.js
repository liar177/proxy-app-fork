let mockMode = false;
let customMockData = {};
let listeners = [];

const defaultMockProjects = [
  { id: 1, name: 'eema', config: '50', address: 'http://localhost:1880', destination: 'https://10.42.2.50', status: 'running', description: '生产环境代理' },
  { id: 2, name: '现场问题排查-rmsm', config: '100', address: 'http://localhost:1301', destination: 'https://10.3.190.100/', status: 'stopped', description: '测试环境代理' },
  { id: 3, name: 'ctm02zptr', config: '22.10.102.104', address: 'http://localhost:20245', destination: 'https://22.10.102.104/', status: 'running', description: '开发环境代理' },
  { id: 4, name: '和田定制', config: '10.19.134.65', address: 'http://localhost:1040', destination: 'https://10.19.134.65/', status: 'stopped', description: '定制项目代理' },
  { id: 5, name: 'ermw-dual', config: '218.202.209.154', address: 'http://localhost:35196', destination: 'https://218.202.209.154:1443/', status: 'running', description: '双环境代理' },
];

let mockProjects = [...defaultMockProjects];

const notifyListeners = () => {
  listeners.forEach(listener => listener(mockMode));
};

export const mockConfig = {
  getMockMode: () => mockMode,
  
  setMockMode: (enabled) => {
    mockMode = enabled;
    if (!enabled) {
      mockProjects = [...defaultMockProjects];
      customMockData = {};
    }
    notifyListeners();
  },
  
  toggleMockMode: () => {
    mockConfig.setMockMode(!mockMode);
  },
  
  addListener: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  getMockProjects: () => [...mockProjects],
  
  setMockProjects: (projects) => {
    mockProjects = [...projects];
  },
  
  addMockProject: (project) => {
    const newId = Math.max(...mockProjects.map(p => p.id), 0) + 1;
    const newProject = {
      ...project,
      id: newId,
      address: `http://localhost:${Math.floor(Math.random() * 50000) + 10000}`,
      status: 'stopped',
    };
    mockProjects.push(newProject);
    return newProject;
  },
  
  updateMockProject: (id, updates) => {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProjects[index] = { ...mockProjects[index], ...updates };
      return mockProjects[index];
    }
    return null;
  },
  
  deleteMockProject: (id) => {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = mockProjects[index];
      mockProjects.splice(index, 1);
      return deleted;
    }
    return null;
  },
  
  getCustomMockData: (key) => customMockData[key],
  
  setCustomMockData: (key, data) => {
    customMockData[key] = data;
  },
  
  clearCustomMockData: (key) => {
    delete customMockData[key];
  },
  
  resetToDefault: () => {
    mockProjects = [...defaultMockProjects];
    customMockData = {};
  },
  
  getDefaultProjects: () => [...defaultMockProjects],
};
