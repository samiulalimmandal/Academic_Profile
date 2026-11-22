import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Search } from 'lucide-react';
import type { PortfolioData, Publication, PublicationType } from '../types/academic';

interface PublicationsPageProps {
  data: PortfolioData;
  onNavigate: (hash: string) => void;
}

interface AggregatedPublication extends Publication {
  memberRefs: Array<{ id: string; name: string }>;
}

export const PublicationsPage: React.FC<PublicationsPageProps> = ({ data, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | PublicationType>('All');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const publications = useMemo(() => {
    const map = new Map<string, AggregatedPublication>();
    for (const m of data.members) {
      for (const pub of m.publications) {
        const key = pub.doi || pub.title.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          if (!existing.memberRefs.some((r) => r.id === m.id)) {
            existing.memberRefs.push({ id: m.id, name: m.name });
          }
        } else {
          map.set(key, {
            ...pub,
            memberRefs: [{ id: m.id, name: m.name }],
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.year - a.year);
  }, [data.members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter((pub) => {
      if (typeFilter !== 'All' && pub.type !== typeFilter) return false;
      if (memberFilter !== 'all' && !pub.memberRefs.some((r) => r.id === memberFilter)) {
        return false;
      }
      if (!q) return true;
      return (
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.venue.toLowerCase().includes(q) ||
        String(pub.year).includes(q) ||
        (pub.doi && pub.doi.toLowerCase().includes(q))
      );
    });
  }, [publications, query, typeFilter, memberFilter]);

  const pubTypes: Array<'All' | PublicationType> = [
    'All',
    'Journal Article',
    'Conference Paper',
    'Book Chapter',
    'Research Paper',
  ];

  const handleCopy = (key: string, pub: AggregatedPublication) => {
    const citation = `${pub.authors} (${pub.year}). ${pub.title}. ${pub.venue}.${
      pub.doi ? ` https://doi.org/${pub.doi}` : ''
    }`;
    navigator.clipboard?.writeText(citation).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#E5E0D8] pb-8 dark:border-[#232D3F]">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
          {data.group.name}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl dark:text-[#F1F5F9]">
          Publications Archive
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base dark:text-[#94A3B8]">
          Journal articles, peer-reviewed conference proceedings, and book chapters authored by members of our research collective.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 self-start dark:bg-[#192130]"
            role="group"
            aria-label="Filter publications by type"
          >
            {pubTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  typeFilter === type
                    ? 'bg-white text-[#18181B] shadow-xs dark:bg-[#0B0F17] dark:text-[#F1F5F9]'
                    : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                }`}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              aria-label="Filter publications by author"
              className="h-10 rounded-lg border border-[#E5E0D8] bg-white px-3 text-xs font-medium text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:focus:border-[#60A5FA]"
            >
              <option value="all">All Authors</option>
              {data.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#57534E] dark:text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, venue, DOI, year..."
                aria-label="Search publications"
                className="h-10 w-full rounded-lg border border-[#E5E0D8] bg-white pr-3 pl-9 text-xs text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
              />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs font-mono tabular-nums text-[#57534E] dark:text-[#94A3B8]">
        Showing {filtered.length} of {publications.length} indexed publications
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-white p-10 text-center dark:border-[#232D3F] dark:bg-[#121824]">
          <p className="font-serif text-lg font-medium text-[#18181B] dark:text-[#F1F5F9]">
            No publications matched your search criteria.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[#E5E0D8] rounded-xl border border-[#E5E0D8] bg-white dark:divide-[#232D3F] dark:border-[#232D3F] dark:bg-[#121824]">
          {filtered.map((pub) => {
            const copyId = pub.doi || pub.id;
            return (
              <article key={copyId} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#57534E] dark:text-[#94A3B8]">
                      <span className="font-mono font-semibold tabular-nums text-[#1E3A8A] dark:text-[#60A5FA]">
                        {pub.year}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{pub.type}</span>
                      {pub.doi && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono">DOI: {pub.doi}</span>
                        </>
                      )}
                    </p>

                    <h2 className="mt-1.5 font-serif text-lg font-semibold leading-snug text-[#18181B] dark:text-[#F1F5F9]">
                      {pub.title}
                    </h2>

                    <p className="mt-1 text-sm text-[#44403C] dark:text-[#CBD5E1]">
                      {pub.authors} — <span className="italic">{pub.venue}</span>
                    </p>

                    <p className="mt-2.5 text-xs text-[#57534E] dark:text-[#94A3B8]">
                      Group Contributors:{' '}
                      {pub.memberRefs.map((ref, idx) => (
                        <React.Fragment key={ref.id}>
                          {idx > 0 && ', '}
                          <a
                            href={`#/profile/${ref.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(`#/profile/${ref.id}`);
                            }}
                            className="font-medium text-[#1E3A8A] hover:underline dark:text-[#60A5FA]"
                          >
                            {ref.name}
                          </a>
                        </React.Fragment>
                      ))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(copyId, pub)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                    >
                      {copiedKey === copyId ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>

                    {pub.url && (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
                      >
                        <span>Open Paper</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
