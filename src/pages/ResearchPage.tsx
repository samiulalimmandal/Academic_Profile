import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import type { PortfolioData } from '../types/academic';

interface ResearchPageProps {
  data: PortfolioData;
  onNavigate: (hash: string) => void;
}

export const ResearchPage: React.FC<ResearchPageProps> = ({ data, onNavigate }) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [memberFilter, setMemberFilter] = useState<string>('all');

  const allProjects = useMemo(() => {
    return data.members.flatMap((m) =>
      m.researchProjects.map((p) => ({
        ...p,
        memberName: m.name,
        memberId: m.id,
        department: m.department,
      }))
    );
  }, [data.members]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (memberFilter !== 'all' && p.memberId !== memberFilter) return false;
      return true;
    });
  }, [allProjects, statusFilter, memberFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#E5E0D8] pb-8 dark:border-[#232D3F]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
              {data.group.name}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl dark:text-[#F1F5F9]">
              Research Projects &amp; Investigations
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base dark:text-[#94A3B8]">
              Active and completed research initiatives led by members of our collective across spatial geoinformatics, computational ecology, sensor telemetry, and cryosphere hydrology.
            </p>
          </div>
          <a
            href="#/drive"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/drive');
            }}
            className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-lg border border-[#E5E0D8] bg-white px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
          >
            <span>Open Research Drive</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="inline-flex items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 self-start dark:bg-[#192130]"
            role="group"
            aria-label="Filter projects by status"
          >
            {(['All', 'Ongoing', 'Completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === status
                    ? 'bg-white text-[#18181B] shadow-xs dark:bg-[#0B0F17] dark:text-[#F1F5F9]'
                    : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="research-member-select"
              className="text-xs font-medium text-[#57534E] dark:text-[#94A3B8]"
            >
              Investigator:
            </label>
            <select
              id="research-member-select"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#E5E0D8] bg-white px-3 text-xs font-medium text-[#18181B] focus:border-[#1E3A8A] focus:outline-none dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:focus:border-[#60A5FA]"
            >
              <option value="all">All Researchers</option>
              {data.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E5E0D8] bg-white p-10 text-center dark:border-[#232D3F] dark:bg-[#121824]">
          <p className="font-serif text-lg font-medium text-[#18181B] dark:text-[#F1F5F9]">
            No projects match the selected filters.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <article
              key={`${project.memberId}-${project.id}`}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E5E0D8] bg-white dark:border-[#232D3F] dark:bg-[#121824]"
            >
              {project.image && (
                <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#E5E0D8] dark:border-[#232D3F]">
                  <SafeImage
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="text-xs text-[#57534E] dark:text-[#94A3B8]">
                    <span className="font-semibold text-[#1E3A8A] dark:text-[#60A5FA]">
                      {project.status}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">{project.timeframe}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{project.role}</span>
                  </p>
                  <h2 className="mt-2 font-serif text-xl font-semibold text-[#18181B] dark:text-[#F1F5F9]">
                    {project.title}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E0D8]/80 pt-4 text-xs dark:border-[#232D3F]/80">
                  <a
                    href={`#/profile/${project.memberId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`#/profile/${project.memberId}`);
                    }}
                    className="font-medium text-[#18181B] hover:text-[#1E3A8A] hover:underline dark:text-[#E2E8F0] dark:hover:text-[#60A5FA]"
                  >
                    {project.memberName}
                  </a>

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-[#1E3A8A] hover:underline dark:text-[#60A5FA]"
                    >
                      <span>Project Link</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
