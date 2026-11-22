import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { MemberCard } from '../components/MemberCard';
import type { PortfolioData } from '../types/academic';

interface TeamPageProps {
  data: PortfolioData;
  onNavigate: (hash: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ data, onNavigate }) => {
  const [query, setQuery] = useState('');

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.members;
    return data.members.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.institution.toLowerCase().includes(q) ||
        m.researchInterests.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [data.members, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-[#E5E0D8] pb-8 md:flex-row md:items-end md:justify-between dark:border-[#232D3F]">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
            {data.group.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl dark:text-[#F1F5F9]">
            Our Team
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base dark:text-[#94A3B8]">
            Explore individual academic profiles, qualifications, research portfolios, and downloadable CVs for all members of our research collective.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#57534E] dark:text-[#94A3B8]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, field, or interest..."
            aria-label="Filter team members"
            className="h-11 w-full rounded-lg border border-[#E5E0D8] bg-white pr-4 pl-10 text-sm text-[#18181B] placeholder:text-[#78716C] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:focus:border-[#60A5FA]"
          />
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E5E0D8] bg-white p-10 text-center dark:border-[#232D3F] dark:bg-[#121824]">
          <p className="font-serif text-lg font-medium text-[#18181B] dark:text-[#F1F5F9]">
            No researchers matched “{query}”.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-4 inline-flex items-center rounded-lg border border-[#E5E0D8] px-4 py-2 text-xs font-medium text-[#18181B] hover:bg-[#F2EFE9] dark:border-[#232D3F] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onViewProfile={(id) => onNavigate(`#/profile/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
