import { api } from '@/lib/axios';

export const measurementService = {
  getTypes: async () => {
    const response = await api.get('/measurements/types');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/measurements');
    return response.data;
  },

  create: async (data: { name: string; isDefault?: boolean; values: { type: string; value: number; customName?: string }[] }) => {
    const response = await api.post('/measurements', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; isDefault?: boolean; values?: { type: string; value: number; customName?: string }[] }) => {
    const response = await api.patch(`/measurements/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/measurements/${id}`);
    return response.data;
  },

  setDefault: async (id: string) => {
    const response = await api.patch(`/measurements/${id}/default`);
    return response.data;
  },
};
