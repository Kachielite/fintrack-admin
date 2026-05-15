import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { AuditQueueResponse } from '@/types/admin.types';

export function useAuditQueue() {
  return useQuery({
    queryKey: [QUERY_KEYS.AUDIT_QUEUE],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: AuditQueueResponse }>(API_ENDPOINTS.AUDIT_QUEUE);
      return data.data;
    },
    staleTime: 30_000,
  });
}
