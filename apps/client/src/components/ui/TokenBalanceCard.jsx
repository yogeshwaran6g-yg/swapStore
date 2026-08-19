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
  accentColor = 'text-[#7C3AED]',
  borderColor = 'border-[#7C3AED]/10',
  icon = null,
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
      className={`bg-white/60 p-4 rounded-2xl flex items-center justify-between border ${borderColor} transition-all duration-300 hover:bg-white hover:-translate-y-1 group min-w-0 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]`}
    >
      <div className="flex flex-col items-start">
        <span className="text-[#94A3B8] text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-[#64748B] transition-colors">{networkName}</span>
        {isLoading ? (
          <div className="animate-pulse h-8 w-24 bg-gray-100 rounded-lg mt-0.5"></div>
        ) : (
          <div className="flex items-baseline gap-1.5 w-full min-w-0">
            <span 
              className={`text-xl font-extrabold ${accentColor} tracking-tight truncate`} 
              title={Number(balance).toFixed(6)}
            >
              {formatBalance(balance)}
            </span>
            <span className={`${accentColor} text-sm font-bold opacity-80 shrink-0`}>{tokenSymbol}</span>
          </div>
        )}
      </div>
      {icon && (
        <div className="text-2xl opacity-90 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
    </div>
  );
}
