import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth";

export const refreshAccessToken = async () => {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await authService.refresh(refreshToken);

  authStorage.setAccessToken(response.data.accessToken);
  authStorage.setRefreshToken(response.data.refreshToken);

  return response.data.accessToken;
};
