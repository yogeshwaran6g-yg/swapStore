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
  const formatBalance = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '0.00';
    if (num > 1_000_000) {
      return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
    }
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(num);
  };

  return (
    <div
      className={`bg-white/[0.02] backdrop-blur-md p-5 rounded-2xl flex flex-col items-center justify-center border ${borderColor} transition-all duration-300 hover:bg-white/[0.05] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-1 group min-w-0 overflow-hidden`}
    >
      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors shrink-0">{networkName}</span>
      {isLoading ? (
        <div className="animate-pulse h-10 w-28 bg-white/5 rounded-lg mt-1 shrink-0"></div>
      ) : (
        <div className="flex items-baseline justify-center gap-1.5 w-full min-w-0">
          <span 
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate" 
            title={Number(balance).toFixed(6)}
          >
            {formatBalance(balance)}
          </span>
          <span className={`${accentColor} text-sm sm:text-lg font-bold opacity-90 shrink-0`}>{tokenSymbol}</span>
        </div>
      )}
    </div>
  );
}
