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
    { 
      name: 'Dashboard', 
      path: '/dashboard',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    },
    { 
      name: 'Swap', 
      path: '/swap',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
    },
    { 
      name: 'Loan', 
      path: '/loan',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      name: 'Profile', 
      path: '/profile',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 lg:px-12 py-3 lg:py-4 backdrop-blur-xl bg-[#FFF5ED]/80 border-b border-[#FF8C00]/20 flex items-center justify-between animate-fade-in shadow-sm">
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
          <div className="flex items-center gap-1.5 bg-white/60 p-1.5 rounded-2xl border border-gray-100 backdrop-blur-md shadow-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <span
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? "text-[#FF8C00] bg-[#FFF5ED] shadow-sm border border-[#FF8C00]/20"
                      : "text-[#475569] hover:text-[#FF8C00] hover:bg-white/80"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2 tracking-wide">
                    {link.icon}
                    {link.name}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-3 lg:w-[280px]">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={disconnect}
              className="hidden sm:flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#FF8C00] hover:bg-[#E67E22] px-5 py-2.5 rounded-full transition-all border border-transparent shadow-[0_4px_15px_rgba(255,140,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,140,0,0.4)] group"
              title="Disconnect Wallet"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="hidden xl:inline">Disconnect</span>
            </button>

            <div className="transform scale-[0.85] sm:scale-100 origin-right transition-transform hover:scale-[1.03]">
              <WalletConnect />
            </div>
          </div>

          {/* Hamburger Menu Toggle */}
          <button
            className="lg:hidden p-1.5 sm:p-2 text-[#475569] hover:text-[#FF4500] bg-white/60 rounded-lg border border-[#FF8C00]/20"
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
          <div className="relative w-64 max-w-sm h-full bg-[#FFF5ED] border-r border-[#FF8C00]/20 shadow-2xl flex flex-col p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <img src="/instaa-cash-logo.png" alt="Instaa Cash" className="h-8 object-contain" />
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-[#475569] hover:text-[#FF4500] p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-4 text-base font-bold text-[#475569]">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <span
                    key={link.name}
                    onClick={() => {
                      navigate(link.path);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer overflow-hidden relative group ${
                      isActive 
                        ? "text-[#FF8C00] bg-[#FFF5ED] border border-[#FF8C00]/20" 
                        : "hover:text-[#FF4500] hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00]/10 to-[#FF4500]/10 opacity-80"></div>
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#FF4500] shadow-[0_0_8px_rgba(255,69,0,0.8)]"></div>}
                      <span className={isActive ? "" : "ml-4.5"}>{link.name}</span>
                    </span>
                  </span>
                );
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-[#FF8C00]/20">
              <button
                onClick={() => {
                  disconnect();
                  setIsMenuOpen(false);
                }}
                className="w-full text-sm font-bold text-red-500 hover:text-white bg-red-100/50 hover:bg-red-500 px-4 py-3 rounded-xl transition-colors border border-red-500/20"
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
