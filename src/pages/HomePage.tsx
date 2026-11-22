import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { MemberCard } from '../components/MemberCard';
import { SafeImage } from '../components/SafeImage';
import type { PortfolioData, Publication, ResearchProject } from '../types/academic';

interface HomePageProps {
  data: PortfolioData;
  onNavigate: (hash: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ data, onNavigate }) => {
  const { group, members } = data;

  const allProjects: Array<ResearchProject & { memberName: string; memberId: string }> =
    members.flatMap((m) =>
      m.researchProjects.map((p) => ({
        ...p,
        memberName: m.name,
        memberId: m.id,
      }))
    );

  const uniquePublicationsMap = new Map<
    string,
    Publication & { memberNames: string[] }
  >();
  for (const m of members) {
    for (const pub of m.publications) {
      const key = pub.doi || pub.title.toLowerCase();
      const existing = uniquePublicationsMap.get(key);
      if (existing) {
        existing.memberNames.push(m.name);
      } else {
        uniquePublicationsMap.set(key, { ...pub, memberNames: [m.name] });
      }
    }
  }
  const recentPublications = Array.from(uniquePublicationsMap.values())
    .sort((a, b) => b.year - a.year)
    .slice(0, 4);

  const ongoingCount = allProjects.filter((p) => p.status === 'Ongoing').length;
  const featuredProjects = allProjects.slice(0, 3);

  return (
    <div className="space-y-20">
      {/* Split Editorial Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
                {group.kicker}
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[#18181B] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.12] dark:text-[#F1F5F9]">
                {group.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#44403C] sm:text-lg dark:text-[#CBD5E1]">
                {group.description}
              </p>
              <p className="mt-4 text-sm text-[#57534E] dark:text-[#94A3B8]">
                {group.department} · {group.institution}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#/team"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('#/team');
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
              >
                <span>Meet Our Researchers</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#/research"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('#/research');
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-5 py-2.5 text-sm font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
              >
                <span>Explore Research</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-64 overflow-hidden rounded-xl border border-[#E5E0D8] sm:h-80 lg:h-full dark:border-[#232D3F]">
              <SafeImage
                src={group.heroImage}
                alt={`${group.name} laboratory and research studio`}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width Quantitative Summary Strip */}
        <div className="mt-10 grid grid-cols-2 divide-y divide-[#E5E0D8] rounded-xl border border-[#E5E0D8] bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0 dark:divide-[#232D3F] dark:border-[#232D3F] dark:bg-[#121824]">
          <div className="px-6 py-5">
            <p className="font-mono text-2xl font-semibold tabular-nums text-[#18181B] dark:text-[#F1F5F9]">
              {members.length}
            </p>
            <p className="mt-1 text-xs text-[#57534E] dark:text-[#94A3B8]">
              Core Researchers
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="font-mono text-2xl font-semibold tabular-nums text-[#18181B] dark:text-[#F1F5F9]">
              {uniquePublicationsMap.size}
            </p>
            <p className="mt-1 text-xs text-[#57534E] dark:text-[#94A3B8]">
              Indexed Publications
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="font-mono text-2xl font-semibold tabular-nums text-[#18181B] dark:text-[#F1F5F9]">
              {ongoingCount} / {allProjects.length}
            </p>
            <p className="mt-1 text-xs text-[#57534E] dark:text-[#94A3B8]">
              Active Research Grants
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="font-mono text-2xl font-semibold tabular-nums text-[#18181B] dark:text-[#F1F5F9]">
              Est. {group.establishedYear}
            </p>
            <p className="mt-1 text-xs text-[#57534E] dark:text-[#94A3B8]">
              {group.institution}
            </p>
          </div>
        </div>
      </section>

      {/* Four Individual Profile Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="team-heading">
        <div className="flex flex-col gap-3 border-b border-[#E5E0D8] pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-[#232D3F]">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
              Research Group Directory
            </p>
            <h2
              id="team-heading"
              className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
            >
              Our Academic Team
            </h2>
          </div>
          <a
            href="#/team"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/team');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 dark:text-[#60A5FA]"
          >
            <span>View Full Directory</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onViewProfile={(id) => onNavigate(`#/profile/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Featured Research Projects */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="featured-research-heading">
        <div className="flex flex-col gap-3 border-b border-[#E5E0D8] pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-[#232D3F]">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
              Selected Investigations
            </p>
            <h2
              id="featured-research-heading"
              className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
            >
              Active Research Programs
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="#/drive"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('#/drive');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#57534E] hover:text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 dark:text-[#94A3B8] dark:hover:text-[#60A5FA]"
            >
              <span>Research Drive</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#/research"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('#/research');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 dark:text-[#60A5FA]"
            >
              <span>All Research Projects</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredProjects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E5E0D8] bg-white dark:border-[#232D3F] dark:bg-[#121824]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden border-b border-[#E5E0D8] dark:border-[#232D3F]">
                <SafeImage
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs text-[#57534E] dark:text-[#94A3B8]">
                    <span className="font-medium text-[#1E3A8A] dark:text-[#60A5FA]">
                      {project.status}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">{project.timeframe}</span>
                  </p>
                  <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-[#18181B] dark:text-[#F1F5F9]">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
                    {project.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5E0D8]/80 pt-3.5 text-xs dark:border-[#232D3F]/80">
                  <a
                    href={`#/profile/${project.memberId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`#/profile/${project.memberId}`);
                    }}
                    className="truncate font-medium text-[#57534E] hover:text-[#1E3A8A] dark:text-[#94A3B8] dark:hover:text-[#60A5FA]"
                  >
                    Lead: {project.memberName}
                  </a>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 dark:text-[#60A5FA]"
                    >
                      <span>Project</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Recent Publications Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="recent-pubs-heading">
        <div className="flex flex-col gap-3 border-b border-[#E5E0D8] pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-[#232D3F]">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
              Scholarly Output
            </p>
            <h2
              id="recent-pubs-heading"
              className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
            >
              Recent Publications
            </h2>
          </div>
          <a
            href="#/publications"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/publications');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 dark:text-[#60A5FA]"
          >
            <span>Complete Bibliography</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-6 divide-y divide-[#E5E0D8] rounded-xl border border-[#E5E0D8] bg-white dark:divide-[#232D3F] dark:border-[#232D3F] dark:bg-[#121824]">
          {recentPublications.map((pub) => (
            <div
              key={pub.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#57534E] dark:text-[#94A3B8]">
                  <span className="font-mono tabular-nums font-medium text-[#1E3A8A] dark:text-[#60A5FA]">
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
                <h3 className="mt-1.5 font-serif text-base font-semibold leading-snug text-[#18181B] dark:text-[#F1F5F9]">
                  {pub.title}
                </h3>
                <p className="mt-1 text-sm text-[#44403C] dark:text-[#CBD5E1]">
                  {pub.authors} — <span className="italic">{pub.venue}</span>
                </p>
              </div>
              {pub.url && (
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[36px] items-center gap-1.5 self-start rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                >
                  <span>Read Paper</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
