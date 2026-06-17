import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

export const DataTable = ({ data, columns, meta, renderSubComponent }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta,
  });

  return (
    <div className="bg-zinc-900/50 rounded-2xl shadow-xl border border-zinc-800/50 overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-zinc-900/80 border-b border-zinc-800/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-bold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500 font-medium">
                  No data available.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => renderSubComponent ? toggleRow(row.id) : null}
                    className={`transition-colors border-b border-zinc-800/50 last:border-0 ${renderSubComponent ? 'cursor-pointer hover:bg-zinc-800/50' : 'hover:bg-zinc-800/50'}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {renderSubComponent && expandedRows[row.id] && (
                    <tr className="bg-zinc-950/40">
                      <td colSpan={columns.length} className="p-0 border-b border-zinc-800/50">
                        {renderSubComponent(row.original)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
