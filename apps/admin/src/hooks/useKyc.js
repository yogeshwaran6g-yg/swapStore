import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { kycService } from '../services/kycService';

export const useKyc = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['kyc', page],
    queryFn: () => kycService.getPendingKyc({ page, limit }),
    keepPreviousData: true,
  });

  const updateKycStatusMutation = useMutation({
    mutationFn: kycService.approveKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
      toast.success('KYC status updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to update KYC status');
    }
  });

  return {
    documents: data?.documents || [],
    pagination: data?.pagination || null,
    loading: isLoading || isFetching,
    error,
    page,
    setPage,
    fetchKyc: async () => {
      const result = await refetch();
      if (result.isError) toast.error('Failed to refresh KYC');
      else toast.success('KYC refreshed successfully');
    },
    updateStatus: (id, status) => updateKycStatusMutation.mutateAsync({ id, status }),
  };
};
