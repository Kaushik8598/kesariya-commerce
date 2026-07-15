import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

export function useProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await profileService.getProfile();
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await profileService.updateProfile(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });
}

export function useAddresses() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await profileService.getAddresses();
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await profileService.addAddress(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add address");
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await profileService.updateAddress(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update address");
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await profileService.deleteAddress(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete address");
    },
  });
}

// Location Hooks
export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await profileService.getCountries();
      return res.data?.data || [];
    },
  });
}

export function useStates(countryId: string) {
  return useQuery({
    queryKey: ["states", countryId],
    queryFn: async () => {
      const res = await profileService.getStates(countryId);
      return res.data?.data || [];
    },
    enabled: !!countryId,
  });
}

export function useCities(stateId: string) {
  return useQuery({
    queryKey: ["cities", stateId],
    queryFn: async () => {
      const res = await profileService.getCities(stateId);
      return res.data?.data || [];
    },
    enabled: !!stateId,
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await profileService.updatePassword(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
  });
}

export function useUpdateNotifications() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await profileService.updateNotifications(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Notification preferences updated");
    },
  });
}
