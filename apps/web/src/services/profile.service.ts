import { api } from '@/lib/axios';

export const profileService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.patch(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => {
    return api.delete(`/users/addresses/${id}`);
  },

  // Location APIs
  getCountries: () => {
    return api.get("/locations/countries");
  },
  getStates: (countryId: string) => {
    return api.get(`/locations/states?countryId=${countryId}`);
  },
  getCities: (stateId: string) => {
    return api.get(`/locations/cities?stateId=${stateId}`);
  },

  updatePassword: (data: any) => {
    return api.patch("/users/password", data);
  },

  updateNotifications: (data: any) => {
    return api.patch("/users/notifications", data);
  }
};
