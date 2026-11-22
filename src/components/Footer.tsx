import React from 'react';
import { buildGmailWebComposeUrl } from '../services/gmail';
import type { AcademicMember, GroupInfo } from '../types/academic';

interface FooterProps {
  group: GroupInfo;
  members: AcademicMember[];
  onNavigate: (hash: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ group, members, onNavigate }) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <footer className="mt-24 border-t border-[#E5E0D8] bg-[#F2EFE9]/60 transition-colors duration-200 dark:border-[#232D3F] dark:bg-[#0E131D]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-lg font-semibold text-[#18181B] dark:text-[#F1F5F9]">
              {group.name}
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#57534E] dark:text-[#94A3B8]">
              {group.department} · {group.institution}
            </p>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[#57534E] dark:text-[#94A3B8]">
              {group.location}
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-[#57534E] dark:text-[#94A3B8]">
              Sections
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { label: 'Home', href: '#/' },
                { label: 'Our Team', href: '#/team' },
                { label: 'Research Projects', href: '#/research' },
                { label: 'Publications Archive', href: '#/publications' },
                { label: 'Research Drive', href: '#/drive' },
                { label: 'Academic Mail', href: '#/mail' },
                { label: 'Contact Group', href: '#/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNav(e, link.href)}
                    className="text-[#18181B] transition-colors hover:text-[#1E3A8A] dark:text-[#E2E8F0] dark:hover:text-[#60A5FA]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-[#57534E] dark:text-[#94A3B8]">
              Researchers
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {members.map((m) => (
                <li key={m.id}>
                  <a
                    href={`#/profile/${m.id}`}
                    onClick={(e) => handleNav(e, `#/profile/${m.id}`)}
                    className="text-[#18181B] transition-colors hover:text-[#1E3A8A] dark:text-[#E2E8F0] dark:hover:text-[#60A5FA]"
                  >
                    {m.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#E5E0D8] pt-6 text-xs text-[#57534E] sm:flex-row sm:items-center sm:justify-between dark:border-[#232D3F] dark:text-[#94A3B8]">
          <p>
            © {new Date().getFullYear()} {group.name}. All academic materials maintained for scholarly exchange.
          </p>
          <a
            href={buildGmailWebComposeUrl({
              to: group.email,
              subject: `Academic Inquiry — ${group.name}`,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-[#1E3A8A] dark:hover:text-[#60A5FA]"
          >
            {group.email}
          </a>
        </div>
      </div>
    </footer>
  );
};
