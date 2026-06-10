import React from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../WalletConnect';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { disconnect } = useAuth();

  if (!isConnected) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-4 backdrop-blur-xl bg-[#06060c]/80 border-b border-white/5 flex items-center justify-between animate-fade-in shadow-2xl">
      <div className="flex items-center gap-10">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SwapStore</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <span onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-purple-500">Dashboard</span>
          <span onClick={() => navigate('/swap')} className="hover:text-white transition-colors cursor-pointer">Swap</span>
          <span className="hover:text-white transition-colors cursor-pointer">Tokens</span>
          <span className="hover:text-white transition-colors cursor-pointer">Pools</span>
          <span onClick={() => navigate('/kyc')} className="hover:text-white transition-colors cursor-pointer">KYC</span>
          <span className="hover:text-white transition-colors cursor-pointer">Analytics</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <button 
           onClick={disconnect}
           className="text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors border border-red-500/20"
         >
           Disconnect
         </button>
         {/* Small Wallet Connect Button for Navbar */}
         <div className="transform scale-90 origin-right">
           <WalletConnect />
         </div>
      </div>
    </nav>
  );
}

export default Navbar;
