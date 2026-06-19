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
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-12 py-4 backdrop-blur-xl bg-[#06060c]/80 border-b border-white/5 flex items-center justify-between animate-fade-in shadow-2xl">
        <div className="flex items-center gap-10">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="flex items-center group">
              <img src="/instaa-cash-logo.png" alt="Instaa Cash" className="h-8 sm:h-9 object-contain transform group-hover:scale-105 transition-transform" />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-400">
            {navLinks.map((link) => (
              <span
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`hover:text-white transition-colors cursor-pointer relative ${location.pathname === link.path
                    ? "text-white after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-purple-500"
                    : ""
                  }`}
              >
                {link.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={disconnect}
              className="text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors border border-red-500/20"
            >
              Disconnect
            </button>
          </div>

          <div className="transform scale-90 sm:scale-100 origin-right">
            <WalletConnect />
          </div>

          {/* Hamburger Menu Toggle */}
          <button
            className="lg:hidden p-2 text-zinc-400 hover:text-white bg-white/5 rounded-lg"
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

            <div className="flex flex-col gap-6 text-lg font-medium text-zinc-400">
              {navLinks.map((link) => (
                <span
                  key={link.name}
                  onClick={() => {
                    navigate(link.path);
                    setIsMenuOpen(false);
                  }}
                  className={`hover:text-white transition-colors cursor-pointer ${location.pathname === link.path ? "text-purple-400 font-bold" : ""
                    }`}
                >
                  {link.name}
                </span>
              ))}
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
