import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { IngestionTimelineResponse } from '@/types/admin.types';

export function useIngestionTimeline(dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.INGESTION_TIMELINE, dateRange],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: IngestionTimelineResponse }>(API_ENDPOINTS.INGESTION_TIMELINE, {
        params: dateRange,
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
