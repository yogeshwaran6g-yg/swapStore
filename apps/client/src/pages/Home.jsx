import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import WalletConnect from '@/components/WalletConnect';
import UsdtBalance from '@/components/UsdtBalance';
import UsdcBalance from '@/components/UsdcBalance';
import DaiBalance from '@/components/DaiBalance';

function Home() {
  const { isConnected: isWalletConnected } = useAccount();
  const { isAuthenticated, address, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isWalletConnected || isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isWalletConnected, isAuthenticated, navigate]);

  return (
    <div className="w-full bg-[#06060c] text-white overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          backgroundImage: 'url(/bg-landing.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#06060c]/80 backdrop-blur-[2px] z-0"></div>

        {/* Ambient Orbs */}
        <div className="absolute top-[10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[200px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[200px] opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>

        {/* Main Hero Container */}
        <div className="container mx-auto px-6 lg:px-12 relative z-10 flex-1 flex flex-col justify-center pt-32 pb-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Column */}
            <div className="flex flex-col text-left space-y-8">

              {/* Badge */}
              <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 text-[#ff4dff] text-xs font-bold tracking-widest uppercase w-max bg-purple-500/10">
                NEXT-GEN DEFI PROTOCOL
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight leading-[1.05]">
                Swap Tokens <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0099ff] to-[#4da6ff]">
                  Without
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white ml-3 sm:ml-4">
                  Limits.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-zinc-400 text-lg sm:text-xl font-light leading-relaxed max-w-lg">
                Access deep liquidity, track your multi-chain assets instantly, and execute lightning-fast trades. <br />
                Welcome to the future of decentralized finance.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                <div className="w-full sm:w-auto [&>button]:w-full [&>button]:py-3.5 [&>button]:px-8 [&>button]:rounded-xl [&>button]:bg-gradient-to-r [&>button]:from-[#7b3fe4] [&>button]:to-[#9853f0] [&>button]:text-white [&>button]:font-bold [&>button]:text-base [&>button]:shadow-[0_0_20px_rgba(123,63,228,0.4)]">
                  <WalletConnect />
                </div>

                <button
                  onClick={() => navigate('/swap')}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-white font-semibold text-base transition-colors flex items-center justify-center gap-3 group"
                >
                  Explore Assets
                  <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

              {/* Trusted By Builders */}
              <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <span className="text-zinc-500 text-xs font-bold tracking-[0.15em] uppercase">TRUSTED BY BUILDERS</span>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-white/30 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-[#627eea]" viewBox="0 0 32 32" fill="currentColor"><path d="M15.925 23.96l-9.819-5.787L15.925 32l9.824-13.827-9.824 5.787zM16.075 0L6.255 16.32l9.82 5.805 9.824-5.805L16.075 0z" /></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-white/30 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-[#14f195]" viewBox="0 0 32 32" fill="currentColor"><path d="M4.636 21.054l4.316-7.447h18.411l-4.314 7.447H4.636zm4.316-9.929l-4.316-7.448h18.411l-4.314 7.448H8.952z" /></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-white/30 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-[#8247e5]" viewBox="0 0 32 32" fill="currentColor"><path d="M22.062 10.518l-5.632-3.238c-.28-.158-.621-.158-.901 0l-5.631 3.238c-.28.163-.453.46-.453.784v6.476c0 .324.173.621.453.784l5.631 3.238c.28.158.621.158.901 0l5.632-3.238c.28-.163.453-.46.453-.784v-6.476c0-.324-.173-.621-.453-.784zm-4.706 7.456l-3.351-1.936v-3.872l3.351-1.935 3.352 1.935v3.872l-3.352 1.936z" /></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-white/30 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-[#e84142]" viewBox="0 0 32 32" fill="currentColor"><path d="M16 28.5L2 4h28L16 28.5z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Graphic and Portfolio */}
            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center lg:justify-end">

              {/* Floating 3D Graphic */}
              <div className={`absolute inset-0 flex items-center justify-center lg:justify-end transition-all duration-1000 ease-in-out pointer-events-none ${isWalletConnected ? 'opacity-20 scale-90 translate-x-8' : 'opacity-100 scale-100'}`}>
                <img
                  src="/hero-graphic.png"
                  alt="DeFi Graphic"
                  className="w-full max-w-[550px] xl:max-w-[700px] object-contain animate-[pulse_4s_ease-in-out_infinite] mix-blend-screen lg:-translate-x-8"
                  style={{ filter: 'drop-shadow(0 0 40px rgba(123,63,228,0.4))' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar at bottom of Hero */}
        <div className="container mx-auto px-6 lg:px-12 relative z-10 pb-8">
          <div className="w-full backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[20px] p-5 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-white/5">

              {/* Stat 1 */}
              <div className="flex flex-col justify-center px-2 lg:px-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">TOTAL VALUE LOCKED</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">$128.7M</span>
                  <span className="text-[#00ffcc] text-sm font-bold tracking-wide">↑ 12.4%</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col justify-center px-2 lg:px-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">24H VOLUME</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">$24.3M</span>
                  <span className="text-[#00ffcc] text-sm font-bold tracking-wide">↑ 8.7%</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col justify-center px-2 lg:px-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">TOTAL USERS</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">84.2K</span>
                  <span className="text-[#00ffcc] text-sm font-bold tracking-wide">↑ 15.2%</span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex flex-col justify-center px-2 lg:px-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">TOTAL TRANSACTIONS</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">1.2M</span>
                  <span className="text-[#00ffcc] text-sm font-bold tracking-wide">↑ 9.8%</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-[#080810]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 text-transparent bg-clip-text">Why Choose SwapStore?</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Experience the most advanced decentralized trading infrastructure designed for both beginners and pros.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-zinc-400 leading-relaxed">Our optimized routing engine ensures your trades are executed instantly with the lowest possible slippage.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-zinc-400 leading-relaxed">We never hold your funds. You remain in complete control of your private keys and assets at all times.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Chain Ready</h3>
              <p className="text-zinc-400 leading-relaxed">Seamlessly swap assets across Ethereum, Binance Smart Chain, Polygon, and other major networks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-[#06060c]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">Start Trading in Seconds</h2>
              <p className="text-zinc-400 text-lg">No KYC, no hidden fees, and no waiting. Just connect your wallet and you are ready to explore the decentralized ecosystem.</p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 border border-blue-500/30">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Connect Wallet</h4>
                    <p className="text-zinc-500">Link your MetaMask, Trust Wallet, or any WalletConnect compatible application.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-500/30">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Select Tokens</h4>
                    <p className="text-zinc-500">Choose the assets you want to swap. We automatically find the best routing path.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0 border border-purple-500/30">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Confirm Transaction</h4>
                    <p className="text-zinc-500">Approve the transaction in your wallet and receive your new tokens instantly.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur-[80px] opacity-20"></div>
              <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl relative z-10 shadow-2xl">
                <div className="space-y-4">
                  <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                  <div className="h-32 bg-white/5 rounded-xl animate-pulse"></div>
                  <div className="flex justify-center my-2">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">↓</div>
                  </div>
                  <div className="h-32 bg-white/5 rounded-xl animate-pulse"></div>
                  <div className="h-16 bg-indigo-500/20 rounded-xl mt-4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/10 bg-black relative z-10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20"></div>
              <span className="text-xl font-bold tracking-wider">SwapStore</span>
            </div>

            <div className="flex gap-8 text-sm text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
          <div className="mt-8 text-center text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} SwapStore Protocol. All rights reserved. Built for the decentralized future.
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;
