import React from 'react';

/**
 * Reusable card component that displays a single token balance on a single chain.
 *
 * @param {Object} props
 * @param {string} props.networkName  - Display name of the network (e.g. "Polygon Network")
 * @param {string} props.balance      - Formatted balance string
 * @param {string} props.tokenSymbol  - Token ticker (e.g. "USDT", "DAI")
 * @param {boolean} props.isLoading   - Whether the balance is still loading
 * @param {string} props.accentColor  - Tailwind text color class for the token symbol (e.g. "text-purple-400")
 * @param {string} props.borderColor  - Tailwind border color class (e.g. "border-purple-500/20")
 */
export function TokenBalanceCard({
  networkName,
  balance,
  tokenSymbol,
  isLoading,
  accentColor = 'text-blue-400',
  borderColor = 'border-blue-500/20',
}) {
  return (
    <div
      className={`bg-zinc-800/50 p-4 rounded-lg flex flex-col items-center justify-center border ${borderColor} transition-all duration-300 hover:bg-zinc-800/80 hover:scale-[1.02]`}
    >
      <span className="text-zinc-400 text-sm mb-1">{networkName}</span>
      {isLoading ? (
        <div className="animate-pulse h-8 w-24 bg-zinc-700 rounded mt-1"></div>
      ) : (
        <span className="text-2xl font-bold text-white">
          {Number(balance).toFixed(2)}{' '}
          <span className={`${accentColor} text-lg`}>{tokenSymbol}</span>
        </span>
      )}
    </div>
  );
}
