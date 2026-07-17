import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { measurementService } from "@/services/measurement.service";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

export function useMeasurementTypes() {
  return useQuery({
    queryKey: ["measurement-types"],
    queryFn: async () => {
      const res = await measurementService.getTypes();
      return res || [];
    },
  });
}

export function useMeasurements() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["measurements"],
    queryFn: async () => {
      const res = await measurementService.getAll();
      return res || [];
    },
    enabled: isAuthenticated,
  });
}

export function useAddMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; isDefault?: boolean; values: { type: string; value: number; customName?: string }[] }) => {
      return measurementService.create(data);
    },
    onSuccess: () => {
      toast.success("Measurement profile added successfully");
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add measurement profile");
    },
  });
}

export function useUpdateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isDefault?: boolean; values?: { type: string; value: number; customName?: string }[] } }) => {
      return measurementService.update(id, data);
    },
    onSuccess: () => {
      toast.success("Measurement profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update measurement profile");
    },
  });
}

export function useDeleteMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return measurementService.delete(id);
    },
    onSuccess: () => {
      toast.success("Measurement profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete measurement profile");
    },
  });
}

export function useSetDefaultMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return measurementService.setDefault(id);
    },
    onSuccess: () => {
      toast.success("Default measurement profile updated");
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to set default measurement profile");
    },
  });
}
