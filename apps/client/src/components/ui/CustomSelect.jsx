import React, { useState, useRef, useEffect } from 'react';

export const CustomSelect = ({ value, onChange, options, name, disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <div 
        className={`w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white flex justify-between items-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black/60'} ${isOpen ? 'ring-4 ring-indigo-500/10 border-indigo-500 bg-black/60' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="font-mono truncate">{selectedOption?.label || value}</span>
        <svg className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''} shrink-0 ml-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#13131f] backdrop-blur-xl border border-indigo-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in origin-top">
          <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange({ target: { name, value: option.value } });
                  setIsOpen(false);
                }}
                className={`px-5 py-3 cursor-pointer flex items-center transition-colors font-mono ${value === option.value ? 'bg-indigo-500/20 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-zinc-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
