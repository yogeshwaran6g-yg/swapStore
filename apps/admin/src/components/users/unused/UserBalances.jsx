import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Wallet, RefreshCw } from 'lucide-react';
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

const UserBalances = ({ walletAddress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState(null);

  const fetchBalances = async () => {
    if (!walletAddress) {
      setError('No wallet address available');
      return;
    }
    
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

  const handleToggle = () => {
    if (!isOpen && !balances) {
      fetchBalances();
    }
    setIsOpen(!isOpen);
  };

  if (!walletAddress) {
    return <span className="text-zinc-500 text-xs italic">No Wallet</span>;
  }

  return (
    <>
      <button
        onClick={handleToggle}
        className="flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
        <span>Balances</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
              <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center">
                <Wallet size={16} className="mr-2 text-amber-500" />
                Wallet Balances
              </h4>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={fetchBalances} 
                  className="text-zinc-500 hover:text-amber-500 transition-colors p-1.5 rounded-md hover:bg-zinc-800"
                  title="Refresh Balances"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                <button 
                  onClick={handleToggle} 
                  className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-zinc-800"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar">
              <div className="text-xs text-zinc-500 mb-4 font-mono truncate bg-zinc-950/50 p-2 rounded border border-zinc-800 flex justify-between items-center">
                <span className="truncate">{walletAddress}</span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 size={28} className="animate-spin text-amber-500" />
                  <span className="text-zinc-400 text-xs">Fetching balances from blockchain...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-rose-500 py-4 bg-rose-500/10 rounded-lg text-center border border-rose-500/20">
                  {error}
                </div>
              ) : balances ? (
                <div className="space-y-4">
                  {Object.entries(balances).map(([network, tokens]) => (
                    <div key={network} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                      <div className="text-xs font-bold text-amber-500 capitalize mb-2 border-b border-zinc-800 pb-2 flex items-center space-x-2">
                        <img 
                          src={network === 'bnb' ? 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025' : 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025'} 
                          alt={network} 
                          className="w-4 h-4" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span>{network}</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(tokens).map(([token, amount], idx) => {
                          const numAmount = parseFloat(amount);
                          return (
                            <div 
                              key={token} 
                              className={`flex justify-between items-center text-sm p-2 rounded-md transition-colors hover:bg-zinc-800/50 ${idx % 2 === 0 ? 'bg-zinc-950/40' : 'bg-transparent'}`}
                            >
                              <div className="flex items-center space-x-2">
                                {token === 'USDT' && <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025" alt="USDT" className="w-4 h-4" />}
                                {token === 'USDC' && <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=025" alt="USDC" className="w-4 h-4" />}
                                {token === 'DAI' && <img src="https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=025" alt="DAI" className="w-4 h-4" />}
                                {token === 'NATIVE' && network === 'bnb' && <img src="https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025" alt="BNB" className="w-4 h-4" />}
                                {token === 'NATIVE' && network === 'polygon' && <img src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025" alt="MATIC" className="w-4 h-4" />}
                                <span className="text-zinc-300 font-medium">{token === 'NATIVE' ? (network === 'bnb' ? 'BNB' : 'MATIC') : token}</span>
                              </div>
                              <span className="text-zinc-100 font-mono bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 shadow-sm">
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
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserBalances;
