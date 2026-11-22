/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CvModal } from './components/CvModal';
import { Footer } from './components/Footer';
import { Navbar, type RoutePath } from './components/Navbar';
import { DriveAuthProvider } from './context/DriveAuthContext';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useTheme } from './hooks/useTheme';
import { ContactPage } from './pages/ContactPage';
import { DrivePage } from './pages/DrivePage';
import { HomePage } from './pages/HomePage';
import { MailPage } from './pages/MailPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicationsPage } from './pages/PublicationsPage';
import { ResearchPage } from './pages/ResearchPage';
import { TeamPage } from './pages/TeamPage';
import type { AcademicMember } from './types/academic';

interface ParsedRoute {
  page: RoutePath;
  profileId?: string;
  mailTo?: string;
  mailSubject?: string;
}

function parseHash(hash: string): ParsedRoute {
  const clean = hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = clean.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart);

  if (parts.length === 0) return { page: 'home' };
  if (parts[0] === 'team') return { page: 'team' };
  if (parts[0] === 'research') return { page: 'research' };
  if (parts[0] === 'publications') return { page: 'publications' };
  if (parts[0] === 'drive') return { page: 'drive' };
  if (parts[0] === 'mail') {
    return {
      page: 'mail',
      mailTo: params.get('to') || undefined,
      mailSubject: params.get('subject') || undefined,
    };
  }
  if (parts[0] === 'contact') return { page: 'contact' };
  if (parts[0] === 'profile' && parts[1]) {
    return { page: 'profile', profileId: decodeURIComponent(parts[1]) };
  }
  return { page: 'home' };
}

export default function App() {
  const { data, loading, error, reload } = usePortfolioData();
  const { theme, toggleTheme } = useTheme();
  const [route, setRoute] = useState<ParsedRoute>(() =>
    parseHash(typeof window !== 'undefined' ? window.location.hash : '#/')
  );
  const [cvMember, setCvMember] = useState<AcademicMember | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (hash: string) => {
    const normalized = hash.startsWith('#') ? hash : `#${hash}`;
    if (window.location.hash === normalized) {
      setRoute(parseHash(normalized));
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.location.hash = normalized;
    }
  };

  useEffect(() => {
    if (!data) return;
    if (route.page === 'profile' && route.profileId) {
      const m = data.members.find((member) => member.id === route.profileId);
      if (m) {
        document.title = `${m.name} | ${data.group.name}`;
        return;
      }
    }
    const pageTitleMap: Record<RoutePath, string> = {
      home: `${data.group.name} | Academic Portfolio & Research Group`,
      team: `Our Team | ${data.group.name}`,
      research: `Research Projects | ${data.group.name}`,
      publications: `Publications | ${data.group.name}`,
      drive: `Research Drive | ${data.group.name}`,
      mail: `Academic Mail | ${data.group.name}`,
      contact: `Contact | ${data.group.name}`,
      profile: `Academic Profile | ${data.group.name}`,
    };
    document.title = pageTitleMap[route.page];
  }, [data, route]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 dark:bg-[#0B0F17]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#1E3A8A] border-t-transparent dark:border-[#60A5FA] dark:border-t-transparent" />
          <p className="mt-4 text-sm text-[#57534E] dark:text-[#94A3B8]">
            Loading academic portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 dark:bg-[#0B0F17]">
        <div className="max-w-md rounded-xl border border-[#E5E0D8] bg-white p-8 text-center dark:border-[#232D3F] dark:bg-[#121824]">
          <h1 className="font-serif text-xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
            Unable to Load Profile Data
          </h1>
          <p className="mt-2 text-sm text-[#57534E] dark:text-[#94A3B8]">
            {error || 'Please check that public/data/profiles.json is valid JSON.'}
          </p>
          <button
            type="button"
            onClick={reload}
            className="mt-5 inline-flex items-center rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-medium text-white hover:bg-[#172554] dark:bg-[#3B82F6]"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const activeMember =
    route.page === 'profile' && route.profileId
      ? data.members.find((m) => m.id === route.profileId)
      : undefined;

  return (
    <DriveAuthProvider>
      <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#18181B] transition-colors duration-200 dark:bg-[#0B0F17] dark:text-[#F1F5F9]">
        <Navbar
          brandName={data.group.shortName}
          activeRoute={route.page}
          onNavigate={navigate}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1">
          {route.page === 'home' && <HomePage data={data} onNavigate={navigate} />}
          {route.page === 'team' && <TeamPage data={data} onNavigate={navigate} />}
          {route.page === 'research' && <ResearchPage data={data} onNavigate={navigate} />}
          {route.page === 'publications' && (
            <PublicationsPage data={data} onNavigate={navigate} />
          )}
          {route.page === 'drive' && <DrivePage data={data} />}
          {route.page === 'mail' && (
            <MailPage
              data={data}
              initialTo={route.mailTo}
              initialSubject={route.mailSubject}
            />
          )}
          {route.page === 'contact' && <ContactPage data={data} onNavigate={navigate} />}
          {route.page === 'profile' &&
            (activeMember ? (
              <ProfilePage
                member={activeMember}
                allMembers={data.members}
                onNavigate={navigate}
                onOpenCv={(m) => setCvMember(m)}
              />
            ) : (
              <div className="mx-auto max-w-3xl px-4 py-20 text-center">
                <h1 className="font-serif text-3xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
                  Researcher Profile Not Found
                </h1>
                <p className="mt-3 text-sm text-[#57534E] dark:text-[#94A3B8]">
                  The requested academic profile identifier does not exist in profiles.json.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('#/team')}
                  className="mt-6 inline-flex items-center rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#172554] dark:bg-[#3B82F6]"
                >
                  Return to Team Directory
                </button>
              </div>
            ))}
        </main>

        <Footer group={data.group} members={data.members} onNavigate={navigate} />

        <CvModal member={cvMember} onClose={() => setCvMember(null)} />
      </div>
    </DriveAuthProvider>
  );
}
