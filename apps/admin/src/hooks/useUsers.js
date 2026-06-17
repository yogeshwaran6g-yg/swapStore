import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  });

  const toggleBlockMutation = useMutation({
    mutationFn: userService.toggleBlockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User block status updated');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to update block status');
    }
  });

  return {
    users,
    loading: isLoading,
    error,
    fetchUsers: refetch,
    toggleBlock: (uid, is_blocked) => toggleBlockMutation.mutateAsync({ uid, is_blocked }),
  };
};
