import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';

export const useUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['users', page],
    queryFn: () => userService.getAllUsers({ page, limit }),
    keepPreviousData: true,
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
    users: data?.users || [],
    pagination: data?.pagination || null,
    loading: isLoading || isFetching,
    error,
    page,
    setPage,
    fetchUsers: async () => {
      const result = await refetch();
      if (result.isError) toast.error('Failed to refresh users');
      else toast.success('Users refreshed successfully');
    },
    toggleBlock: (uid, is_blocked) => toggleBlockMutation.mutateAsync({ uid, is_blocked }),
  };
};
