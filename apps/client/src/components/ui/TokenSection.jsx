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
    <div className="w-full mt-6 space-y-4">
      <h3 className="text-xl font-medium text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}
