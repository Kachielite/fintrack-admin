import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { UserStatsResponse } from '@/types/admin.types';

export function useUserStats(dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_STATS, dateRange],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: UserStatsResponse }>(API_ENDPOINTS.USER_STATS, {
        params: dateRange,
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
