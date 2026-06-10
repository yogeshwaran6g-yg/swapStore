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
      className={`bg-white/[0.02] backdrop-blur-md p-5 rounded-2xl flex flex-col items-center justify-center border ${borderColor} transition-all duration-300 hover:bg-white/[0.05] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-1 group`}
    >
      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors">{networkName}</span>
      {isLoading ? (
        <div className="animate-pulse h-10 w-28 bg-white/5 rounded-lg mt-1"></div>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {Number(balance).toFixed(2)}
          </span>
          <span className={`${accentColor} text-lg font-bold opacity-90`}>{tokenSymbol}</span>
        </div>
      )}
    </div>
  );
}
