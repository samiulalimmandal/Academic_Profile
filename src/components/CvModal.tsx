import React, { useEffect } from 'react';
import { Download, ExternalLink, FileText, X } from 'lucide-react';
import type { AcademicMember } from '../types/academic';

interface CvModalProps {
  member: AcademicMember | null;
  onClose: () => void;
}

export const CvModal: React.FC<CvModalProps> = ({ member, onClose }) => {
  useEffect(() => {
    if (!member) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [member, onClose]);

  if (!member) return null;

  const pdfFilename = `${member.id}-cv.pdf`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      onClick={onClose}
    >
      <div
        className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#E5E0D8] bg-white shadow-2xl dark:border-[#232D3F] dark:bg-[#121824]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D8] px-5 py-4 dark:border-[#232D3F]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2EFE9] text-[#1E3A8A] dark:bg-[#192130] dark:text-[#60A5FA]">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="cv-modal-title"
                className="truncate font-serif text-lg font-semibold text-[#18181B] dark:text-[#F1F5F9]"
              >
                Curriculum Vitae — {member.name}
              </h2>
              <p className="truncate text-xs text-[#57534E] dark:text-[#94A3B8]">
                {member.designation} · {member.institution}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={member.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#192130] dark:text-[#F1F5F9] dark:hover:bg-[#232D3F]"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Open in Browser Tab
            </a>
            <a
              href={member.cvUrl}
              download={pdfFilename}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close CV preview"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E0D8] text-[#57534E] transition-colors hover:bg-[#F2EFE9] hover:text-[#18181B] dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-[#F2EFE9] dark:bg-[#0B0F17]">
          <iframe
            src={member.cvUrl}
            title={`Academic CV PDF for ${member.name}`}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
