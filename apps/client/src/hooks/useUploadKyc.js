import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadKycDocument } from '@/services/loanApiService';
import {toast } from "react-hot-toast";
/**
 * React Query mutation hook for uploading KYC documents.
 */
export function useUploadKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadKycDocument,
    onSuccess: () => {
      // Invalidate profile to refetch and show updated KYC status if applicable
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success("successfully uploaded document")
    },
    onError: () => {
      toast.error("unable to upload document")
    }
  });
}
