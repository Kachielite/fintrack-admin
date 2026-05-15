import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { RegexCorrectionsResponse } from '@/types/admin.types';

export function useRegexCorrections(dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.REGEX_CORRECTIONS, dateRange],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: RegexCorrectionsResponse }>(API_ENDPOINTS.REGEX_CORRECTIONS, {
        params: dateRange,
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
