import { authStorage } from "./auth-storage";

export const isAuthenticated = () => {
  return !!authStorage.getAccessToken();
};
