import React from 'react';

/**
 * Reusable section wrapper that provides a titled container with a responsive grid.
 *
 * @param {Object} props
 * @param {string} props.title    - Section heading text
 * @param {React.ReactNode} props.children - Token balance cards
 * @param {string} [props.icon]   - Optional emoji/icon to show before the title
 */
export function TokenSection({ title, children, icon }) {
  return (
    <div className="w-full mt-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        {icon && <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{icon}</span>}
        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 text-transparent bg-clip-text tracking-wide">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {children}
      </div>
    </div>
  );
}
