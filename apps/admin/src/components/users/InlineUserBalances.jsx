import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createPublicClient, http, formatUnits } from 'viem';
import { bsc, polygon } from 'viem/chains';

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  }
];

const TOKENS = {
  bnb: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    DAI:  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    DAI:  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  }
};

const bscClient = createPublicClient({ chain: bsc, transport: http() });
const polyClient = createPublicClient({ chain: polygon, transport: http() });

const fetchTokenBalances = async (client, tokenMap, walletAddress) => {
  const balances = {};
  await Promise.all(Object.entries(tokenMap).map(async ([symbol, address]) => {
    try {
      const [balance, decimals] = await Promise.all([
        client.readContract({
          address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [walletAddress]
        }),
        client.readContract({
          address,
          abi: erc20Abi,
          functionName: 'decimals'
        })
      ]);
      balances[symbol] = formatUnits(balance, decimals);
    } catch (e) {
      balances[symbol] = '0';
    }
  }));
  return balances;
};

const InlineUserBalances = ({ walletAddress }) => {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    const fetchBalances = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bscNative, polyNative, bscTokens, polyTokens] = await Promise.all([
          bscClient.getBalance({ address: walletAddress }).catch(() => 0n),
          polyClient.getBalance({ address: walletAddress }).catch(() => 0n),
          fetchTokenBalances(bscClient, TOKENS.bnb, walletAddress),
          fetchTokenBalances(polyClient, TOKENS.polygon, walletAddress)
        ]);

        setBalances({
          bnb: {
            NATIVE: formatUnits(bscNative, 18),
            ...bscTokens
          },
          polygon: {
            NATIVE: formatUnits(polyNative, 18),
            ...polyTokens
          }
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch balances');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [walletAddress]);

  if (!walletAddress) {
    return <div className="p-4 text-zinc-500 text-sm">No wallet address available for this user.</div>;
  }

  return (
    <div className="p-6 bg-[#0a0a0f] shadow-inner border-y border-zinc-800/50">
      <h4 className="text-amber-500 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center space-x-2">
        <span>Wallet Balances</span>
        <span className="text-zinc-500 text-xs normal-case font-mono">({walletAddress})</span>
      </h4>

      {loading ? (
        <div className="flex items-center space-x-3 text-zinc-400">
          <Loader2 size={18} className="animate-spin text-amber-500" />
          <span className="text-sm">Fetching balances...</span>
        </div>
      ) : error ? (
        <div className="text-sm text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
          {error}
        </div>
      ) : balances ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(balances).map(([network, tokens]) => (
            <div key={network} className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
              <div className="text-xs font-bold text-amber-500 capitalize mb-3 flex items-center space-x-2">
                <img 
                  src={network === 'bnb' ? 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025' : 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025'} 
                  alt={network} 
                  className="w-4 h-4" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span>{network}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(tokens).map(([token, amount]) => {
                  const numAmount = parseFloat(amount);
                  return (
                    <div key={token} className="flex flex-col bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                      <span className="text-xs text-zinc-500 font-medium mb-1 flex items-center space-x-1">
                        {token === 'USDT' && <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025" alt="USDT" className="w-3 h-3" />}
                        {token === 'USDC' && <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=025" alt="USDC" className="w-3 h-3" />}
                        {token === 'DAI' && <img src="https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=025" alt="DAI" className="w-3 h-3" />}
                        {token === 'NATIVE' && network === 'bnb' && <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025" alt="BNB" className="w-3 h-3" />}
                        {token === 'NATIVE' && network === 'polygon' && <img src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025" alt="MATIC" className="w-3 h-3" />}
                        <span>{token === 'NATIVE' ? (network === 'bnb' ? 'BNB' : 'MATIC') : token}</span>
                      </span>
                      <span className="text-zinc-100 font-mono text-sm">
                        {numAmount > 0 && numAmount < 0.0001 ? '<0.0001' : numAmount.toFixed(4)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default InlineUserBalances;
