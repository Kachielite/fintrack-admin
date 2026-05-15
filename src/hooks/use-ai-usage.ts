import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { AiUsageResponse } from '@/types/admin.types';

export function useAiUsage(dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.AI_USAGE, dateRange],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: AiUsageResponse }>(API_ENDPOINTS.AI_USAGE, {
        params: dateRange,
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
