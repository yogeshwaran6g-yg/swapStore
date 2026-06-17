import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoanEligibility, fetchMyLoans, requestNewLoan } from '../services/loanApiService';

export function useLoanEligibility() {
  return useQuery({
    queryKey: ['loanEligibility'],
    queryFn: getLoanEligibility,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMyLoans() {
  return useQuery({
    queryKey: ['myLoans'],
    queryFn: fetchMyLoans,
  });
}

export function useRequestLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestNewLoan,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['myLoans'] });
    },
  });
}
