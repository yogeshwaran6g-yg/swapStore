import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { resolveDocumentUrl } from '../../utils/documentUrl';

/**
 * DocumentPreviewModal
 * Props:
 *   isOpen       boolean
 *   onClose      () => void
 *   documentUrl  string   — relative or absolute path from resolveDocumentUrl
 *   title        string   — optional label shown in header (e.g. "Aadhaar Card")
 *   status       string   — optional badge: 'pending' | 'approved' | 'rejected'
 */
const statusStyles = {
  pending:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
};

const isImage = (url = '') => /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
const isPdf   = (url = '') => /\.pdf(\?.*)?$/i.test(url);

const DocumentPreviewModal = ({ isOpen, onClose, documentUrl, title = 'Document Preview', status }) => {
  const [zoom, setZoom]       = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);

  const resolvedUrl = resolveDocumentUrl(documentUrl);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setImgLoaded(false);
      setImgError(false);
    }
  }, [isOpen, documentUrl]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fileIsImage = isImage(resolvedUrl);
  const fileIsPdf   = isPdf(resolvedUrl);

  const handleZoomIn  = () => setZoom(z => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));
  const handleRotate  = () => setRotation(r => (r + 90) % 360);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm" />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 capitalize">{title}</h2>
              {status && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyles[status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                  {status}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Image controls */}
            {fileIsImage && (
              <>
                <button onClick={handleZoomOut} title="Zoom out" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs text-zinc-500 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} title="Zoom in" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                  <ZoomIn size={16} />
                </button>
                <button onClick={handleRotate} title="Rotate" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                  <RotateCw size={16} />
                </button>
                <div className="w-px h-5 bg-zinc-700 mx-1" />
              </>
            )}

            {/* Open in new tab */}
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
            {/* Download */}
            <a
              href={resolvedUrl}
              download
              title="Download"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <Download size={16} />
            </a>
            {/* Close */}
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-zinc-950 flex items-center justify-center min-h-[300px] relative">

          {/* ── Image Preview ── */}
          {fileIsImage && (
            <>
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-amber-500" />
                </div>
              )}
              {imgError && (
                <div className="flex flex-col items-center gap-3 text-zinc-500 p-8">
                  <AlertTriangle size={40} className="text-rose-400" />
                  <p className="text-sm">Failed to load image.</p>
                  <a href={resolvedUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-400 underline">Open directly</a>
                </div>
              )}
              <div className="p-4 overflow-auto w-full flex items-center justify-center">
                <img
                  src={resolvedUrl}
                  alt={title}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease',
                    display: imgError ? 'none' : 'block',
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              </div>
            </>
          )}

          {/* ── PDF Preview ── */}
          {fileIsPdf && (
            <iframe
              src={resolvedUrl}
              title={title}
              className="w-full min-h-[60vh]"
              style={{ border: 'none' }}
            />
          )}

          {/* ── Unknown File Type ── */}
          {!fileIsImage && !fileIsPdf && (
            <div className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FileText size={32} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-zinc-200 font-semibold mb-1">Preview not available</p>
                <p className="text-zinc-500 text-sm">This file type cannot be previewed inline.</p>
              </div>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <ExternalLink size={14} />
                Open File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 shrink-0 flex items-center justify-between">
          <p className="text-xs text-zinc-600 truncate max-w-[60%]" title={resolvedUrl}>{resolvedUrl}</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default DocumentPreviewModal;
