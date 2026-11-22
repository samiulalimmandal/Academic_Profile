import React, { useCallback, useEffect, useState } from 'react';
import {
  ExternalLink,
  FileEdit,
  Inbox,
  LogOut,
  Mail,
  MailOpen,
  PenSquare,
  RefreshCw,
  Reply,
  Search,
  Send,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useDriveAuth } from '../context/DriveAuthContext';
import {
  buildGmailWebComposeUrl,
  createGmailDraft,
  listGmailMessages,
  sendGmailMessage,
  setGmailMessageReadState,
  trashGmailMessage,
  type GmailMailboxFolder,
  type GmailMessageSummary,
} from '../services/gmail';
import type { PortfolioData } from '../types/academic';

interface MailPageProps {
  data: PortfolioData;
  initialTo?: string;
  initialSubject?: string;
}

type PendingMailAction =
  | { kind: 'send'; to: string; subject: string; body: string }
  | { kind: 'draft'; to: string; subject: string; body: string }
  | { kind: 'trash'; message: GmailMessageSummary };

function formatShortDate(rawDate: string): string {
  if (!rawDate) return '—';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate.slice(0, 16);
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const MailPage: React.FC<MailPageProps> = ({
  data,
  initialTo,
  initialSubject,
}) => {
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

  const [folder, setFolder] = useState<GmailMailboxFolder>('INBOX');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const [composeOpen, setComposeOpen] = useState(Boolean(initialTo));
  const [composeTo, setComposeTo] = useState(initialTo || data.group.email);
  const [composeSubject, setComposeSubject] = useState(initialSubject || '');
  const [composeBody, setComposeBody] = useState('');

  useEffect(() => {
    if (initialTo) {
      setComposeTo(initialTo);
      setComposeSubject(initialSubject || '');
      setComposeOpen(true);
    }
  }, [initialTo, initialSubject]);

  const [pendingAction, setPendingAction] = useState<PendingMailAction | null>(null);
  const [mutating, setMutating] = useState(false);

  const selectedMessage = messages.find((m) => m.id === selectedId) || null;

  const loadMessages = useCallback(async () => {
    if (!accessToken) return;
    setLoadingMessages(true);
    setMailError(null);
    try {
      const list = await listGmailMessages({
        accessToken,
        folder,
        query: activeSearch || undefined,
      });
      setMessages(list);
      setSelectedId((prev) =>
        prev && list.some((m) => m.id === prev) ? prev : list[0]?.id || null
      );
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 401 || status === 403) {
        invalidateToken();
        setMailError(
          'Gmail authorization is required or expired. Please sign in with Google to grant Gmail access.'
        );
      } else {
        setMailError(
          err instanceof Error ? err.message : 'Unable to fetch Gmail messages.'
        );
      }
    } finally {
      setLoadingMessages(false);
    }
  }, [accessToken, folder, activeSearch, invalidateToken]);

  useEffect(() => {
    if (accessToken && !needsAuth) {
      loadMessages();
    }
  }, [accessToken, needsAuth, loadMessages]);

  const handleToggleUnread = async (msg: GmailMessageSummary) => {
    if (!accessToken) return;
    try {
      await setGmailMessageReadState({
        accessToken,
        messageId: msg.id,
        unread: !msg.isUnread,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isUnread: !msg.isUnread } : m))
      );
    } catch (err: unknown) {
      setMailError(
        err instanceof Error ? err.message : 'Unable to update read status.'
      );
    }
  };

  const handleReply = (msg: GmailMessageSummary) => {
    const replyMatch = msg.from.match(/<([^>]+)>/);
    const replyEmail = replyMatch ? replyMatch[1] : msg.from;
    setComposeTo(replyEmail);
    setComposeSubject(
      msg.subject.toLowerCase().startsWith('re:') ? msg.subject : `Re: ${msg.subject}`
    );
    setComposeBody(`\n\n--- On ${msg.date}, ${msg.from} wrote ---\n${msg.bodyText}`);
    setComposeOpen(true);
  };

  const executePendingAction = async () => {
    if (!pendingAction || !accessToken) return;
    setMutating(true);
    setMailError(null);
    setStatusNotice(null);

    try {
      if (pendingAction.kind === 'send') {
        await sendGmailMessage({
          accessToken,
          to: pendingAction.to,
          subject: pendingAction.subject,
          body: pendingAction.body,
        });
        setStatusNotice(`Email sent to ${pendingAction.to}.`);
        setComposeOpen(false);
        setComposeSubject('');
        setComposeBody('');
      } else if (pendingAction.kind === 'draft') {
        await createGmailDraft({
          accessToken,
          to: pendingAction.to,
          subject: pendingAction.subject,
          body: pendingAction.body,
        });
        setStatusNotice(`Saved draft for ${pendingAction.to} in Gmail.`);
        setComposeOpen(false);
      } else if (pendingAction.kind === 'trash') {
        await trashGmailMessage({
          accessToken,
          messageId: pendingAction.message.id,
        });
        setStatusNotice(`Moved "${pendingAction.message.subject}" to Gmail Trash.`);
      }

      setPendingAction(null);
      await loadMessages();
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 401) {
        invalidateToken();
      }
      setMailError(
        err instanceof Error ? err.message : 'Gmail operation could not be completed.'
      );
      setPendingAction(null);
    } finally {
      setMutating(false);
    }
  };

  const getConfirmDetails = (action: PendingMailAction | null) => {
    if (!action) {
      return { title: '', description: '', confirmLabel: 'Confirm', destructive: false };
    }
    if (action.kind === 'send') {
      return {
        title: 'Send email via Gmail?',
        description: `Send email to "${action.to}" with subject "${action.subject}" from your Google account?`,
        confirmLabel: 'Send Email',
        destructive: false,
      };
    }
    if (action.kind === 'draft') {
      return {
        title: 'Save draft to Gmail?',
        description: `Save draft addressed to "${action.to}" with subject "${action.subject}" in your Gmail Drafts folder?`,
        confirmLabel: 'Save Draft',
        destructive: false,
      };
    }
    return {
      title: 'Move email to Gmail Trash?',
      description: `Move "${action.message.subject}" from ${action.message.from} to Trash in your Gmail account?`,
      confirmLabel: 'Move to Trash',
      destructive: true,
    };
  };

  const confirmDetails = getConfirmDetails(pendingAction);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end md:justify-between dark:border-[#232D3F]">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
            {data.group.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl dark:text-[#F1F5F9]">
            Academic Mail &amp; Correspondence
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base dark:text-[#94A3B8]">
            Read academic messages, compose research correspondence, save drafts, and manage your Gmail inbox directly within the collective portal.
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

      {needsAuth || !accessToken ? (
        <div className="mt-10 rounded-xl border border-[#E5E0D8] bg-white p-8 sm:p-12 dark:border-[#232D3F] dark:bg-[#121824]">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="font-serif text-2xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
              Connect Your Gmail Account
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
              Sign in with Google to browse your inbox, send academic inquiries to researchers or external collaborators, and manage drafts with permission.
            </p>

            {(authError || mailError) && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
              >
                {authError || mailError}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <GoogleSignInButton onClick={signIn} loading={isLoggingIn} />
              <a
                href={buildGmailWebComposeUrl({
                  to: initialTo || data.group.email,
                  subject: initialSubject,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#E5E0D8] bg-[#FAF8F5] px-4 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
              >
                <span>Compose on mail.google.com</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#E5E0D8] bg-white p-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#232D3F] dark:bg-[#121824]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setComposeTo(data.group.email);
                  setComposeSubject('');
                  setComposeBody('');
                  setComposeOpen(true);
                }}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
              >
                <PenSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Compose</span>
              </button>

              <div
                className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 dark:bg-[#192130]"
                role="group"
                aria-label="Filter Gmail folders"
              >
                {(
                  [
                    { key: 'INBOX', label: 'Inbox', icon: Inbox },
                    { key: 'SENT', label: 'Sent', icon: Send },
                    { key: 'DRAFT', label: 'Drafts', icon: FileEdit },
                    { key: 'STARRED', label: 'Starred', icon: Star },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFolder(item.key)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        folder === item.key
                          ? 'bg-white text-[#18181B] shadow-xs dark:bg-[#0B0F17] dark:text-[#F1F5F9]'
                          : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setActiveSearch(searchInput.trim());
                }}
                className="flex flex-1 items-center gap-2"
              >
                <div className="relative w-full sm:w-64">
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
                    placeholder="Search Gmail messages..."
                    aria-label="Search Gmail messages"
                    className="h-9 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] pr-3 pl-9 text-xs text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-lg border border-[#E5E0D8] bg-white px-3 text-xs font-medium text-[#18181B] hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                >
                  Search
                </button>
              </form>

              <button
                type="button"
                onClick={loadMessages}
                disabled={loadingMessages}
                aria-label="Refresh Gmail messages"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E0D8] bg-white text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#18181B] dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-[#F1F5F9]"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingMessages ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {mailError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              {mailError}
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

          {/* Split Message List + Reader */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="overflow-hidden rounded-xl border border-[#E5E0D8] bg-white lg:col-span-5 dark:border-[#232D3F] dark:bg-[#121824]">
              {loadingMessages ? (
                <div className="p-10 text-center text-xs text-[#57534E] dark:text-[#94A3B8]">
                  Loading messages from Gmail...
                </div>
              ) : messages.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="font-serif text-base font-medium text-[#18181B] dark:text-[#F1F5F9]">
                    No messages in this folder
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E0D8]/80 dark:divide-[#232D3F]/80">
                  {messages.map((msg) => {
                    const isSelected = msg.id === selectedId;
                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => setSelectedId(msg.id)}
                        className={`block w-full px-4 py-3.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-[#1E3A8A]/8 dark:bg-[#60A5FA]/12'
                            : 'hover:bg-[#FAF8F5] dark:hover:bg-[#192130]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span
                            className={`truncate ${
                              msg.isUnread
                                ? 'font-semibold text-[#18181B] dark:text-[#F1F5F9]'
                                : 'font-medium text-[#57534E] dark:text-[#94A3B8]'
                            }`}
                          >
                            {msg.from}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-[#57534E] shrink-0 dark:text-[#94A3B8]">
                            {formatShortDate(msg.date)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 truncate text-sm ${
                            msg.isUnread
                              ? 'font-semibold text-[#1E3A8A] dark:text-[#60A5FA]'
                              : 'font-medium text-[#18181B] dark:text-[#E2E8F0]'
                          }`}
                        >
                          {msg.subject}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-[#57534E] dark:text-[#94A3B8]">
                          {msg.snippet}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#E5E0D8] bg-white p-6 lg:col-span-7 dark:border-[#232D3F] dark:bg-[#121824]">
              {selectedMessage ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E0D8] pb-4 dark:border-[#232D3F]">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif text-xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
                        {selectedMessage.subject}
                      </h2>
                      <p className="mt-2 text-xs text-[#44403C] dark:text-[#CBD5E1]">
                        <span className="font-semibold">From:</span> {selectedMessage.from}
                      </p>
                      {selectedMessage.to && (
                        <p className="mt-0.5 text-xs text-[#57534E] dark:text-[#94A3B8]">
                          <span className="font-semibold">To:</span> {selectedMessage.to}
                        </p>
                      )}
                      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-[#57534E] dark:text-[#94A3B8]">
                        {selectedMessage.date}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReply(selectedMessage)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E0D8] bg-[#FAF8F5] px-2.5 text-xs font-medium text-[#18181B] hover:bg-[#F2EFE9] dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                      >
                        <Reply className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Reply</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleUnread(selectedMessage)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E0D8] bg-[#FAF8F5] px-2.5 text-xs font-medium text-[#18181B] hover:bg-[#F2EFE9] dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                      >
                        {selectedMessage.isUnread ? (
                          <>
                            <MailOpen className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Mark Read</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Mark Unread</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({ kind: 'trash', message: selectedMessage })
                        }
                        aria-label="Move message to Trash"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E0D8] text-[#57534E] hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 max-h-[55vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[#18181B] dark:text-[#E2E8F0]">
                    {selectedMessage.bodyText || 'No message body content.'}
                  </div>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-[#57534E] dark:text-[#94A3B8]">
                  Select a message to read its contents.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {composeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-modal-title"
          onClick={() => setComposeOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-[#E5E0D8] bg-white p-6 shadow-2xl dark:border-[#232D3F] dark:bg-[#121824]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 dark:border-[#232D3F]">
              <h2
                id="compose-modal-title"
                className="font-serif text-xl font-semibold text-[#18181B] dark:text-[#F1F5F9]"
              >
                Compose Academic Email
              </h2>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                aria-label="Close composer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#57534E] hover:bg-[#F2EFE9] dark:text-[#94A3B8] dark:hover:bg-[#192130]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!composeTo.trim() || !composeSubject.trim()) return;
                setPendingAction({
                  kind: 'send',
                  to: composeTo.trim(),
                  subject: composeSubject.trim(),
                  body: composeBody,
                });
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="gmail-compose-to"
                    className="text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                  >
                    To
                  </label>
                  <select
                    aria-label="Quick-fill researcher email"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setComposeTo(e.target.value);
                    }}
                    className="rounded border border-[#E5E0D8] bg-[#FAF8F5] px-2 py-1 text-[11px] text-[#18181B] dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9]"
                  >
                    <option value="">Quick-fill researcher...</option>
                    <option value={data.group.email}>
                      {data.group.name} ({data.group.email})
                    </option>
                    {data.members.map((m) => (
                      <option key={m.id} value={m.contact.email}>
                        {m.name} ({m.contact.email})
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  id="gmail-compose-to"
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-sm text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9]"
                />
              </div>

              <div>
                <label
                  htmlFor="gmail-compose-subject"
                  className="text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                >
                  Subject
                </label>
                <input
                  id="gmail-compose-subject"
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-sm text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9]"
                />
              </div>

              <div>
                <label
                  htmlFor="gmail-compose-body"
                  className="text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                >
                  Message
                </label>
                <textarea
                  id="gmail-compose-body"
                  rows={7}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] p-3 text-sm text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                <a
                  href={buildGmailWebComposeUrl({
                    to: composeTo,
                    subject: composeSubject,
                    body: composeBody,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-white px-3.5 py-2 text-xs font-medium text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#18181B] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-[#F1F5F9]"
                >
                  <span>Open in Gmail Web</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="inline-flex min-h-[40px] items-center rounded-lg border border-[#E5E0D8] px-4 py-2 text-xs font-medium text-[#57534E] hover:bg-[#F2EFE9] dark:border-[#232D3F] dark:text-[#94A3B8] dark:hover:bg-[#192130]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!composeTo.trim() || !composeSubject.trim()) return;
                      setPendingAction({
                        kind: 'draft',
                        to: composeTo.trim(),
                        subject: composeSubject.trim(),
                        body: composeBody,
                      });
                    }}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-[#18181B] hover:bg-[#F2EFE9] dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                  >
                    <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-medium text-white hover:bg-[#172554] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Send via Gmail</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmActionModal
        open={Boolean(pendingAction)}
        title={confirmDetails.title}
        description={confirmDetails.description}
        confirmLabel={confirmDetails.confirmLabel}
        destructive={confirmDetails.destructive}
        loading={mutating}
        onConfirm={executePendingAction}
        onCancel={() => !mutating && setPendingAction(null)}
      />
    </div>
  );
};
