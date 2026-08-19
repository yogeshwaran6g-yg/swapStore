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
  borderColor = 'border-gray-100',
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
      className={`bg-white border ${borderColor} rounded-[16px] px-5 py-4 flex items-center justify-between transition-all duration-300 hover:shadow-md group`}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="text-[#94A3B8] text-[10px] font-bold uppercase tracking-widest">{networkName}</span>
        {isLoading ? (
          <div className="animate-pulse h-8 w-24 bg-gray-100 rounded-lg mt-0.5"></div>
        ) : (
          <div className="flex items-baseline gap-1.5 w-full">
            <span 
              className={`text-[22px] font-[800] text-[#1E293B] tracking-tight truncate`} 
              title={Number(balance).toFixed(6)}
            >
              {formatBalance(balance)}
            </span>
            <span className={`${accentColor} text-[13px] font-bold shrink-0`}>{tokenSymbol}</span>
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
