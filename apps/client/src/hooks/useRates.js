import { useQuery } from '@tanstack/react-query';
import { fetchRates } from '@/services/rateApiService';

/**
 * React Query hook to fetch exchange rates.
 * Auto-refetches every 60 seconds.
 *
 * @returns {{ rates: Record<string, number>, isLoading: boolean, isError: boolean, error: unknown }}
 */
export function useRates() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchRates,
    staleTime: 30 * 1000,       // 30s before considered stale
    refetchInterval: 60 * 1000, // refetch every 60s
    placeholderData: { USDT: 85, USDC: 85, DAI: 85 },
  });

  return {
    rates: data ?? { USDT: 85, USDC: 85, DAI: 85 },
    isLoading,
    isError,
    error,
  };
}
