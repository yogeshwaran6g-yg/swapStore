import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { loanService } from '../services/loanService';

export const useLoans = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['loans', page],
    queryFn: () => loanService.getAllLoans({ page, limit }),
    keepPreviousData: true,
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

  const rejectLoanMutation = useMutation({
    mutationFn: loanService.rejectLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan rejected successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to reject loan');
    }
  });

  const updateLoanDetailsMutation = useMutation({
    mutationFn: loanService.updateLoanDetails,
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to update loan details');
    }
  });

  const manualCollectMutation = useMutation({
    mutationFn: loanService.manualCollect,
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Manual collection failed');
    }
  });

  return {
    loans: data?.loans || [],
    pagination: data?.pagination || null,
    loading: isLoading || isFetching,
    error,
    page,
    setPage,
    fetchLoans: async () => {
      const result = await refetch();
      if (result.isError) toast.error('Failed to refresh loans');
      else toast.success('Loans refreshed successfully');
    },
    approveLoan: (payload) => approveLoanMutation.mutateAsync(payload),
    rejectLoan: (uid) => rejectLoanMutation.mutateAsync(uid),
    updateLoanDetails: (payload) => updateLoanDetailsMutation.mutateAsync(payload),
    manualCollect: (payload) => manualCollectMutation.mutateAsync(payload),
  };
};
