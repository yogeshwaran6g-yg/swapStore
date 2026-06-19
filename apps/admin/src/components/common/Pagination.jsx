import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const rangeStart = Math.max(1, page - delta);
    const rangeEnd = Math.min(totalPages, page + delta);

    if (rangeStart > 1) { pages.push(1); if (rangeStart > 2) pages.push('...'); }
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages) { if (rangeEnd < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  const btnBase = 'flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-lg text-xs font-semibold border transition-all';
  const btnActive = 'bg-amber-500 text-zinc-950 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
  const btnInactive = 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100';
  const btnDisabled = 'bg-zinc-950 text-zinc-700 border-zinc-800/50 cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-1">
      <p className="text-xs text-zinc-500 shrink-0">
        Showing <span className="text-zinc-300 font-semibold">{start}–{end}</span> of{' '}
        <span className="text-zinc-300 font-semibold">{total}</span> records
      </p>
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`}
          title="First page"
        >
          <ChevronsLeft size={14} />
        </button>
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`}
          title="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-zinc-600 text-xs select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} ${page === totalPages ? btnDisabled : btnInactive}`}
          title="Next page"
        >
          <ChevronRight size={14} />
        </button>
        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={`${btnBase} ${page === totalPages ? btnDisabled : btnInactive}`}
          title="Last page"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};
