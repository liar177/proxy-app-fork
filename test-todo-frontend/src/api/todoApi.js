import axiosInstance from './axiosInstance';

export const todoApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/todos');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/todos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/todos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/todos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/todos/${id}`);
    return response.data;
  },
};
