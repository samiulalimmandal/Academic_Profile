import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Download,
  ExternalLink,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  LogOut,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useDriveAuth } from '../context/DriveAuthContext';
import {
  createDriveFolder,
  deleteDriveFile,
  downloadDriveFile,
  FOLDER_MIME,
  listDriveFiles,
  renameDriveFile,
  uploadBlobToDrive,
  type DriveCategory,
  type DriveFile,
} from '../services/googleDrive';
import type { PortfolioData } from '../types/academic';

interface DrivePageProps {
  data: PortfolioData;
}

interface FolderCrumb {
  id: string;
  name: string;
}

type PendingAction =
  | { kind: 'delete'; file: DriveFile }
  | { kind: 'rename'; file: DriveFile; newName: string }
  | { kind: 'createFolder'; folderName: string }
  | { kind: 'uploadFile'; file: File }
  | { kind: 'backupJson' };

function formatBytes(raw?: string): string {
  if (!raw) return '—';
  const bytes = Number(raw);
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatMimeLabel(mime: string): string {
  if (mime === FOLDER_MIME) return 'Folder';
  if (mime === 'application/pdf') return 'PDF Document';
  if (mime === 'application/vnd.google-apps.document') return 'Google Doc';
  if (mime === 'application/vnd.google-apps.spreadsheet') return 'Google Sheet';
  if (mime === 'application/vnd.google-apps.presentation') return 'Google Slides';
  if (mime.startsWith('image/')) return 'Image';
  if (mime === 'application/json') return 'JSON Data';
  return 'File';
}

function renderFileIcon(mime: string) {
  if (mime === FOLDER_MIME) {
    return <Folder className="h-4 w-4 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />;
  }
  if (mime === 'application/pdf' || mime === 'application/vnd.google-apps.document') {
    return <FileText className="h-4 w-4 text-[#9A3412] dark:text-[#FDBA74]" aria-hidden="true" />;
  }
  if (mime === 'application/vnd.google-apps.spreadsheet') {
    return <FileSpreadsheet className="h-4 w-4 text-[#14532D] dark:text-[#4ADE80]" aria-hidden="true" />;
  }
  if (mime.startsWith('image/')) {
    return <ImageIcon className="h-4 w-4 text-[#1E3A8A] dark:text-[#93C5FD]" aria-hidden="true" />;
  }
  return <FileIcon className="h-4 w-4 text-[#57534E] dark:text-[#94A3B8]" aria-hidden="true" />;
}

export const DrivePage: React.FC<DrivePageProps> = ({ data }) => {
  const {
    user,
    accessToken,
    needsAuth,
    isLoggingIn,
    authError,
    signIn,
    signOut,
    invalidateToken,
  } = useDriveAuth();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const [category, setCategory] = useState<DriveCategory>('all');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<FolderCrumb[]>([
    { id: 'root', name: 'My Drive' },
  ]);

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFile, setRenamingFile] = useState<DriveFile | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [mutating, setMutating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  const loadFiles = useCallback(async () => {
    if (!accessToken) return;
    setLoadingFiles(true);
    setDriveError(null);
    try {
      const res = await listDriveFiles({
        accessToken,
        folderId: activeSearch ? undefined : currentFolder.id,
        searchQuery: activeSearch || undefined,
        category,
      });
      setFiles(res.files || []);
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 401) {
        invalidateToken();
        setDriveError('Your Google Drive session expired. Please sign in again.');
      } else {
        setDriveError(
          err instanceof Error ? err.message : 'Unable to load Google Drive files.'
        );
      }
    } finally {
      setLoadingFiles(false);
    }
  }, [accessToken, activeSearch, currentFolder.id, category, invalidateToken]);

  useEffect(() => {
    if (accessToken && !needsAuth) {
      loadFiles();
    }
  }, [accessToken, needsAuth, loadFiles]);

  const handleOpenFolder = (folder: DriveFile) => {
    setActiveSearch('');
    setSearchInput('');
    setCategory('all');
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setActiveSearch('');
    setSearchInput('');
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleDownload = async (file: DriveFile) => {
    if (!accessToken) return;
    setDriveError(null);
    try {
      await downloadDriveFile({ accessToken, file });
    } catch (err: unknown) {
      setDriveError(
        err instanceof Error ? err.message : `Unable to download ${file.name}`
      );
    }
  };

  const executePendingAction = async () => {
    if (!pendingAction || !accessToken) return;
    setMutating(true);
    setDriveError(null);
    setStatusNotice(null);

    try {
      if (pendingAction.kind === 'delete') {
        await deleteDriveFile({ accessToken, fileId: pendingAction.file.id });
        setStatusNotice(`Deleted "${pendingAction.file.name}" from Google Drive.`);
      } else if (pendingAction.kind === 'rename') {
        await renameDriveFile({
          accessToken,
          fileId: pendingAction.file.id,
          newName: pendingAction.newName,
        });
        setStatusNotice(
          `Renamed "${pendingAction.file.name}" to "${pendingAction.newName}".`
        );
        setRenamingFile(null);
      } else if (pendingAction.kind === 'createFolder') {
        await createDriveFolder({
          accessToken,
          name: pendingAction.folderName,
          parentId: currentFolder.id,
        });
        setStatusNotice(`Created folder "${pendingAction.folderName}".`);
        setShowNewFolderInput(false);
        setNewFolderName('');
      } else if (pendingAction.kind === 'uploadFile') {
        await uploadBlobToDrive({
          accessToken,
          blob: pendingAction.file,
          name: pendingAction.file.name,
          mimeType: pendingAction.file.type || 'application/octet-stream',
          parentId: currentFolder.id,
        });
        setStatusNotice(`Uploaded "${pendingAction.file.name}" to Google Drive.`);
      } else if (pendingAction.kind === 'backupJson') {
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `meridian-profiles-backup-${timestamp}.json`;
        await uploadBlobToDrive({
          accessToken,
          blob: jsonBlob,
          name: filename,
          mimeType: 'application/json',
          parentId: currentFolder.id,
        });
        setStatusNotice(`Saved "${filename}" to Google Drive.`);
      }

      setPendingAction(null);
      await loadFiles();
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 401) {
        invalidateToken();
      }
      setDriveError(
        err instanceof Error ? err.message : 'Google Drive operation failed.'
      );
      setPendingAction(null);
    } finally {
      setMutating(false);
    }
  };

  const getConfirmCopy = (action: PendingAction | null) => {
    if (!action) {
      return { title: '', description: '', confirmLabel: 'Confirm', destructive: false };
    }
    switch (action.kind) {
      case 'delete':
        return {
          title: 'Delete file from Google Drive?',
          description: `Are you sure you want to permanently delete "${action.file.name}" from your Google Drive? This action cannot be undone.`,
          confirmLabel: 'Delete File',
          destructive: true,
        };
      case 'rename':
        return {
          title: 'Rename file in Google Drive?',
          description: `Rename "${action.file.name}" to "${action.newName}" in Google Drive?`,
          confirmLabel: 'Rename File',
          destructive: false,
        };
      case 'createFolder':
        return {
          title: 'Create folder in Google Drive?',
          description: `Create a new folder named "${action.folderName}" inside "${currentFolder.name}"?`,
          confirmLabel: 'Create Folder',
          destructive: false,
        };
      case 'uploadFile':
        return {
          title: 'Upload file to Google Drive?',
          description: `Upload "${action.file.name}" (${formatBytes(
            String(action.file.size)
          )}) into "${currentFolder.name}"?`,
          confirmLabel: 'Upload File',
          destructive: false,
        };
      case 'backupJson':
        return {
          title: 'Save portfolio backup to Google Drive?',
          description: `Save a JSON backup of all researcher profiles and publications into "${currentFolder.name}"?`,
          confirmLabel: 'Save Backup',
          destructive: false,
        };
    }
  };

  const confirmCopy = getConfirmCopy(pendingAction);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end md:justify-between dark:border-[#232D3F]">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
            {data.group.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl dark:text-[#F1F5F9]">
            Research Drive Repository
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base dark:text-[#94A3B8]">
            Browse, search, upload, and organize research papers, datasets, CVs, and portfolio backups directly in Google Drive.
          </p>
        </div>

        {!needsAuth && user && (
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <p className="text-xs font-medium text-[#18181B] dark:text-[#F1F5F9]">
                {user.displayName || 'Google Account'}
              </p>
              <p className="font-mono text-[11px] text-[#57534E] dark:text-[#94A3B8]">
                {user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-white px-3.5 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Sign-In Required State */}
      {needsAuth || !accessToken ? (
        <div className="mt-10 rounded-xl border border-[#E5E0D8] bg-white p-8 sm:p-12 dark:border-[#232D3F] dark:bg-[#121824]">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="font-serif text-2xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
              Connect Your Google Drive
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
              Sign in with your Google account to browse research folders, download manuscripts, upload field datasets or CV PDFs, and back up your collective&apos;s portfolio records.
            </p>

            {authError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
              >
                {authError}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <GoogleSignInButton onClick={signIn} loading={isLoggingIn} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col gap-4 rounded-xl border border-[#E5E0D8] bg-white p-5 dark:border-[#232D3F] dark:bg-[#121824]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Breadcrumbs */}
              <nav aria-label="Google Drive folder path" className="flex flex-wrap items-center gap-1 text-xs">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={crumb.id}>
                      {idx > 0 && (
                        <ChevronRight
                          className="h-3.5 w-3.5 text-[#57534E] dark:text-[#94A3B8]"
                          aria-hidden="true"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleBreadcrumbClick(idx)}
                        disabled={isLast && !activeSearch}
                        className={`rounded px-2 py-1 font-medium transition-colors ${
                          isLast && !activeSearch
                            ? 'text-[#18181B] dark:text-[#F1F5F9]'
                            : 'text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#1E3A8A] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-[#60A5FA]'
                        }`}
                      >
                        {crumb.name}
                      </button>
                    </React.Fragment>
                  );
                })}
              </nav>

              {/* Primary Drive Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    e.target.value = '';
                    if (selected) {
                      setPendingAction({ kind: 'uploadFile', file: selected });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNewFolderInput((v) => !v)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3.5 py-1.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                >
                  <FolderPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>New Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingAction({ kind: 'backupJson' })}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3.5 py-1.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Backup Portfolio JSON</span>
                </button>

                <button
                  type="button"
                  onClick={loadFiles}
                  disabled={loadingFiles}
                  aria-label="Refresh Drive files"
                  className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#E5E0D8] bg-white text-[#57534E] transition-colors hover:bg-[#F2EFE9] hover:text-[#18181B] dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-[#F1F5F9]"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${loadingFiles ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            {showNewFolderInput && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newFolderName.trim();
                  if (!trimmed) return;
                  setPendingAction({ kind: 'createFolder', folderName: trimmed });
                }}
                className="flex flex-wrap items-center gap-2 border-t border-[#E5E0D8] pt-3 dark:border-[#232D3F]"
              >
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter research folder name..."
                  aria-label="New folder name"
                  className="h-10 flex-1 min-w-[200px] rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-xs text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:focus:border-[#60A5FA]"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-[40px] items-center rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-medium text-white hover:bg-[#172554] dark:bg-[#3B82F6]"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }}
                  className="inline-flex min-h-[40px] items-center rounded-lg border border-[#E5E0D8] px-3 py-2 text-xs font-medium text-[#57534E] hover:bg-[#F2EFE9] dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:bg-[#192130]"
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="flex flex-col gap-3 border-t border-[#E5E0D8]/80 pt-3 lg:flex-row lg:items-center lg:justify-between dark:border-[#232D3F]/80">
              <div
                className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 self-start dark:bg-[#192130]"
                role="group"
                aria-label="Filter Drive files by type"
              >
                {(
                  [
                    { key: 'all', label: 'All Files' },
                    { key: 'folders', label: 'Folders' },
                    { key: 'pdfs', label: 'PDFs & Papers' },
                    { key: 'docs', label: 'Docs & Sheets' },
                    { key: 'images', label: 'Images' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCategory(tab.key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      category === tab.key
                        ? 'bg-white text-[#18181B] shadow-xs dark:bg-[#0B0F17] dark:text-[#F1F5F9]'
                        : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setActiveSearch(searchInput.trim());
                }}
                className="flex items-center gap-2"
              >
                <div className="relative w-full sm:w-72">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#57534E] dark:text-[#94A3B8]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (!e.target.value.trim()) setActiveSearch('');
                    }}
                    placeholder="Search Google Drive files..."
                    aria-label="Search Google Drive files"
                    className="h-10 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] pr-3 pl-9 text-xs text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-lg border border-[#E5E0D8] bg-white px-3.5 text-xs font-medium text-[#18181B] hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {driveError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              {driveError}
            </div>
          )}

          {statusNotice && (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {statusNotice}
            </div>
          )}

          {/* Rename Inline Bar */}
          {renamingFile && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = renameDraft.trim();
                if (!trimmed || trimmed === renamingFile.name) return;
                setPendingAction({
                  kind: 'rename',
                  file: renamingFile,
                  newName: trimmed,
                });
              }}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[#1E3A8A]/30 bg-white p-4 dark:border-[#60A5FA]/30 dark:bg-[#121824]"
            >
              <span className="text-xs font-medium text-[#57534E] dark:text-[#94A3B8]">
                Rename &ldquo;{renamingFile.name}&rdquo; to:
              </span>
              <input
                type="text"
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                aria-label="New file name"
                className="h-9 flex-1 min-w-[200px] rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-xs text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9]"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-lg bg-[#1E3A8A] px-3.5 text-xs font-medium text-white hover:bg-[#172554] dark:bg-[#3B82F6]"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => setRenamingFile(null)}
                className="inline-flex h-9 items-center rounded-lg border border-[#E5E0D8] px-3 text-xs font-medium text-[#57534E] hover:bg-[#F2EFE9] dark:border-[#232D3F] dark:text-[#94A3B8]"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Drive File List */}
          <div className="overflow-hidden rounded-xl border border-[#E5E0D8] bg-white dark:border-[#232D3F] dark:bg-[#121824]">
            {loadingFiles ? (
              <div className="p-12 text-center text-sm text-[#57534E] dark:text-[#94A3B8]">
                Loading files from Google Drive...
              </div>
            ) : files.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-serif text-lg font-medium text-[#18181B] dark:text-[#F1F5F9]">
                  No files found in this view
                </p>
                <p className="mt-1.5 text-xs text-[#57534E] dark:text-[#94A3B8]">
                  Upload a research document, create a folder, or adjust your filter above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E0D8] bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:border-[#232D3F] dark:bg-[#0E131D] dark:text-[#94A3B8]">
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-4 py-3.5">Type</th>
                      <th className="px-4 py-3.5">Modified</th>
                      <th className="px-4 py-3.5">Size</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]/80 dark:divide-[#232D3F]/80">
                    {files.map((file) => {
                      const isFolder = file.mimeType === FOLDER_MIME;
                      return (
                        <tr
                          key={file.id}
                          className="transition-colors hover:bg-[#FAF8F5] dark:hover:bg-[#192130]/50"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              {renderFileIcon(file.mimeType)}
                              {isFolder ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenFolder(file)}
                                  className="truncate text-left font-medium text-[#18181B] hover:text-[#1E3A8A] hover:underline dark:text-[#F1F5F9] dark:hover:text-[#60A5FA]"
                                >
                                  {file.name}
                                </button>
                              ) : (
                                <span className="truncate font-medium text-[#18181B] dark:text-[#F1F5F9]">
                                  {file.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[#57534E] whitespace-nowrap dark:text-[#94A3B8]">
                            {formatMimeLabel(file.mimeType)}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#57534E] whitespace-nowrap dark:text-[#94A3B8]">
                            {formatDate(file.modifiedTime)}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#57534E] whitespace-nowrap dark:text-[#94A3B8]">
                            {formatBytes(file.size)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open in Google Drive"
                                  aria-label={`Open ${file.name} in Google Drive`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E0D8] text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#1E3A8A] dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-[#60A5FA]"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                              )}
                              {!isFolder && (
                                <button
                                  type="button"
                                  onClick={() => handleDownload(file)}
                                  title="Download file"
                                  aria-label={`Download ${file.name}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E0D8] text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#1E3A8A] dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-[#60A5FA]"
                                >
                                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingFile(file);
                                  setRenameDraft(file.name);
                                }}
                                title="Rename"
                                aria-label={`Rename ${file.name}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E0D8] text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#18181B] dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-white"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingAction({ kind: 'delete', file })}
                                title="Delete"
                                aria-label={`Delete ${file.name}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E0D8] text-[#57534E] hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmActionModal
        open={Boolean(pendingAction)}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        destructive={confirmCopy.destructive}
        loading={mutating}
        onConfirm={executePendingAction}
        onCancel={() => !mutating && setPendingAction(null)}
      />
    </div>
  );
};
