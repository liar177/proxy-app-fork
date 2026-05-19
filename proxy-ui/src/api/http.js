import axios from "axios";
import { message } from 'antd';
import { getGlobalNavigate } from "../components/NavigateComponent";
import { mockConfig } from "../mock/mockConfig";
import { handleMockRequest } from "../mock/mockApi";

const http = axios.create({
  baseURL: "/api-proxy/",
  withCredentials: true,
  timeout: 30000,
  errorNotify: true,
  successNotify: true,
});

http.interceptors.request.use(async (config) => {
  if (mockConfig.getMockMode()) {
    const url = config.url?.replace(/^\/api-proxy\//, '') || '';
    const params = config.data || {};
    
    console.log(`[Mock Mode] Intercepted request: ${url}`, params);
    
    const mockResponse = await handleMockRequest(url, params);
    console.log(`[Mock Mode] Mock response:`, mockResponse);
    
    return Promise.reject({
      isMock: true,
      mockResponse: mockResponse,
      originalConfig: config,
    });
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

http.interceptors.response.use((response) => {
  const config = response.config;
  const result = response.data;
  const { code, msg } = result;
  
  if (code === 0) {
    msg && config?.successNotify !== false && message.success(msg);
  } else {
    msg && config?.errorNotify !== false && message.error(msg);
  }
  return result;
}, (error) => {
  if (error.isMock) {
    console.log('[Mock Mode] Handling mock response from error handler');
    
    const { code, msg } = error.mockResponse;
    const originalConfig = error.originalConfig || {};
    
    if (code === 0) {
      msg && originalConfig?.successNotify !== false && message.success(msg);
    } else {
      msg && originalConfig?.errorNotify !== false && message.error(msg);
    }
    
    return Promise.resolve(error.mockResponse);
  }

  const navigate = getGlobalNavigate();
  if (error.response && (error.response.status === 401)) {
    if (navigate) {
      navigate("/");
    } else {
      window.location.href = '/';
    }
  }
  console.error('[HTTP Error]', error);
  return Promise.reject(error);
});

export default http;
