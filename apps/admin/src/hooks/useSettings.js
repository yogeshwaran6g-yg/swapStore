import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../services/settingsService';
import toast from 'react-hot-toast';

export const useSettings = () => {
  return useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSettings,
  });
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
