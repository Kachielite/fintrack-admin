import { useMutation } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { useAuthStore } from '@/state/auth.state';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { AdminLoginResponse } from '@/types/admin.types';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await apiClient.post<{ success: boolean; data: AdminLoginResponse }>(API_ENDPOINTS.ADMIN_LOGIN, payload);
      return data.data;
    },
    onSuccess: (data, variables) => {
      login(data.access_token, variables.email);
    },
  });
}
