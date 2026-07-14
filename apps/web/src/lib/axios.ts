import axios from "axios";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

import { authStorage, refreshAccessToken } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;

let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const accessToken = await refreshAccessToken();

        if (!accessToken) {
          authStorage.clear();

          return Promise.reject(error);
        }

        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        authStorage.clear();

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    toast.error(
      (error.response?.data as { message?: string })?.message ??
        "Something went wrong",
    );

    return Promise.reject(error);
  },
);
