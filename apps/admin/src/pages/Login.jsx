import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuthLogin';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: loginMutation, isPending, isError, error } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation({ username, password });
  };

  const errorMessage = isError ? (error?.error || error?.message || 'Failed to login') : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="bg-zinc-900/80 p-10 rounded-3xl shadow-2xl border border-zinc-800/50 w-full max-w-md backdrop-blur-xl relative z-10">
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <span className="text-zinc-950 font-black text-3xl">S</span>
           </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-center mb-2 text-zinc-100 tracking-tight">Admin Portal</h1>
        <p className="text-zinc-400 text-center mb-8 font-medium">Sign in to manage SwapStore</p>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center text-sm font-bold flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{errorMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-zinc-600"
              required
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-zinc-600"
              required
              disabled={isPending}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-lg py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center"
          >
            {isPending ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isPending ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

