import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { AdminOverviewResponse } from '@/types/admin.types';

export function useOverview(dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.OVERVIEW, dateRange],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: AdminOverviewResponse }>(API_ENDPOINTS.OVERVIEW, {
        params: dateRange,
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
