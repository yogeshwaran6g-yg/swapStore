import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { loanService } from '../services/loanService';

export const useLoans = () => {
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading, error, refetch } = useQuery({
    queryKey: ['loans'],
    queryFn: loanService.getAllLoans,
  });

  const approveLoanMutation = useMutation({
    mutationFn: loanService.approveLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan approved successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to approve loan');
    }
  });

  return {
    loans,
    loading: isLoading,
    error,
    fetchLoans: refetch,
    approveLoan: (payload) => approveLoanMutation.mutateAsync(payload),
  };
};
