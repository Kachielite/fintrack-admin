import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { RegexGapsResponse } from '@/types/admin.types';

export function useRegexGaps() {
  return useQuery({
    queryKey: [QUERY_KEYS.REGEX_GAPS],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: RegexGapsResponse }>(API_ENDPOINTS.REGEX_GAPS);
      return data.data;
    },
    staleTime: 60_000,
  });
}
