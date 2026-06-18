import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Wallet } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
function Home() {
  const { isConnected: isWalletConnected } = useAccount();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { open } = useAppKit();

  const handleConnect = (destination) => {
    localStorage.setItem('redirectAfterConnect', destination);
    open();
  };

  useEffect(() => {
    if (isWalletConnected || isAuthenticated) {
      const destination = localStorage.getItem('redirectAfterConnect') || '/dashboard';
      localStorage.removeItem('redirectAfterConnect');
      navigate(destination);
    }
  }, [isWalletConnected, isAuthenticated, navigate]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#C7D0E6] to-[#DDE3F0] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#A99CFF]/30 pt-6 pb-20 px-4 sm:px-8">
      {/* Outer wrapper provides whitespace and gradient */}

      {/* HERO CARD CONTAINER */}
      <div className="max-w-[1400px] mx-auto bg-gradient-to-br from-[#E8EBF5]/90 to-[#DDE3F0]/90 backdrop-blur-xl rounded-[32px] shadow-[0_32px_64px_-12px_rgba(169,156,255,0.15)] border border-white/40 overflow-hidden relative">

        {/* --- NAVBAR --- */}
        <div className="relative z-50 px-4 pt-6 pb-2 lg:px-8">
          <nav className="w-full flex items-center justify-between bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[24px] px-4 sm:px-6 py-3 sm:py-4 shadow-[0_8px_32px_rgba(14,27,77,0.05)]">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0E1B4D] to-[#1A2C6B] flex items-center justify-center relative shadow-md group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-[14px] sm:text-[16px]">C</span>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-gradient-to-tr from-[#D9A85C] to-[#FCD34D] rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <span className="text-[19px] sm:text-2xl font-extrabold tracking-tight text-[#0E1B4D]">InstaaCash</span>
            </div>

            {/* Links */}
            <div className="hidden lg:flex items-center bg-white/40 border border-white/50 rounded-full px-2 py-1.5 shadow-sm">
              <a href="#home" className="text-[14px] font-bold text-[#0E1B4D] bg-white shadow-sm rounded-full px-4 py-2 transition-all">Home</a>
              <a href="#swap" className="text-[14px] font-semibold text-[#64748B] hover:text-[#0E1B4D] hover:bg-white/80 rounded-full px-4 py-2 transition-all">Swap</a>
              <a href="#loan-details" className="text-[14px] font-semibold text-[#64748B] hover:text-[#0E1B4D] hover:bg-white/80 rounded-full px-4 py-2 transition-all">Loan Details</a>
              <a href="#services" className="text-[14px] font-semibold text-[#64748B] hover:text-[#0E1B4D] hover:bg-white/80 rounded-full px-4 py-2 transition-all">Services</a>
              <a href="#reviews" className="text-[14px] font-semibold text-[#64748B] hover:text-[#0E1B4D] hover:bg-white/80 rounded-full px-4 py-2 transition-all">Reviews</a>
              <a href="#about" className="text-[14px] font-semibold text-[#64748B] hover:text-[#0E1B4D] hover:bg-white/80 rounded-full px-4 py-2 transition-all">About</a>
            </div>

            {/* Action */}
            <div className="flex items-center relative group shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#A99CFF] to-[#D9A85C] rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
              <button
                onClick={() => handleConnect('/dashboard')}
                className="relative flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-br from-[#0E1B4D] to-[#1A2C6B] text-white px-4 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-[13px] sm:text-[15px] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_40px_-10px_rgba(169,156,255,0.8)] border border-white/20 shadow-inner"
              >
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#A99CFF]" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            </div>
          </nav>
        </div>

        {/* --- HERO CONTENT --- */}
        <main id="home" className="relative z-20 px-4 sm:px-8 lg:px-12 pt-8 pb-16 lg:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-8 items-center min-h-[auto] lg:min-h-[700px] scroll-mt-32 overflow-hidden lg:overflow-visible">

          {/* LEFT CONTENT */}
          <div className="flex flex-col space-y-6 lg:space-y-8 max-w-full lg:max-w-[600px] xl:max-w-[650px] z-20 items-center lg:items-start text-center lg:text-left mx-auto lg:mx-0">

            {/* Headline */}
            <div className="flex flex-col gap-1 lg:gap-2">
              <h1 className="text-[2.5rem] sm:text-6xl lg:text-[4.5rem] xl:text-[5rem] font-[800] leading-[1.05] tracking-tight text-[#0E1B4D]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#6366F1]">Swap</span> Crypto to cash{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9A85C] to-[#F59E0B] block sm:inline">Instantly</span> and
              </h1>
              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-[800] leading-[1.1] tracking-tight text-[#0E1B4D]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#6366F1]">Get</span> Crypto Loans{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9A85C] to-[#F59E0B]">Effortlessly.</span>
              </h1>
            </div>

            {/* Mobile Hero Image (Hidden on Desktop) */}
            <div className="flex lg:hidden relative w-full h-[280px] sm:h-[400px] items-center justify-center mb-0 mt-4">
              {/* Ambient Purple Light */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#A99CFF] blur-[80px] opacity-40 rounded-full pointer-events-none z-0"></div>

              {/* Trust Card */}
              <div className="absolute top-[0%] right-[-5%] sm:right-[5%] z-40 bg-white border border-gray-200 rounded-lg p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-float scale-75 origin-right" style={{ animationDelay: '1s' }}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-[2px]">
                    {[...Array(5)].map((_, idx) => (
                      <div key={idx} className="w-5 h-5 bg-[#00B67A] flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[#1A1A1A] font-extrabold text-[13px] leading-tight mb-0.5">4.5/5 Excellent</p>
                    <p className="text-gray-500 text-[10px] font-medium">10,000+ Reviews</p>
                  </div>
                </div>
              </div>

              {/* Main Robot Image */}
              <div className="relative z-10 w-full flex items-center justify-center transform scale-[1.15] sm:scale-100 origin-center -translate-x-8">
                <img src="/robot.png" alt="Fintech 3D Robot Mascot" className="w-full max-w-[320px] sm:max-w-[450px] object-contain relative z-20 drop-shadow-2xl animate-float" />
              </div>
            </div>

            {/* Subheading */}
            <p className="text-[#475569] text-lg lg:text-xl font-medium leading-relaxed max-w-[550px] mx-auto lg:mx-0 -mt-4 lg:mt-0 relative z-20">
              Trade USDT, USDC, DAI, Polygon & BNB in seconds. Access crypto-backed loans instantly with secure approvals. Enjoy seamless cash processing with absolutely <span className="font-bold text-[#0E1B4D]">zero risk of bank account freezes</span>.
            </p>


            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 lg:gap-4 mt-2">
              <div className="flex items-center gap-2 lg:gap-3 bg-white/70 backdrop-blur-xl px-4 py-2.5 lg:px-6 lg:py-3.5 rounded-xl lg:rounded-2xl shadow-[0_8px_20px_rgba(14,27,77,0.06)] hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-default">
                <div className="flex items-center">
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-[#8247E5] flex items-center justify-center text-[4px] lg:text-[5px] text-white font-bold z-30 border border-white shadow-sm">POL</div>
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-[#F3BA2F] flex items-center justify-center text-[4px] lg:text-[5px] text-[#0E1B4D] font-bold z-20 -ml-1 border border-white shadow-sm">BNB</div>
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-[#26A17B] flex items-center justify-center text-[6px] lg:text-[8px] text-white font-bold z-10 -ml-1 border-2 border-white shadow-sm">USDT</div>
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-[#0E1B4D] flex items-center justify-center text-[6px] lg:text-[8px] text-white font-bold -ml-2 border-2 border-white shadow-sm">INR</div>
                </div>
                <span className="text-[#0E1B4D] font-bold text-[13px] lg:text-[15px]">USDT to INR</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 bg-white/70 backdrop-blur-xl px-4 py-2.5 lg:px-6 lg:py-3.5 rounded-xl lg:rounded-2xl shadow-[0_8px_20px_rgba(14,27,77,0.06)] hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-default">
                <div className="flex items-center">
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-[#8247E5] flex items-center justify-center text-[4px] lg:text-[5px] text-white font-bold z-30 border border-white shadow-sm">POL</div>
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-[#F3BA2F] flex items-center justify-center text-[4px] lg:text-[5px] text-[#0E1B4D] font-bold z-20 -ml-1 border border-white shadow-sm">BNB</div>
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-[#2775CA] flex items-center justify-center text-[6px] lg:text-[8px] text-white font-bold z-10 -ml-1 border-2 border-white shadow-sm">USDC</div>
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-[#0E1B4D] flex items-center justify-center text-[6px] lg:text-[8px] text-white font-bold -ml-2 border-2 border-white shadow-sm">INR</div>
                </div>
                <span className="text-[#0E1B4D] font-bold text-[13px] lg:text-[15px]">USDC to INR</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 bg-white/70 backdrop-blur-xl px-4 py-2.5 lg:px-6 lg:py-3.5 rounded-xl lg:rounded-2xl shadow-[0_8px_20px_rgba(14,27,77,0.06)] hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-default">
                <div className="flex items-center">
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-[#8247E5] flex items-center justify-center text-[4px] lg:text-[5px] text-white font-bold z-30 border border-white shadow-sm">POL</div>
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-[#F3BA2F] flex items-center justify-center text-[4px] lg:text-[5px] text-[#0E1B4D] font-bold z-20 -ml-1 border border-white shadow-sm">BNB</div>
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-[#F5AC37] flex items-center justify-center text-[6px] lg:text-[8px] text-white font-bold z-10 -ml-1 border-2 border-white shadow-sm">DAI</div>
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-[#0E1B4D] flex items-center justify-center text-[6px] lg:text-[8px] text-white font-bold -ml-2 border-2 border-white shadow-sm">INR</div>
                </div>
                <span className="text-[#0E1B4D] font-bold text-[13px] lg:text-[15px]">DAI to INR</span>
              </div>
            </div>


            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-2">
              <a href="#swap" className="group w-full sm:w-auto bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] text-white px-10 py-4 rounded-2xl font-[800] text-[17px] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.5)] hover:-translate-y-1">
                Start Swapping
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>

              <a href="#loan-details" className="group w-full sm:w-auto bg-gradient-to-r from-[#D9A85C] to-[#F59E0B] text-[#0E1B4D] px-10 py-4 rounded-2xl font-[800] text-[17px] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.5)] hover:-translate-y-1">
                Get Loan
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-y-3 gap-x-4 sm:gap-6 pt-4 pb-4 px-5 bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl w-full sm:w-max shadow-sm mt-2 sm:mt-4 justify-center lg:justify-start mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏦</span>
                <div>
                  <p className="text-[#0E1B4D] font-bold text-[13px] sm:text-sm leading-tight">Less Documents Required</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-300/50"></div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💸</span>
                <div>
                  <p className="text-[#0E1B4D] font-bold text-[13px] sm:text-sm leading-tight">Zero Hidden Fees</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-300/50"></div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-[#0E1B4D] font-bold text-[13px] sm:text-sm leading-tight">Instant Swaps & Loans</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT (Desktop Only) */}
          <div className="hidden lg:flex relative w-full h-[750px] items-center justify-center">

            {/* Ambient Purple Light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#A99CFF] blur-[80px] sm:blur-[140px] opacity-40 rounded-full pointer-events-none z-0"></div>

            {/* Trust Card (Beside Robot) */}
            <div className="absolute top-[5%] lg:top-[20%] right-[0%] lg:right-[-5%] xl:right-[5%] z-40 bg-white border border-gray-200 rounded-lg p-3 lg:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-float scale-75 lg:scale-100 origin-right" style={{ animationDelay: '1s' }}>
              <div className="flex flex-col gap-1.5 lg:gap-2">
                <div className="flex items-center gap-[2px]">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="w-5 h-5 lg:w-6 lg:h-6 bg-[#00B67A] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-extrabold text-[13px] lg:text-[15px] leading-tight mb-0.5">4.5/5 Excellent</p>
                  <p className="text-gray-500 text-[10px] lg:text-[11px] font-medium">10,000+ Reviews</p>
                </div>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative z-10 w-full flex items-center justify-center transform scale-[1.1] lg:scale-[1.25] origin-center mt-10 lg:mt-0 -translate-x-2 lg:-translate-x-4">
              {/* Main Robot */}
              <img
                src="/robot.png"
                alt="Fintech 3D Robot Mascot"
                className="w-full max-w-[450px] lg:max-w-[700px] object-contain relative z-20 drop-shadow-2xl animate-float"
              />

              {/* Floating Glass Cubes */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute animate-tumble" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>
                  <div className="w-4 h-4 bg-[#A99CFF]/80 backdrop-blur-md border border-white/40 rounded-sm shadow-lg"></div>
                </div>
                <div className="absolute animate-tumble" style={{ top: '50%', left: '25%', animationDelay: '2s' }}>
                  <div className="w-3 h-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-sm shadow-lg"></div>
                </div>
                <div className="absolute animate-tumble" style={{ top: '40%', right: '25%', animationDelay: '1s' }}>
                  <div className="w-5 h-5 bg-[#A99CFF]/60 backdrop-blur-md border border-white/40 rounded-md shadow-lg"></div>
                </div>
                <div className="absolute animate-tumble" style={{ top: '80%', right: '10%', animationDelay: '3s' }}>
                  <div className="w-3 h-3 bg-white/80 backdrop-blur-md border border-white/60 rounded-sm shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- FEATURES/SERVICES SECTION --- */}
      <section id="services" className="max-w-[1400px] mx-auto px-1 sm:px-8 mt-6 sm:mt-12 relative z-20 scroll-mt-24">
        <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Feature 1 */}
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-[20px] flex items-center justify-center text-[#0E1B4D] shadow-sm border border-gray-200/50">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </div>
            <div>
              <h4 className="text-[#0E1B4D] font-[800] text-lg mb-1.5 tracking-tight">Instant Swap</h4>
              <p className="text-[#64748B] text-[13px] font-medium leading-relaxed">Swap USDT, USDC, DAI, BNB & Polygon instantly without hidden fees.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-[20px] flex items-center justify-center text-[#0E1B4D] shadow-sm border border-gray-200/50">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <div>
              <h4 className="text-[#0E1B4D] font-[800] text-lg mb-1.5 tracking-tight">Crypto Loans</h4>
              <p className="text-[#64748B] text-[13px] font-medium leading-relaxed">Get immediate funds using your crypto assets as secure collateral.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-[20px] flex items-center justify-center text-[#0E1B4D] shadow-sm border border-gray-200/50">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h4 className="text-[#0E1B4D] font-[800] text-lg mb-1.5 tracking-tight">Trusted Platform</h4>
              <p className="text-[#64748B] text-[13px] font-medium leading-relaxed">Rated highly by thousands of customers globally for reliability.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-[20px] flex items-center justify-center text-[#0E1B4D] shadow-sm border border-gray-200/50">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h4 className="text-[#0E1B4D] font-[800] text-lg mb-1.5 tracking-tight">Secure Wallet</h4>
              <p className="text-[#64748B] text-[13px] font-medium leading-relaxed">Enterprise-grade asset protection with institutional security standards.</p>
            </div>
          </div>

        </div>
      </section>

      {/* --- SWAP SECTION --- */}
      <section id="swap" className="max-w-[1100px] mx-auto px-1 sm:px-8 mt-8 sm:mt-32 relative z-20 scroll-mt-24 text-center">
        <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 sm:p-12 lg:p-20 rounded-[24px] sm:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(169,156,255,0.2)] flex flex-col items-center gap-6 sm:gap-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#A99CFF] to-[#D9A85C] rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-[#6366F1] to-[#4338CA] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

          <div className="w-16 h-16 bg-gradient-to-br from-[#0E1B4D] to-[#1A2C6B] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#0E1B4D]/20 mb-2 z-10 relative">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[800] text-[#0E1B4D] leading-[1.15] tracking-tight z-10 relative">
            Fast & Easy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A99CFF]">Crypto Swaps.</span><br /> No Hassle. No Waiting.
          </h2>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mt-4 z-10 relative w-full max-w-[280px] sm:max-w-none mx-auto">
            <div className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 bg-[#0E1B4D] text-white rounded-full px-5 py-3 sm:py-2.5 font-bold text-[13px] sm:text-[14px] shadow-md">
              <span className="text-base leading-none">🏦</span> Less Documents Required
            </div>
            <div className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 bg-white/80 border border-white text-[#0E1B4D] rounded-full px-5 py-3 sm:py-2.5 font-bold text-[13px] sm:text-[14px] shadow-sm">
              <span className="text-base leading-none">💸</span> Zero Hidden Fees
            </div>
            <div className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 bg-white/80 border border-white text-[#0E1B4D] rounded-full px-5 py-3 sm:py-2.5 font-bold text-[13px] sm:text-[14px] shadow-sm">
              <span className="text-base leading-none">⚡</span> Instant Swap
            </div>
          </div>

          <p className="text-[#475569] text-lg lg:text-xl leading-relaxed max-w-3xl z-10 relative font-medium">
            Forget about complex decentralized interfaces, high gas fees, and unexpected slippage.
            With InstaaCash, swapping your digital assets is as simple as a single click.
            We route your trades through elite institutional liquidity pools so you always get the absolute best market rates instantly.
          </p>

          {/* Supported Pairs Badges (Static) */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2 z-10 relative">
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white px-5 py-3 rounded-[14px] shadow-sm text-[#0E1B4D] font-bold text-[14px]">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#8247E5] flex items-center justify-center text-[5px] text-white font-bold z-30 border border-white shadow-sm">POL</div>
                <div className="w-4 h-4 rounded-full bg-[#F3BA2F] flex items-center justify-center text-[5px] text-[#0E1B4D] font-bold z-20 -ml-1 border border-white shadow-sm">BNB</div>
                <div className="w-6 h-6 rounded-full bg-[#26A17B] flex items-center justify-center text-[8px] text-white font-bold z-10 -ml-1 border-2 border-white shadow-sm">USDT</div>
                <div className="w-6 h-6 rounded-full bg-[#0E1B4D] flex items-center justify-center text-[8px] text-white font-bold -ml-2 border-2 border-white shadow-sm">INR</div>
              </div>
              <span>USDT to INR</span>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white px-5 py-3 rounded-[14px] shadow-sm text-[#0E1B4D] font-bold text-[14px]">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#8247E5] flex items-center justify-center text-[5px] text-white font-bold z-30 border border-white shadow-sm">POL</div>
                <div className="w-4 h-4 rounded-full bg-[#F3BA2F] flex items-center justify-center text-[5px] text-[#0E1B4D] font-bold z-20 -ml-1 border border-white shadow-sm">BNB</div>
                <div className="w-6 h-6 rounded-full bg-[#2775CA] flex items-center justify-center text-[8px] text-white font-bold z-10 -ml-1 border-2 border-white shadow-sm">USDC</div>
                <div className="w-6 h-6 rounded-full bg-[#0E1B4D] flex items-center justify-center text-[8px] text-white font-bold -ml-2 border-2 border-white shadow-sm">INR</div>
              </div>
              <span>USDC to INR</span>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white px-5 py-3 rounded-[14px] shadow-sm text-[#0E1B4D] font-bold text-[14px]">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#8247E5] flex items-center justify-center text-[5px] text-white font-bold z-30 border border-white shadow-sm">POL</div>
                <div className="w-4 h-4 rounded-full bg-[#F3BA2F] flex items-center justify-center text-[5px] text-[#0E1B4D] font-bold z-20 -ml-1 border border-white shadow-sm">BNB</div>
                <div className="w-6 h-6 rounded-full bg-[#F5AC37] flex items-center justify-center text-[8px] text-white font-bold z-10 -ml-1 border-2 border-white shadow-sm">DAI</div>
                <div className="w-6 h-6 rounded-full bg-[#0E1B4D] flex items-center justify-center text-[8px] text-white font-bold -ml-2 border-2 border-white shadow-sm">INR</div>
              </div>
              <span>DAI to INR</span>
            </div>
          </div>

          <div className="mt-8 z-10 relative w-full max-w-4xl bg-white/50 backdrop-blur-xl border border-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_8px_32px_rgba(14,27,77,0.05)] text-left">
            <h3 className="text-2xl font-[800] text-[#0E1B4D] mb-8 text-center">Why Swap with Us?</h3>
            <ul className="grid sm:grid-cols-2 gap-8">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#A99CFF] to-[#6366F1] flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[#0E1B4D] font-bold text-[17px] mb-1">Zero Hidden Fees</h4>
                  <p className="text-[#64748B] text-[15px] font-medium leading-relaxed">What you see is exactly what you get. No unexpected gas spikes or markup.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#A99CFF] to-[#6366F1] flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[#0E1B4D] font-bold text-[17px] mb-1">Sub-second Execution</h4>
                  <p className="text-[#64748B] text-[15px] font-medium leading-relaxed">Trades are routed instantly, ensuring you never miss a market move.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#A99CFF] to-[#6366F1] flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[#0E1B4D] font-bold text-[17px] mb-1">Polygon & BNB Supported</h4>
                  <p className="text-[#64748B] text-[15px] font-medium leading-relaxed">Cross-chain swaps natively built in for fast Polygon and BNB interoperability.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#A99CFF] to-[#6366F1] flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[#0E1B4D] font-bold text-[17px] mb-1">Institutional Security</h4>
                  <p className="text-[#64748B] text-[15px] font-medium leading-relaxed">Fully audited smart contracts ensure your funds are always safe.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#A99CFF] to-[#6366F1] flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[#0E1B4D] font-bold text-[17px] mb-1">Immediate Withdrawal</h4>
                  <p className="text-[#64748B] text-[15px] font-medium leading-relaxed">Access your funds the very second your trade executes. No waiting periods.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#A99CFF] to-[#6366F1] flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[#0E1B4D] font-bold text-[17px] mb-1">24/7 Premium Support</h4>
                  <p className="text-[#64748B] text-[15px] font-medium leading-relaxed">Our dedicated team of crypto experts is available around the clock to assist you.</p>
                </div>
              </li>
            </ul>

            <div className="mt-10 flex justify-center">
              <button
                onClick={() => handleConnect('/swap')}
                className="bg-gradient-to-br from-[#0E1B4D] to-[#1A2C6B] text-white px-10 py-4 rounded-2xl font-bold text-[17px] transition-all duration-300 hover:scale-[1.03] shadow-xl shadow-[#0E1B4D]/25 inline-flex items-center gap-2"
              >
                Get Easy Swap
                <svg className="w-5 h-5 text-[#A99CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- LOAN DETAILS SECTION --- */}
      <section id="loan-details" className="max-w-[1400px] mx-auto px-1 sm:px-8 mt-8 sm:mt-32 relative z-20 scroll-mt-24">
        <div className="bg-[#0E1B4D] rounded-[24px] sm:rounded-[40px] p-6 sm:p-8 lg:p-16 shadow-[0_32px_64px_-12px_rgba(14,27,77,0.4)] text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 sm:gap-16">
          {/* Background glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#A99CFF]/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#6366F1]/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="lg:w-1/2 relative z-10 flex flex-col gap-8 items-center lg:items-start text-center lg:text-left">
            <div>
              <h2 className="text-4xl lg:text-5xl font-[800] mb-4 leading-tight tracking-tight">Get Cash From <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A99CFF] to-[#D9A85C]">Your Crypto</span></h2>
              <p className="text-[#94A3B8] text-lg lg:text-xl font-medium leading-relaxed max-w-[500px] mx-auto lg:mx-0">Get instant cash loans without selling your crypto. Our over-collateralized loans protect your assets while giving you immediate liquidity.</p>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 mt-4 w-full max-w-[280px] sm:max-w-none">
                <div className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 bg-white/5 backdrop-blur-md rounded-full px-5 py-3 sm:py-2 border border-white/10 text-white font-bold text-[13px] sm:text-[14px]">
                  <span className="text-base leading-none">🏦</span> No Bank Details Needed
                </div>
                <div className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 bg-white/5 backdrop-blur-md rounded-full px-5 py-3 sm:py-2 border border-white/10 text-white font-bold text-[13px] sm:text-[14px]">
                  <span className="text-base leading-none">🗂</span> Less Documents Required
                </div>
               
                <div className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 bg-white/5 backdrop-blur-md rounded-full px-5 py-3 sm:py-2 border border-white/10 text-white font-bold text-[13px] sm:text-[14px]">
                  <span className="text-base leading-none">💸</span> Zero Hidden Fees
                </div>
                <div className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap gap-2 bg-white/5 backdrop-blur-md rounded-full px-5 py-3 sm:py-2 border border-white/10 text-white font-bold text-[13px] sm:text-[14px]">
                  <span className="text-base leading-none">⚡</span> Instant Loan
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 mt-4 text-left w-full max-w-[400px] mx-auto lg:mx-0">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/10 flex-shrink-0">1</div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold mb-1 text-white">Check Eligibility</h3>
                  <p className="text-[#94A3B8] leading-relaxed">Instantly verify your borrowing limits based on your digital asset portfolio.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/10 flex-shrink-0">2</div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold mb-1 text-white">Connect Wallet</h3>
                  <p className="text-[#94A3B8] leading-relaxed">Securely connect your Web3 wallet to provide collateral seamlessly.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/10 flex-shrink-0">3</div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold mb-1 text-white">Instant Approval</h3>
                  <p className="text-[#94A3B8] leading-relaxed">No credit checks or paperwork. Your loan is approved automatically based on your assets.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gradient-to-br from-[#D9A85C] to-[#FCD34D] rounded-2xl flex items-center justify-center text-[#0E1B4D] font-bold text-lg shadow-inner border border-white/20 flex-shrink-0">4</div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold mb-1 text-white">Withdraw Funds</h3>
                  <p className="text-[#94A3B8] leading-relaxed">Receive USDT or USDC directly to your wallet in seconds, ready to spend.</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => handleConnect('/loan')}
                className="bg-gradient-to-r from-[#D9A85C] to-[#F59E0B] text-[#0E1B4D] px-10 py-4 rounded-2xl font-[800] text-[17px] transition-all duration-300 hover:scale-[1.03] shadow-xl shadow-[#D9A85C]/20 inline-flex items-center gap-2 border border-[#F59E0B]/50"
              >
                Get Loan
                <svg className="w-5 h-5 text-[#0E1B4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 relative z-10 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px]">
              <img src="/loan-vault.png" alt="Crypto Vault" className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* --- REVIEWS SECTION --- */}
      <section id="reviews" className="max-w-[1400px] mx-auto px-1 sm:px-8 mt-10 sm:mt-32 relative z-20 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <h2 className="text-4xl lg:text-5xl font-[800] text-[#0E1B4D] mb-4">Customer <span className="text-[#00B67A]">Reviews</span></h2>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
            <span className="text-xl font-bold text-[#1A1A1A]">4.5/5 Excellent</span>
            <div className="flex items-center gap-[2px]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-[#00B67A] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[#64748B] font-medium text-[15px]">
              <span>10,000+ Reviews on</span>
              <span className="text-[#1A1A1A] font-bold flex items-center gap-1">
                <span className="text-[#00B67A] text-lg leading-none">★</span> Trustpilot
              </span>
            </div>
          </div>
          <p className="text-[#475569] text-lg lg:text-xl">Don't just take our word for it. See what our global community of users has to say about their seamless, zero-freeze experience with InstaaCash.</p>
        </div>
        <div className="relative w-full overflow-hidden flex py-4 group">
          {/* Subtle gradient masks for smooth fade effect on edges */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#DDE3F0] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#DDE3F0] to-transparent z-10 pointer-events-none"></div>

          <div className="flex w-max animate-marquee gap-8 pause-on-hover">
            {[
              { name: "Alex Chen", reviews: "2 reviews", rating: 5, title: "Instant swap feature is a lifesaver", text: "The instant swap feature is a lifesaver. No slippage and incredibly fast execution. Highly recommended!" },
              { name: "Sarah Jenkins", reviews: "5 reviews", rating: 4, title: "Loan in 30 seconds!", text: "I needed liquidity but didn't want to sell my ETH. InstaaCash gave me a loan in 30 seconds. Unbelievable." },
              { name: "Michael Ross", reviews: "1 review", rating: 5, title: "Gorgeous UI & Audited", text: "The UI is gorgeous and the smart contracts are fully audited. Finally, a platform that feels truly premium." },
              { name: "Elena Rodriguez", reviews: "4 reviews", rating: 4.5, title: "Stunning design and easy to use", text: "I've tried many platforms, but this is by far the easiest way to manage my crypto loans. The design is absolutely stunning!" },
              { name: "David Kim", reviews: "8 reviews", rating: 5, title: "Zero hidden fees", text: "Zero hidden fees is not just a marketing gimmick here. I get exactly what I expect on every swap. 10/10." },
              { name: "Anita Patel", reviews: "3 reviews", rating: 4.5, title: "My go-to decentralized hub", text: "The cross-chain swap capabilities combined with institutional security make this my go-to decentralized hub." },
              // Duplicate the exact same array to create a seamless infinite scroll loop
              { name: "Alex Chen", reviews: "2 reviews", rating: 5, title: "Instant swap feature is a lifesaver", text: "The instant swap feature is a lifesaver. No slippage and incredibly fast execution. Highly recommended!" },
              { name: "Sarah Jenkins", reviews: "5 reviews", rating: 4, title: "Loan in 30 seconds!", text: "I needed liquidity but didn't want to sell my ETH. InstaaCash gave me a loan in 30 seconds. Unbelievable." },
              { name: "Michael Ross", reviews: "1 review", rating: 5, title: "Gorgeous UI & Audited", text: "The UI is gorgeous and the smart contracts are fully audited. Finally, a platform that feels truly premium." },
              { name: "Elena Rodriguez", reviews: "4 reviews", rating: 4.5, title: "Stunning design and easy to use", text: "I've tried many platforms, but this is by far the easiest way to manage my crypto loans. The design is absolutely stunning!" },
              { name: "David Kim", reviews: "8 reviews", rating: 5, title: "Zero hidden fees", text: "Zero hidden fees is not just a marketing gimmick here. I get exactly what I expect on every swap. 10/10." },
              { name: "Anita Patel", reviews: "3 reviews", rating: 4.5, title: "My go-to decentralized hub", text: "The cross-chain swap capabilities combined with institutional security make this my go-to decentralized hub." }
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 flex flex-col gap-3 w-[280px] sm:w-[360px] shrink-0 hover:shadow-md transition-shadow cursor-default text-left">
                {/* User Info Top */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-[#1A1A1A] font-bold text-[14px] leading-tight">{review.name}</h4>
                    <p className="text-gray-500 text-[12px]">{review.reviews}</p>
                  </div>
                </div>

                {/* Stars & Date */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-[2px]">
                    {[...Array(5)].map((_, idx) => {
                      const isFull = idx + 1 <= review.rating;
                      const isHalf = idx + 0.5 === review.rating;
                      const bgClass = isFull
                        ? "bg-[#00B67A]"
                        : isHalf
                          ? "bg-[linear-gradient(to_right,#00B67A_50%,#D1D5DB_50%)]"
                          : "bg-gray-300";

                      return (
                        <div key={idx} className={`w-[22px] h-[22px] ${bgClass} flex items-center justify-center`}>
                          <svg className="w-[14px] h-[14px] text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-gray-500 text-[12px] ml-1">2 days ago</span>
                </div>

                {/* Review Body */}
                <div className="mt-1">
                  <h3 className="text-[#1A1A1A] font-bold text-[15px] leading-snug mb-1">{review.title}</h3>
                  <p className="text-[#1A1A1A] text-[14px] leading-relaxed">{review.text}</p>
                </div>

                <div className="mt-auto pt-3 text-[13px] text-gray-500 font-medium">
                  Date of experience: <span className="font-normal text-[#1A1A1A]">June 18, 2026</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="max-w-[1400px] mx-auto px-1 sm:px-8 mt-10 sm:mt-32 mb-10 sm:mb-20 relative z-20 scroll-mt-24">
        <div className="bg-white/50 backdrop-blur-2xl border border-white/80 rounded-[40px] p-8 lg:p-16 shadow-[0_20px_60px_-15px_rgba(169,156,255,0.2)] flex flex-col lg:flex-row items-center gap-4 lg:gap-16 relative overflow-hidden">

          {/* Decorative Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-br from-[#A99CFF] to-[#D9A85C] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-[#6366F1] to-[#4338CA] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>

          {/* Left Text Side */}
          <div className="lg:w-1/2 relative z-10 flex flex-col items-start text-left">
           

            <h2 className="text-4xl lg:text-5xl font-[800] text-[#0E1B4D] mb-6 leading-tight tracking-tight">
              ABOUT<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A99CFF]">InstaaCash.</span>
            </h2>

            <p className="text-[#475569] text-lg lg:text-xl font-medium leading-relaxed max-w-xl mb-6">
              We believe that crypto finance should be accessible, beautiful, and inherently secure. InstaaCash was built by a team of Web3 veterans to merge complex DeFi protocols with a consumer-friendly experience.
            </p>

            <p className="text-[#475569] text-lg lg:text-xl font-medium leading-relaxed max-w-xl mb-0 lg:mb-10">
              Our mission is to empower everyone to unlock the absolute full potential of their digital assets without the traditional barriers.
            </p>

          </div>

          {/* Right Image Side */}
          <div className="lg:w-1/2 relative z-10 flex justify-center">
            <div className="relative w-full max-w-[550px]">
              <img
                src="/about-image.png"
                alt="InstaaCash Team Illustration"
                className="w-full h-auto object-contain drop-shadow-[0_30px_60px_rgba(14,27,77,0.15)] animate-float"
              />
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER SECTION --- */}
      <footer className="w-full bg-[#0E1B4D] mt-24 relative overflow-hidden z-20 rounded-t-[40px] sm:rounded-t-[64px]">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#A99CFF]/50 to-transparent"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#6366F1] blur-[150px] opacity-20 rounded-full pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pt-20 pb-10 relative z-10 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

            {/* Brand Col */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A99CFF] to-[#6366F1] flex items-center justify-center relative shadow-lg">
                  <span className="text-white font-bold text-[16px]">C</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-tr from-[#D9A85C] to-[#FCD34D] rounded-full border-2 border-[#0E1B4D]"></div>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">InstaaCash</span>
              </div>
              <p className="text-[#94A3B8] text-[15px] leading-relaxed">
                The most elegant, zero-friction decentralized platform for instant swaps and over-collateralized crypto loans.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a5.96 5.96 0 0 0-.202.004C7.79 1.507 5.18 4.076 3.65 6.456c-.05.076-.096.155-.145.232v.001A11.968 11.968 0 0 0 0 12a11.964 11.964 0 0 0 2.827 7.747l-.004-.006c.038.05.076.096.115.143 1.625 2.147 4.14 4.093 7.828 4.116-.264-1.508.384-3.053 1.76-4.004a4.112 4.112 0 0 1 2.373-.75h.001c.71 0 1.401.185 2.016.538 1.137.653 1.954 1.767 2.261 3.036 1.839-1.391 3.197-3.418 3.754-5.748-1.547-.197-2.915-1.026-3.83-2.316a4.267 4.267 0 0 1-.774-2.583v-.002c0-.987.329-1.93.931-2.705.867-1.116 2.164-1.802 3.593-1.895C21.758 4.708 17.518.256 11.944 0z" /></svg>
                </a>
              </div>
            </div>

            {/* Links 1 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-lg mb-2">Platform</h4>
              <a href="#swap" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">Instant Swap</a>
              <a href="#loan-details" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">Crypto Loans</a>
              <a href="#services" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">Features</a>
              <a href="#reviews" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">Testimonials</a>
            </div>

            {/* Links 2 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-lg mb-2">Company</h4>
              <a href="#about" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">About Us</a>
              <a href="#" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">Careers</a>
              <a href="#" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">Privacy Policy</a>
              <a href="#" className="text-[#94A3B8] hover:text-[#A99CFF] hover:translate-x-1 transition-all w-fit">Terms of Service</a>
            </div>

            {/* CTA Col */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <h4 className="text-white font-bold text-lg mb-2">Stay Updated</h4>
              <p className="text-[#94A3B8] text-[14px]">Join our newsletter for the latest DeFi news and platform updates.</p>
              <div className="flex mt-2">
                <input type="email" placeholder="Enter your email" className="bg-white/5 border border-white/10 rounded-l-xl px-4 py-3 text-white focus:outline-none focus:border-[#A99CFF]/50 w-full text-[14px]" />
                <button className="bg-gradient-to-r from-[#D9A85C] to-[#F59E0B] text-[#0E1B4D] font-bold px-4 py-3 rounded-r-xl text-[14px] hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#64748B] text-sm">© 2026 InstaaCash. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#64748B] text-sm"><span className="w-2 h-2 rounded-full bg-green-500"></span> Systems Operational</div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;
