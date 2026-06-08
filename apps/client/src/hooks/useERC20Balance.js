import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20Abi } from '../config/constants';

/**
 * Generic reusable hook to fetch any ERC20 token balance on any chain.
 *
 * @param {Object} options
 * @param {string} options.contractAddress - The token contract address
 * @param {number} options.chainId        - The chain ID to query
 * @param {number} options.decimals       - Token decimals (e.g. 6, 18)
 * @param {string} options.walletAddress  - The user's wallet address
 * @param {boolean} options.enabled       - Whether the query should run
 * @returns {{ formattedBalance: string, rawBalance: bigint|undefined, isLoading: boolean }}
 */
export function useERC20Balance({
  contractAddress,
  chainId,
  decimals = 18,
  walletAddress,
  enabled = false,
}) {
  const { data: rawBalance, isLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress],
    chainId,
    query: {
      enabled: enabled && !!walletAddress && !!contractAddress,
    },
  });

  const formattedBalance =
    rawBalance !== undefined ? formatUnits(rawBalance, decimals) : '0.00';

  return { formattedBalance, rawBalance, isLoading };
}
