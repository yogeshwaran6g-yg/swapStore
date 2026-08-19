import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { swapService } from '../services/swapService';

export const useSwaps = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['swaps', page],
    queryFn: () => swapService.getAllSwaps({ page, limit }),
    keepPreviousData: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: swapService.updateSwapStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      toast.success('Swap status updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to update swap status');
    }
  });

  return {
    swaps: data?.swaps || [],
    pagination: data?.pagination || null,
    loading: isLoading || isFetching,
    error,
    page,
    setPage,
    fetchSwaps: async () => {
      const result = await refetch();
      if (result.isError) toast.error('Failed to refresh swaps');
      else toast.success('Swaps refreshed successfully');
    },
    updateStatus: (orderId, status) => updateStatusMutation.mutateAsync({ orderId, status }),
  };
};
