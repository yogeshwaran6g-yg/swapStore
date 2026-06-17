import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cronService } from '../services/cronService';

export const useCron = () => {
  const queryClient = useQueryClient();

  const { data: cronHistory = [], isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['cronHistory'],
    queryFn: cronService.getCronHistory,
  });

  const { data: loansUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['activeLoansUsers'],
    queryFn: cronService.getActiveLoansUsers,
  });

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ['cronSettings'],
    queryFn: cronService.getSettings,
  });

  const runMutation = useMutation({
    mutationFn: cronService.runInterestCollection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cronHistory'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      const result = data;
      toast.success(
        `Cron completed: ${result.totalProcessed || 0} loans processed, ${result.successCount || 0} collected, ${result.failCount || 0} failed`
      );
    },
    onError: (error) => {
      toast.error(error?.message || error?.error || 'Failed to run interest collection');
    },
  });

  return {
    cronHistory,
    historyLoading,
    refetchHistory,
    loansUsers,
    usersLoading,
    settings,
    settingsLoading,
    runInterestCollection: (payload) => runMutation.mutateAsync(payload),
    isRunning: runMutation.isPending,
  };
};
