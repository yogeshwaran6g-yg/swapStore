import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { kycService } from '../services/kycService';

export const useKyc = () => {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['kyc'],
    queryFn: kycService.getPendingKyc,
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
    documents,
    loading: isLoading,
    error,
    fetchKyc: refetch,
    updateStatus: (id, status) => updateKycStatusMutation.mutateAsync({ id, status }),
  };
};
