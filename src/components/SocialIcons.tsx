import React from 'react';
import { Globe } from 'lucide-react';
import type { SocialLinks } from '../types/academic';

interface SocialPlatformMeta {
  key: keyof SocialLinks;
  label: string;
  shortLabel: string;
  accentClass: string;
  renderIcon: (className: string) => React.ReactNode;
}

export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  {
    key: 'googleScholar',
    label: 'Google Scholar',
    shortLabel: 'Scholar',
    accentClass:
      'hover:text-[#1E3A8A] hover:border-[#1E3A8A]/40 hover:bg-[#1E3A8A]/5 dark:hover:text-[#93C5FD] dark:hover:border-[#60A5FA]/40 dark:hover:bg-[#60A5FA]/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
      </svg>
    ),
  },
  {
    key: 'researchGate',
    label: 'ResearchGate',
    shortLabel: 'ResearchGate',
    accentClass:
      'hover:text-[#008272] hover:border-[#008272]/40 hover:bg-[#008272]/5 dark:hover:text-[#4FD1C5] dark:hover:border-[#4FD1C5]/40 dark:hover:bg-[#4FD1C5]/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68-.242.744-.365 1.61-.365 2.596 0 1.41.32 2.49.96 3.24.64.75 1.56 1.125 2.76 1.125.92 0 1.66-.226 2.22-.677.56-.45.936-1.08 1.125-1.89h-1.8c-.14.37-.34.65-.6.84-.26.19-.59.285-.99.285-.66 0-1.15-.23-1.47-.69-.32-.46-.48-1.15-.48-2.07 0-.96.165-1.69.495-2.19.33-.5.835-.75 1.515-.75.47 0 .855.12 1.155.36.3.24.5.58.6 1.02h1.8c-.14-.98-.52-1.74-1.14-2.28C21.39.27 20.57 0 19.586 0zM4 4.5v15h2.4v-6.1h3.22c.79 0 1.38.2 1.77.6.39.4.585 1.02.585 1.86v3.64h2.4v-3.93c0-.99-.2-1.76-.6-2.31-.4-.55-1.01-.91-1.83-1.08v-.06c.73-.21 1.29-.58 1.68-1.11.39-.53.585-1.2.585-2.01 0-1.41-.445-2.48-1.335-3.21C11.985 4.86 10.71 4.5 9.05 4.5H4zm2.4 2h2.45c.93 0 1.62.19 2.07.57.45.38.675.95.675 1.71 0 .78-.235 1.37-.705 1.77-.47.4-1.15.6-2.04.6H6.4V6.5z" />
      </svg>
    ),
  },
  {
    key: 'orcid',
    label: 'ORCID',
    shortLabel: 'ORCID',
    accentClass:
      'hover:text-[#5B8A00] hover:border-[#5B8A00]/40 hover:bg-[#5B8A00]/5 dark:hover:text-[#A6CE39] dark:hover:border-[#A6CE39]/40 dark:hover:bg-[#A6CE39]/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    shortLabel: 'LinkedIn',
    accentClass:
      'hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5 dark:hover:text-[#60A5FA] dark:hover:border-[#60A5FA]/40 dark:hover:bg-[#60A5FA]/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  {
    key: 'github',
    label: 'GitHub',
    shortLabel: 'GitHub',
    accentClass:
      'hover:text-[#18181B] hover:border-[#18181B]/40 hover:bg-[#18181B]/5 dark:hover:text-white dark:hover:border-white/40 dark:hover:bg-white/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    shortLabel: 'Facebook',
    accentClass:
      'hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 dark:hover:text-[#60A5FA] dark:hover:border-[#60A5FA]/40 dark:hover:bg-[#60A5FA]/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    shortLabel: 'Instagram',
    accentClass:
      'hover:text-[#C13584] hover:border-[#C13584]/40 hover:bg-[#C13584]/5 dark:hover:text-[#F472B6] dark:hover:border-[#F472B6]/40 dark:hover:bg-[#F472B6]/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    shortLabel: 'X',
    accentClass:
      'hover:text-[#18181B] hover:border-[#18181B]/40 hover:bg-[#18181B]/5 dark:hover:text-white dark:hover:border-white/40 dark:hover:bg-white/10',
    renderIcon: (cls) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'website',
    label: 'Personal Website',
    shortLabel: 'Website',
    accentClass:
      'hover:text-[#1E3A8A] hover:border-[#1E3A8A]/40 hover:bg-[#1E3A8A]/5 dark:hover:text-[#93C5FD] dark:hover:border-[#60A5FA]/40 dark:hover:bg-[#60A5FA]/10',
    renderIcon: (cls) => <Globe className={cls} aria-hidden="true" />,
  },
];

interface SocialIconsProps {
  socials: SocialLinks;
  memberName: string;
  variant?: 'compact' | 'detailed';
}

export const SocialIcons: React.FC<SocialIconsProps> = ({
  socials,
  memberName,
  variant = 'compact',
}) => {
  const activePlatforms = SOCIAL_PLATFORMS.filter((p) => {
    const val = socials[p.key];
    return typeof val === 'string' && val.trim().length > 0;
  });

  if (activePlatforms.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-1.5" aria-label={`${memberName} academic and social profiles`}>
        {activePlatforms.map((platform) => {
          const url = socials[platform.key]!;
          return (
            <a
              key={platform.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${memberName} on ${platform.label}`}
              aria-label={`${memberName} on ${platform.label}`}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E0D8] bg-[#FAF8F5] text-[#57534E] transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#94A3B8] dark:focus-visible:outline-[#60A5FA] ${platform.accentClass}`}
            >
              {platform.renderIcon('h-3.5 w-3.5')}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {activePlatforms.map((platform) => {
        const url = socials[platform.key]!;
        return (
          <a
            key={platform.key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-3 rounded-lg border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-sm font-medium text-[#18181B] transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:focus-visible:outline-[#60A5FA] ${platform.accentClass}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F2EFE9] text-[#57534E] transition-colors group-hover:bg-transparent dark:bg-[#192130] dark:text-[#94A3B8]">
              {platform.renderIcon('h-4 w-4')}
            </span>
            <span className="truncate">{platform.label}</span>
          </a>
        );
      })}
    </div>
  );
};
