import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { exchangeRateService } from '../services/exchangeRateService';

export const useExchangeRates = () => {
  const queryClient = useQueryClient();

  // Fetch rates query
  const { data: rates = [], isLoading, error, refetch } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: exchangeRateService.getRates,
  });

  // Add rate mutation
  const addRateMutation = useMutation({
    mutationFn: async ({ token, network, rate, isActive = true }) => {
      const data = {
        tokenSymbol: token.toUpperCase(),
        network: network.toUpperCase(),
        inrRate: parseFloat(rate),
        isActive
      };
      return await exchangeRateService.addRate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeRates'] });
      toast.success('Exchange rate added successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to add exchange rate');
    }
  });

  // Update rate mutation
  const updateRateMutation = useMutation({
    mutationFn: async ({ rateObj, newInrRate, newIsActive }) => {
      const data = {
        tokenSymbol: rateObj.token_symbol,
        network: rateObj.network,
        inrRate: newInrRate !== undefined ? parseFloat(newInrRate) : rateObj.inr_rate,
        isActive: newIsActive !== undefined ? newIsActive : (rateObj.is_active === 1)
      };
      return await exchangeRateService.updateRate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeRates'] });
      toast.success('Exchange rate updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to update exchange rate');
    }
  });

  return {
    rates,
    loading: isLoading,
    error,
    fetchRates: refetch,
    addRate: (token, network, rate, isActive) => addRateMutation.mutateAsync({ token, network, rate, isActive }),
    updateRate: (rateObj, newInrRate, newIsActive) => updateRateMutation.mutateAsync({ rateObj, newInrRate, newIsActive }),
  };
};
