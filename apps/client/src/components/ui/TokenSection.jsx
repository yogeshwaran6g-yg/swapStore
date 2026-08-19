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
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-white/5 last:border-0 gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-start shrink-0">
        {icon && <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{icon}</span>}
        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 text-transparent bg-clip-text tracking-wide">
          {title}
        </h3>
      </div>
      <div className="w-full sm:w-auto min-w-[240px] flex gap-4 justify-start sm:justify-end">
        {children}
      </div>
    </div>
  );
}
