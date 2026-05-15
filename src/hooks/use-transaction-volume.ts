import { useQuery } from '@tanstack/react-query';
import apiClient from '@/network/api-client';
import { QUERY_KEYS } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { TransactionVolumeResponse } from '@/types/admin.types';

export function useTransactionVolume(dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION_VOLUME, dateRange],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: TransactionVolumeResponse }>(API_ENDPOINTS.TRANSACTION_VOLUME, {
        params: dateRange,
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
