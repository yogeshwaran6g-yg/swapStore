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
      className={`w-full bg-[#0a0a14] p-5 sm:p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between border ${borderColor} transition-all duration-300 relative gap-6`}
    >
      {/* 3D Image on the right */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none hidden sm:flex items-center justify-end z-20">
        <img src={`/${tokenSymbol.toLowerCase()}.png`} alt={tokenSymbol} className="h-full object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-500" />
      </div>

      <div className="flex items-center gap-5 w-full sm:w-auto z-10">
        <div className="flex flex-col">
          <span className="text-white text-xl font-bold tracking-wide">{tokenSymbol} Balances</span>
          <span className="text-zinc-500 text-sm font-medium mt-0.5">{networkName}</span>
        </div>
      </div>

      <div className="w-full sm:w-auto z-10 sm:mr-24 lg:mr-32">
        {isLoading ? (
          <div className="animate-pulse h-14 w-36 bg-white/5 rounded-2xl border border-white/5 shrink-0"></div>
        ) : (
          <div className="flex items-center justify-between sm:justify-center gap-3 w-full min-w-[160px] bg-black/60 border border-white/5 rounded-2xl px-5 py-3 transition-colors">
            <div className="flex items-baseline gap-2">
              <span 
                className="text-3xl font-black text-white tracking-tight" 
                title={Number(balance).toFixed(6)}
              >
                {formatBalance(balance)}
              </span>
              <span className={`${accentColor} text-sm font-bold opacity-90`}>{tokenSymbol}</span>
            </div>
            <svg className="w-4 h-4 text-zinc-500 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </div>
        )}
      </div>
    </div>
  );
}
