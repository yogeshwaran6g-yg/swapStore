import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../services/settingsService';
import toast from 'react-hot-toast';

export const useSettings = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSettings,
  });

  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    fetchSettings: async () => {
      const result = await refetch();
      if (result.isError) toast.error('Failed to refresh settings');
      else toast.success('Settings refreshed successfully');
    }
  };
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast.success('Settings updated successfully');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update settings');
    },
  });
};
