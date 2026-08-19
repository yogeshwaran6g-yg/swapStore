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
    <div className="w-full mt-4">
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-bold text-[#1E293B] tracking-wide">
          {title}
        </h3>
      </div>
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
