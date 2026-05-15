import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { RegexTemplateListResponse } from '@/types/admin.types';

export function useRegexTemplates() {
  return useQuery({
    queryKey: [QUERY_KEYS.REGEX_TEMPLATES],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: RegexTemplateListResponse }>(API_ENDPOINTS.REGEX_TEMPLATES);
      return data.data;
    },
    staleTime: 60_000,
  });
}
