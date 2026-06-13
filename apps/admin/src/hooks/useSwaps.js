import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { swapService } from '../services/swapService';

export const useSwaps = () => {
  const queryClient = useQueryClient();

  const { data: swaps = [], isLoading, error, refetch } = useQuery({
    queryKey: ['swaps'],
    queryFn: swapService.getAllSwaps,
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
    swaps,
    loading: isLoading,
    error,
    fetchSwaps: refetch,
    updateStatus: (orderId, status) => updateStatusMutation.mutateAsync({ orderId, status }),
  };
};
