import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBankDetails } from '@/services/authApiService';
import { toast } from "react-hot-toast";

/**
 * React Query mutation hook for updating user bank details.
 */
export function useUpdateBankDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBankDetails,
    onSuccess: () => {
      // Invalidate profile query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.log(error)
    }
  });
}
