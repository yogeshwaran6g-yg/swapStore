import React from 'react';

/**
 * Reusable section wrapper that provides a titled container with a responsive grid.
 *
 * @param {Object} props
 * @param {string} props.title    - Section heading text
 * @param {React.ReactNode} props.children - Token balance cards
 * @param {string} [props.icon]   - Optional emoji/icon to show before the title
 */
export function TokenSection({ title, children, icon, colorTheme = "bg-[#22C55E]" }) {
  const textTheme = colorTheme.replace('bg-', 'text-');
  return (
    <div className="w-full relative bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden group mb-6">
      {/* Decorative background waves */}
      <div className={`absolute right-0 bottom-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${textTheme}`}>
        <svg width="250" height="150" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 100 C 50 100, 50 50, 100 50 C 150 50, 150 0, 200 0 L 200 100 Z" fill="currentColor" />
          <path d="M50 100 C 100 100, 100 60, 150 60 C 200 60, 200 20, 250 20 L 250 100 Z" fill="currentColor" opacity="0.5" />
          <path d="M100 100 C 150 100, 150 70, 200 70 C 250 70, 250 30, 300 30 L 300 100 Z" fill="currentColor" opacity="0.3" />
        </svg>
      </div>

      {/* Left colored border */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${colorTheme}`}></div>

      <div className="p-5 sm:p-6 pl-6 sm:pl-8">
        <div className="flex items-center gap-4 mb-5">
          {icon && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${colorTheme}`}>
              {icon}
            </div>
          )}
          <h3 className="text-[19px] font-bold text-[#1E293B] tracking-wide">
            {title}
          </h3>
        </div>
        
        <div className="relative z-10 w-full lg:w-[100%]">
          {children}
        </div>
      </div>
    </div>
  );
}
