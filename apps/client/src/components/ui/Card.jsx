import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}
