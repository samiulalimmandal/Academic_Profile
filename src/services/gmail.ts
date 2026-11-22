export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  mimeType?: string;
  body?: {
    data?: string;
    size?: number;
  };
  parts?: GmailMessagePart[];
}

export interface RawGmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: GmailMessageHeader[];
    mimeType?: string;
    body?: {
      data?: string;
      size?: number;
    };
    parts?: GmailMessagePart[];
  };
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  bodyText: string;
  labelIds: string[];
  isUnread: boolean;
}

export type GmailMailboxFolder = 'INBOX' | 'SENT' | 'DRAFT' | 'STARRED';

export function buildGmailWebComposeUrl(params: {
  to: string;
  subject?: string;
  body?: string;
}): string {
  const url = new URL('https://mail.google.com/mail/');
  url.searchParams.set('view', 'cm');
  url.searchParams.set('fs', '1');
  if (params.to) url.searchParams.set('to', params.to);
  if (params.subject) url.searchParams.set('su', params.subject);
  if (params.body) url.searchParams.set('body', params.body);
  return url.toString();
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function handleGmailResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Gmail API request failed (HTTP ${res.status})`;
    try {
      const json = (await res.json()) as { error?: { message?: string } };
      if (json?.error?.message) {
        message = json.error.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function decodeBase64Url(input: string): string {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const binary = atob(normalized + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function stripHtmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

function extractBodyText(payload?: RawGmailMessage['payload']): string {
  if (!payload) return '';

  const findPart = (
    parts: GmailMessagePart[] | undefined,
    mime: string
  ): string | null => {
    if (!parts) return null;
    for (const part of parts) {
      if (part.mimeType === mime && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        const nested = findPart(part.parts, mime);
        if (nested) return nested;
      }
    }
    return null;
  };

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  const plainFromParts = findPart(payload.parts, 'text/plain');
  if (plainFromParts) return plainFromParts;

  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return stripHtmlToPlainText(decodeBase64Url(payload.body.data));
  }

  const htmlFromParts = findPart(payload.parts, 'text/html');
  if (htmlFromParts) return stripHtmlToPlainText(htmlFromParts);

  return '';
}

function getHeader(headers: GmailMessageHeader[] | undefined, name: string): string {
  if (!headers) return '';
  const found = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return found?.value || '';
}

function normalizeMessage(raw: RawGmailMessage): GmailMessageSummary {
  const headers = raw.payload?.headers;
  const labelIds = raw.labelIds || [];
  const bodyText = extractBodyText(raw.payload) || raw.snippet || '';

  return {
    id: raw.id,
    threadId: raw.threadId,
    subject: getHeader(headers, 'Subject') || '(No Subject)',
    from: getHeader(headers, 'From') || 'Unknown Sender',
    to: getHeader(headers, 'To') || '',
    date: getHeader(headers, 'Date') || '',
    snippet: raw.snippet || '',
    bodyText,
    labelIds,
    isUnread: labelIds.includes('UNREAD'),
  };
}

export async function listGmailMessages(params: {
  accessToken: string;
  folder: GmailMailboxFolder;
  query?: string;
  maxResults?: number;
}): Promise<GmailMessageSummary[]> {
  const { accessToken, folder, query, maxResults = 15 } = params;

  const url = new URL(`${GMAIL_API_BASE}/messages`);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('labelIds', folder);
  if (query && query.trim().length > 0) {
    url.searchParams.set('q', query.trim());
  }

  const listRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const listData = await handleGmailResponse<{
    messages?: Array<{ id: string; threadId: string }>;
  }>(listRes);

  const ids = (listData.messages || []).map((m) => m.id);
  if (ids.length === 0) return [];

  const details = await Promise.all(
    ids.map(async (id) => {
      const msgRes = await fetch(
        `${GMAIL_API_BASE}/messages/${encodeURIComponent(id)}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const raw = await handleGmailResponse<RawGmailMessage>(msgRes);
      return normalizeMessage(raw);
    })
  );

  return details;
}

function buildRawMimeEmail(params: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}): string {
  const cleanTo = params.to.replace(/[\r\n]/g, '').trim();
  const cleanSubject = params.subject.replace(/[\r\n]/g, '').trim();
  const lines = [
    `To: ${cleanTo}`,
    ...(params.replyTo
      ? [`Reply-To: ${params.replyTo.replace(/[\r\n]/g, '').trim()}`]
      : []),
    `Subject: =?UTF-8?B?${btoa(
      unescape(encodeURIComponent(cleanSubject))
    )}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    params.body,
  ];
  return encodeBase64Url(lines.join('\r\n'));
}

export async function sendGmailMessage(params: {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<{ id: string }> {
  const raw = buildRawMimeEmail(params);
  const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });
  return handleGmailResponse<{ id: string }>(res);
}

export async function createGmailDraft(params: {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<{ id: string }> {
  const raw = buildRawMimeEmail(params);
  const res = await fetch(`${GMAIL_API_BASE}/drafts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: { raw } }),
  });
  return handleGmailResponse<{ id: string }>(res);
}

export async function trashGmailMessage(params: {
  accessToken: string;
  messageId: string;
}): Promise<void> {
  const res = await fetch(
    `${GMAIL_API_BASE}/messages/${encodeURIComponent(params.messageId)}/trash`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${params.accessToken}` },
    }
  );
  await handleGmailResponse<unknown>(res);
}

export async function setGmailMessageReadState(params: {
  accessToken: string;
  messageId: string;
  unread: boolean;
}): Promise<void> {
  const res = await fetch(
    `${GMAIL_API_BASE}/messages/${encodeURIComponent(params.messageId)}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        params.unread
          ? { addLabelIds: ['UNREAD'] }
          : { removeLabelIds: ['UNREAD'] }
      ),
    }
  );
  await handleGmailResponse<unknown>(res);
}
