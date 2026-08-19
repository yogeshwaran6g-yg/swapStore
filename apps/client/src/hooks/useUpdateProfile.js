import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/services/authApiService';
import {toast } from "react-hot-toast";


/**
 * React Query mutation hook for updating user profile basic info.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate profile query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success("Profile updated succesfully")
    },
    onError: (error) => {
      console.log(error)
    }
  });
}
