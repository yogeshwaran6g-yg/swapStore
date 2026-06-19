import React from 'react';

const TOKEN_LOGOS = {
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  DAI:  'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
};

const NETWORK_LOGOS = {
  bnb:     'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  polygon: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
};

export const TokenNetworkCell = ({ token, network }) => (
  <div className="flex items-center gap-2">
    {/* Token */}
    <div className="flex items-center gap-1.5">
      <img
        src={TOKEN_LOGOS[token?.toUpperCase()] || ''}
        alt={token}
        className="w-5 h-5 rounded-full border border-zinc-700 bg-white"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <span className="text-xs font-bold text-zinc-200">{token}</span>
    </div>
    <span className="text-zinc-600">·</span>
    {/* Network */}
    <div className="flex items-center gap-1.5">
      <img
        src={NETWORK_LOGOS[network?.toLowerCase()] || ''}
        alt={network}
        className="w-4 h-4 rounded-full border border-zinc-700"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <span className="text-xs font-semibold text-zinc-400 capitalize">{network}</span>
    </div>
  </div>
);
