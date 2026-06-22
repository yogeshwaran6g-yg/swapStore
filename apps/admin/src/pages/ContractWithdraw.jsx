import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Wallet, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { useAppKitAccount } from '@reown/appkit/react';
import toast from 'react-hot-toast';
import { CRYPTO_LOAN_ABI, CONTRACT_ADDRESSES } from '../config/contracts';

const SUPPORTED_TOKENS = {
  bsc: [
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
    { symbol: 'DAI', name: 'Dai', address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', decimals: 18, logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' }
  ],
  polygon: [
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
    { symbol: 'DAI', name: 'Dai', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' }
  ]
};

const ContractWithdraw = () => {
  const { writeContractAsync } = useWriteContract();
  const { isConnected } = useAppKitAccount();

  const [searchParams] = useSearchParams();

  const [network, setNetwork] = useState(searchParams.get('network') || 'bsc');

  // Custom Dropdown state
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [selectedTokenObj, setSelectedTokenObj] = useState(null);

  // Custom Token Fallback
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customDecimals, setCustomDecimals] = useState('18');

  const [to, setTo] = useState(searchParams.get('address') || '');
  const [amount, setAmount] = useState(searchParams.get('amount') || '');

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTokenDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize token from search params or default
  useEffect(() => {
    const initialTokenParam = searchParams.get('token');
    const tokensForNetwork = SUPPORTED_TOKENS[network] || [];

    if (initialTokenParam) {
      // Find by address (case insensitive)
      const found = tokensForNetwork.find(t => t.address.toLowerCase() === initialTokenParam.toLowerCase());
      if (found) {
        setSelectedTokenObj(found);
        setIsCustomToken(false);
      } else {
        setIsCustomToken(true);
        setCustomTokenAddress(initialTokenParam);
        setSelectedTokenObj(null);
      }
    } else {
      // Default to first supported token
      if (tokensForNetwork.length > 0) {
        setSelectedTokenObj(tokensForNetwork[0]);
        setIsCustomToken(false);
      }
    }
  }, [network, searchParams]);

  // Handle network change: reset token selection
  const handleNetworkChange = (e) => {
    const newNetwork = e.target.value;
    setNetwork(newNetwork);
    const tokensForNetwork = SUPPORTED_TOKENS[newNetwork] || [];
    if (tokensForNetwork.length > 0 && !isCustomToken) {
      setSelectedTokenObj(tokensForNetwork[0]);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Please connect your admin wallet first.');
      return;
    }

    const finalToken = isCustomToken ? customTokenAddress : selectedTokenObj?.address;
    const finalDecimals = isCustomToken ? customDecimals : selectedTokenObj?.decimals;

    if (!finalToken || !to || !amount) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      toast.loading("Sending transaction...", { id: 'cw_tx' });
      const contractAddress = CONTRACT_ADDRESSES[network] || CONTRACT_ADDRESSES.bsc;
      const amountWei = parseUnits(amount.toString(), parseInt(finalDecimals) || 18);

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: CRYPTO_LOAN_ABI,
        functionName: 'withdraw',
        args: [
          finalToken,
          amountWei,
          to
        ]
      });

      toast.success(`Transaction submitted! Hash: ${txHash.slice(0, 10)}...`, { id: 'cw_tx' });
      setAmount('');
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || "Transaction failed", { id: 'cw_tx' });
    }
  };

  const tokensForNetwork = SUPPORTED_TOKENS[network] || [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-xl">
            <Wallet className="text-violet-400 w-6 h-6" />
          </div>
          Withdraw User Asset
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Withdraw accumulated interest, or mistakenly sent tokens directly from the CryptoLoan smart contract.
        </p>
      </div>

      <div className="bg-[#0a0a0f] border border-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-violet-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <form onSubmit={handleWithdraw} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Network */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Network</label>
              <select
                value={network}
                onChange={handleNetworkChange}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
              >
                <option value="bsc">Binance Smart Chain </option>
                <option value="polygon">Polygon </option>
              </select>
            </div>

            {/* Token Dropdown */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Token</label>

              <button
                type="button"
                onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                className="w-full flex items-center justify-between bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              >
                {isCustomToken ? (
                  <span className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold border border-zinc-700">?</div>
                    Custom Token Address
                  </span>
                ) : selectedTokenObj ? (
                  <div className="flex items-center gap-2">
                    <img src={selectedTokenObj.logo} alt={selectedTokenObj.symbol} className="w-6 h-6 rounded-full bg-white border border-zinc-700" onError={(e) => e.target.style.display = 'none'} />
                    <span className="text-sm font-bold text-zinc-100">{selectedTokenObj.symbol}</span>
                    <span className="text-xs text-zinc-500 ml-1">({selectedTokenObj.name})</span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-500">Select a token...</span>
                )}
                <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isTokenDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTokenDropdownOpen && (
                <div className="absolute z-50 top-[100%] left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1">
                  {tokensForNetwork.map((t) => (
                    <button
                      key={t.address}
                      type="button"
                      onClick={() => {
                        setSelectedTokenObj(t);
                        setIsCustomToken(false);
                        setIsTokenDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={t.logo} alt={t.symbol} className="w-7 h-7 rounded-full bg-white border border-zinc-700" onError={(e) => e.target.style.display = 'none'} />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold text-zinc-100">{t.symbol}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{t.address.slice(0, 8)}...{t.address.slice(-6)}</span>
                        </div>
                      </div>
                      {!isCustomToken && selectedTokenObj?.address === t.address && (
                        <Check size={16} className="text-violet-500" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-zinc-800/50 mt-1"></div>

                </div>
              )}
            </div>

            {/* Custom Token Inputs (only shown if Custom Token selected) */}
            {isCustomToken && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Custom Token Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={customTokenAddress}
                    onChange={(e) => setCustomTokenAddress(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Custom Token Decimals</label>
                  <input
                    type="number"
                    min="0"
                    max="18"
                    placeholder="18"
                    value={customDecimals}
                    onChange={(e) => setCustomDecimals(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
              </>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>

            {/* Recipient Address */}
            <div className={`space-y-2 ${isCustomToken ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">User Wallet Address (Recipient)</label>
              <input
                type="text"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
              <p className="text-[10px] text-zinc-500">The destination address that will receive these tokens.</p>
            </div>

          </div>

          {!isConnected && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-amber-500 w-5 h-5 shrink-0" />
              <p className="text-xs text-amber-200">You must connect your admin wallet using the top-right button before withdrawing.</p>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800/50 flex justify-end">
            <button
              type="submit"
              disabled={!isConnected || (!isCustomToken && !selectedTokenObj) || (isCustomToken && !customTokenAddress) || !to || !amount}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-900/20"
            >
              <Download size={16} strokeWidth={2.5} />
              Execute Withdrawal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractWithdraw;
