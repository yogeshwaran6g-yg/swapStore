import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cronService } from '../services/cronService';

export const useCron = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: cronData, isLoading: historyLoading, isFetching: isHistoryFetching, refetch: refetchHistory } = useQuery({
    queryKey: ['cronHistory', page],
    queryFn: () => cronService.getCronHistory({ page, limit }),
    keepPreviousData: true,
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
    cronHistory: cronData?.runs || [],
    pagination: cronData?.pagination || null,
    historyLoading: historyLoading || isHistoryFetching,
    refetchHistory: async () => {
      const result = await refetchHistory();
      if (result.isError) toast.error('Failed to refresh history');
      else toast.success('History refreshed successfully');
    },
    page,
    setPage,
    loansUsers,
    usersLoading,
    settings,
    settingsLoading,
    runInterestCollection: (payload) => runMutation.mutateAsync(payload),
    isRunning: runMutation.isPending,
  };
};
