import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}
