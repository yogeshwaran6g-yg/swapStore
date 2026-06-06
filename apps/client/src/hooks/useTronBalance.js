import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';

const fetchTronBalance = async (address) => {
  if (!address) return '0';
  const parameter = "000000000000000000000000" + address.slice(2);
  try {
    const response = await api.post('https://api.trongrid.io/wallet/triggersmartcontract', {
      contract_address: "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",
      function_selector: "balanceOf(address)",
      parameter: parameter,
      owner_address: "410000000000000000000000000000000000000000",
      visible: false
    });
    
    const data = response.data;
    if (data?.constant_result && data.constant_result[0]) {
      return BigInt('0x' + data.constant_result[0]).toString();
    }
  } catch (error) {
    console.error("Failed to fetch Tron balance", error);
  }
  return '0';
};

export function useTronBalance(address, isConnected) {
  return useQuery({
    queryKey: ['tronBalance', address],
    queryFn: () => fetchTronBalance(address),
    enabled: isConnected && !!address,
    refetchInterval: 10000,
  });
}
