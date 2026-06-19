import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/axios';
import { useAuth } from '@/hooks/useAuth';

export function useUserSwaps() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['userSwaps'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/swap/user/swaps');
      return response?.data?.swaps || response?.swaps || [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}
