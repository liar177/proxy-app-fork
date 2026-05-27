import axiosInstance from './axiosInstance';

export const todoApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/todos');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/todos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/api/todos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/api/todos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/api/todos/${id}`);
    return response.data;
  },
};