import { useQuery } from '@tanstack/react-query';
import { fetchRates } from '@/services/rateApiService';

const FALLBACK_RATES = { 
  USDT_bnb: 85, USDC_bnb: 85, DAI_bnb: 85,
  USDT_polygon: 85, USDC_polygon: 85, DAI_polygon: 85
};

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
    placeholderData: FALLBACK_RATES,
  });

  return {
    rates: data ?? FALLBACK_RATES,
    isLoading,
    isError,
    error,
  };
}
