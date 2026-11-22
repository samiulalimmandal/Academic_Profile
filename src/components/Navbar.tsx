import React, { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';

export type RoutePath = 'home' | 'team' | 'research' | 'publications' | 'contact' | 'profile';

interface NavbarProps {
  brandName: string;
  activeRoute: RoutePath;
  onNavigate: (hash: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const NAV_ITEMS: { id: RoutePath; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '#/' },
  { id: 'team', label: 'Our Team', href: '#/team' },
  { id: 'research', label: 'Research', href: '#/research' },
  { id: 'publications', label: 'Publications', href: '#/publications' },
  { id: 'contact', label: 'Contact', href: '#/contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  brandName,
  activeRoute,
  onNavigate,
  theme,
  onToggleTheme,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E0D8] bg-[#FAF8F5]/95 backdrop-blur-md transition-colors duration-200 dark:border-[#232D3F] dark:bg-[#0B0F17]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#/"
          onClick={(e) => handleLinkClick(e, '#/')}
          className="inline-flex items-center gap-2.5 font-serif text-lg font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A8A] dark:text-[#F1F5F9] dark:focus-visible:outline-[#60A5FA]"
        >
          <svg
            viewBox="0 0 28 28"
            className="h-6 w-6 shrink-0 text-[#1E3A8A] dark:text-[#60A5FA]"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="11.5" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="14" cy="14" rx="5.5" ry="11.5" stroke="currentColor" strokeWidth="1.25" />
            <line x1="2.5" y1="14" x2="25.5" y2="14" stroke="currentColor" strokeWidth="1.25" />
          </svg>
          <span>{brandName}</span>
        </a>

        {/* Zone 2: Primary Text Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeRoute === item.id || (activeRoute === 'profile' && item.id === 'team');
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A8A] dark:focus-visible:outline-[#60A5FA] ${
                  isActive
                    ? 'text-[#1E3A8A] dark:text-[#60A5FA]'
                    : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#1E3A8A] dark:bg-[#60A5FA]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Utility Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-3.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130] dark:focus-visible:outline-[#60A5FA]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[#1E3A8A]" aria-hidden="true" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E0D8] bg-white text-[#18181B] md:hidden dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9]"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#E5E0D8] bg-[#FAF8F5] px-4 py-3 md:hidden dark:border-[#232D3F] dark:bg-[#0B0F17]">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                activeRoute === item.id || (activeRoute === 'profile' && item.id === 'team');
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#60A5FA]/15 dark:text-[#93C5FD]'
                      : 'text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:bg-[#121824] dark:hover:text-[#F1F5F9]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
