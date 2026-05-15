import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { IngestionHealthResponse } from '@/types/admin.types';

export function useIngestionHealth(dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.INGESTION_HEALTH, dateRange],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: IngestionHealthResponse }>(API_ENDPOINTS.INGESTION_HEALTH, {
        params: dateRange,
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
