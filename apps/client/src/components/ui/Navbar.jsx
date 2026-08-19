import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate, useLocation } from 'react-router-dom';
import WalletConnect from '../WalletConnect';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isConnected) return null;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Swap', path: '/swap' },
    { name: 'Loan', path: '/loan' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 lg:px-12 py-3 lg:py-4 backdrop-blur-xl bg-[#06060c]/80 border-b border-white/5 flex items-center justify-between animate-fade-in shadow-2xl">
        {/* Left Side: Logo */}
        <div className="flex items-center lg:w-[280px]">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group pl-1"
          >
            <div className="flex items-center group">
              <img src="/instaa-cash-logo.png" alt="Instaa Cash" className="h-6 sm:h-8 lg:h-9 object-contain transform group-hover:scale-105 transition-transform" />
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <span
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? "text-white bg-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-80"></div>
                  )}
                  <span className="relative z-10 tracking-wide">{link.name}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 lg:w-[280px]">
          <div className="flex items-center gap-1.5 sm:gap-2 sm:bg-white/5 sm:p-1.5 sm:rounded-3xl sm:border sm:border-white/10 sm:backdrop-blur-md sm:shadow-inner transition-all">
            <button
              onClick={disconnect}
              className="hidden sm:flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-4 py-2 rounded-2xl transition-all border border-transparent hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] group"
              title="Disconnect Wallet"
            >
              <svg className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="hidden xl:inline">Disconnect</span>
            </button>

            <div className="transform scale-[0.85] sm:scale-100 origin-right transition-transform hover:scale-[1.03]">
              <WalletConnect />
            </div>
          </div>

          {/* Hamburger Menu Toggle */}
          <button
            className="lg:hidden p-1.5 sm:p-2 text-zinc-400 hover:text-white bg-white/5 rounded-lg"
            onClick={() => setIsMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="relative w-64 max-w-sm h-full bg-[#0a0a0f] border-r border-white/10 shadow-2xl flex flex-col p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <img src="/instaa-cash-logo.png" alt="Instaa Cash" className="h-8 object-contain" />
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-zinc-400 hover:text-white p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-4 text-base font-bold text-zinc-400">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <span
                    key={link.name}
                    onClick={() => {
                      navigate(link.path);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer overflow-hidden relative group ${
                      isActive 
                        ? "text-white bg-white/5 border border-white/10" 
                        : "hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-80"></div>
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>}
                      <span className={isActive ? "" : "ml-4.5"}>{link.name}</span>
                    </span>
                  </span>
                );
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  disconnect();
                  setIsMenuOpen(false);
                }}
                className="w-full text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-3 rounded-xl transition-colors border border-red-500/20"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
