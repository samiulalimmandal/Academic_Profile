import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#E5E0D8] bg-white p-6 shadow-xl dark:border-[#232D3F] dark:bg-[#121824]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                destructive
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                  : 'bg-[#F2EFE9] text-[#1E3A8A] dark:bg-[#192130] dark:text-[#60A5FA]'
              }`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="confirm-modal-title"
                className="font-serif text-lg font-semibold text-[#18181B] dark:text-[#F1F5F9]"
              >
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#57534E] hover:bg-[#F2EFE9] dark:text-[#94A3B8] dark:hover:bg-[#192130]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] disabled:opacity-60 whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`inline-flex min-h-[40px] items-center justify-center rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors disabled:opacity-60 whitespace-nowrap shrink-0 ${
              destructive
                ? 'bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-[#1E3A8A] hover:bg-[#172554] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
