import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitSwapForm } from '@/services/userApiService';

/**
 * React Query mutation hook for swap form submission.
 *
 * On success, invalidates the user profile query so the pre-filled
 * data stays fresh on next visit.
 *
 * @returns {{ mutate, mutateAsync, isPending, isSuccess, isError, error, reset }}
 */
export function useSubmitSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSwapForm,
    onSuccess: () => {
      // Invalidate profile so next visit re-fetches updated bank details
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
