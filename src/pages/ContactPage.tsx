import React, { useRef, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { buildGmailWebComposeUrl } from '../services/gmail';
import type { PortfolioData } from '../types/academic';

interface ContactPageProps {
  data: PortfolioData;
  onNavigate: (hash: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ data, onNavigate }) => {
  const { group, members } = data;
  const gmailAnchorRef = useRef<HTMLAnchorElement | null>(null);

  const [recipientId, setRecipientId] = useState<string>('group');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copiedInquiry, setCopiedInquiry] = useState(false);

  const selectedEmail =
    recipientId === 'group'
      ? group.email
      : members.find((m) => m.id === recipientId)?.contact.email || group.email;

  const selectedName =
    recipientId === 'group'
      ? group.name
      : members.find((m) => m.id === recipientId)?.name || group.name;

  const buildEmailBody = () => {
    return [
      senderName.trim() ? `From: ${senderName.trim()}` : null,
      senderEmail.trim() ? `Reply Email: ${senderEmail.trim()}` : null,
      senderName.trim() || senderEmail.trim() ? '' : null,
      message.trim(),
    ]
      .filter((l) => l !== null)
      .join('\n');
  };

  const gmailWebHref = buildGmailWebComposeUrl({
    to: selectedEmail,
    subject: subject.trim() || `Academic Inquiry for ${selectedName}`,
    body: buildEmailBody(),
  });

  const handleCopyMessage = () => {
    const summary = `To: ${selectedName} <${selectedEmail}>\nSubject: ${
      subject || 'Academic Inquiry'
    }\nFrom: ${senderName || 'Visitor'} (${senderEmail || 'No email provided'})\n\n${message}`;
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopiedInquiry(true);
    setTimeout(() => setCopiedInquiry(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    gmailAnchorRef.current?.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#E5E0D8] pb-8 dark:border-[#232D3F]">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
          {group.name}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl dark:text-[#F1F5F9]">
          Contact &amp; Collaborations
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base dark:text-[#94A3B8]">
          Reach out for research collaborations, dataset inquiries, graduate supervision, or speaking invitations.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Group & Individual Directory */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-[#E5E0D8] bg-white p-6 dark:border-[#232D3F] dark:bg-[#121824]">
            <h2 className="font-serif text-xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
              Institutional Office
            </h2>
            <p className="mt-1 text-xs text-[#57534E] dark:text-[#94A3B8]">
              {group.department} · {group.institution}
            </p>
            <div className="mt-4 space-y-2.5 text-sm text-[#44403C] dark:text-[#CBD5E1]">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                <span>{group.location}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                <a
                  href={buildGmailWebComposeUrl({
                    to: group.email,
                    subject: `Academic Inquiry — ${group.name}`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:underline"
                >
                  {group.email}
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E0D8] bg-white p-6 dark:border-[#232D3F] dark:bg-[#121824]">
            <h2 className="font-serif text-xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
              Individual Contacts
            </h2>
            <div className="mt-4 divide-y divide-[#E5E0D8]/80 dark:divide-[#232D3F]/80">
              {members.map((m) => (
                <div key={m.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={`#/profile/${m.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`#/profile/${m.id}`);
                      }}
                      className="font-serif text-base font-semibold text-[#18181B] hover:text-[#1E3A8A] dark:text-[#F1F5F9] dark:hover:text-[#60A5FA]"
                    >
                      {m.name}
                    </a>
                    <a
                      href={buildGmailWebComposeUrl({
                        to: m.contact.email,
                        subject: `Academic Inquiry — ${m.name}`,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E0D8] px-2.5 py-1 text-xs font-medium text-[#18181B] hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                    >
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      <span>Gmail</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-70" aria-hidden="true" />
                    </a>
                  </div>
                  <p className="mt-0.5 text-xs text-[#57534E] dark:text-[#94A3B8]">
                    {m.designation}
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-[#44403C] dark:text-[#CBD5E1]">
                    {m.contact.email}
                  </p>
                  {m.contact.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-[#57534E] dark:text-[#94A3B8]">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      <span>{m.contact.phone}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Direct Gmail Inquiry Composer (No sign-in required) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleFormSubmit}
            className="rounded-xl border border-[#E5E0D8] bg-white p-6 sm:p-8 dark:border-[#232D3F] dark:bg-[#121824]"
          >
            <h2 className="font-serif text-2xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
              Compose Academic Inquiry
            </h2>
            <p className="mt-1.5 text-sm text-[#57534E] dark:text-[#94A3B8]">
              Fill out your message below and open it directly in your Gmail app or Gmail web—no sign-in required on this site.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="contact-recipient"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                >
                  Recipient
                </label>
                <select
                  id="contact-recipient"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-sm text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:focus:border-[#60A5FA]"
                >
                  <option value="group">
                    {group.name} ({group.email})
                  </option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.contact.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Dr. Jordan Patel"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-sm text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                  >
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="jordan.patel@university.edu"
                    className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-sm text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Research Collaboration / Dataset Access Inquiry"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-sm text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#94A3B8]"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your academic message, collaboration proposal, or question..."
                  className="mt-1.5 w-full rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] p-3 text-sm text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  ref={gmailAnchorRef}
                  href={gmailWebHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Open &amp; Send in Gmail</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-2.5 text-sm font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                >
                  {copiedInquiry ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
