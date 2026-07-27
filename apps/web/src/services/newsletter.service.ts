import { api } from "@/lib/axios";

export const newsletterService = {
  subscribe: (email: string) =>
    api.post<{ success: boolean; message: string }>("/newsletter/subscribe", { email }),
};
