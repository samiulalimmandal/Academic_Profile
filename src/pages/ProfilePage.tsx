import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Mail,
  MapPin,
  Phone,
  Clock,
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { SocialIcons } from '../components/SocialIcons';
import type { AcademicMember, PublicationType } from '../types/academic';

interface ProfilePageProps {
  member: AcademicMember;
  allMembers: AcademicMember[];
  onNavigate: (hash: string) => void;
  onOpenCv: (member: AcademicMember) => void;
}

type ExperienceTab =
  | 'all'
  | 'teaching'
  | 'research'
  | 'internships'
  | 'workshops'
  | 'certifications';

export const ProfilePage: React.FC<ProfilePageProps> = ({
  member,
  allMembers,
  onNavigate,
  onOpenCv,
}) => {
  const [projectFilter, setProjectFilter] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [pubFilter, setPubFilter] = useState<'All' | PublicationType>('All');
  const [expTab, setExpTab] = useState<ExperienceTab>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'All') return member.researchProjects;
    return member.researchProjects.filter((p) => p.status === projectFilter);
  }, [member.researchProjects, projectFilter]);

  const filteredPublications = useMemo(() => {
    const sorted = [...member.publications].sort((a, b) => b.year - a.year);
    if (pubFilter === 'All') return sorted;
    return sorted.filter((p) => p.type === pubFilter);
  }, [member.publications, pubFilter]);

  const publicationTypes: Array<'All' | PublicationType> = [
    'All',
    'Journal Article',
    'Conference Paper',
    'Book Chapter',
    'Research Paper',
  ];

  const experienceSections = [
    { key: 'teaching' as const, label: 'Teaching Experience', items: member.experience.teaching },
    { key: 'research' as const, label: 'Research Experience', items: member.experience.research },
    { key: 'internships' as const, label: 'Internships', items: member.experience.internships },
    { key: 'workshops' as const, label: 'Workshops', items: member.experience.workshops },
    {
      key: 'certifications' as const,
      label: 'Training & Certifications',
      items: member.experience.certifications,
    },
  ].filter((sec) => sec.items && sec.items.length > 0);

  const visibleExperience =
    expTab === 'all'
      ? experienceSections
      : experienceSections.filter((s) => s.key === expTab);

  const skillCategories = [
    { label: 'Technical Skills', items: member.skills.technical },
    { label: 'Research Tools & Software', items: member.skills.researchTools },
    { label: 'Programming Languages', items: member.skills.programming },
    { label: 'GIS & Remote Sensing Tools', items: member.skills.gisRemoteSensing },
    { label: 'Professional Skills', items: member.skills.professional },
  ].filter((c) => c.items && c.items.length > 0);

  const handleCopyCitation = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(member.contact.email).catch(() => {});
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1800);
  };

  const cvFilename = `${member.id}-cv.pdf`;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb + Quick Member Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4 dark:border-[#232D3F]">
        <a
          href="#/team"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('#/team');
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#57534E] transition-colors hover:text-[#1E3A8A] dark:text-[#94A3B8] dark:hover:text-[#60A5FA]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Our Team</span>
        </a>

        <div className="flex flex-wrap items-center gap-1.5">
          {allMembers.map((m) => {
            const active = m.id === member.id;
            return (
              <a
                key={m.id}
                href={`#/profile/${m.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`#/profile/${m.id}`);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#1E3A8A] text-white dark:bg-[#3B82F6]'
                    : 'text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:bg-[#192130] dark:hover:text-[#F1F5F9]'
                }`}
              >
                {m.name}
              </a>
            );
          })}
        </div>
      </div>

      {/* A. Personal Information */}
      <section
        aria-labelledby="personal-info-heading"
        className="mt-8 rounded-xl border border-[#E5E0D8] bg-white p-6 sm:p-8 dark:border-[#232D3F] dark:bg-[#121824]"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="aspect-square max-w-xs overflow-hidden rounded-xl border border-[#E5E0D8] lg:max-w-none dark:border-[#232D3F]">
              <SafeImage
                src={member.photo}
                alt={`Academic portrait of ${member.name}`}
                fallbackLabel={member.name}
                loading="eager"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between lg:col-span-8">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
                Academic Profile
              </p>
              <h1
                id="personal-info-heading"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl dark:text-[#F1F5F9]"
              >
                {member.name}
              </h1>
              <p className="mt-2 text-base font-medium text-[#1E3A8A] dark:text-[#60A5FA]">
                {member.designation}
              </p>
              <p className="mt-1 text-sm text-[#57534E] dark:text-[#94A3B8]">
                {member.department} · {member.institution}
              </p>

              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#44403C] sm:text-base dark:text-[#CBD5E1]">
                {member.fullBio}
              </p>

              <div className="mt-6 border-t border-[#E5E0D8]/80 pt-4 dark:border-[#232D3F]/80">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#57534E] dark:text-[#94A3B8]">
                  Research Interests
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#18181B] dark:text-[#E2E8F0]">
                  {member.researchInterests.join(' · ')}
                </p>
              </div>
            </div>

            {/* CV & Contact Action Row */}
            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#E5E0D8]/80 pt-6 dark:border-[#232D3F]/80">
              <button
                type="button"
                onClick={() => onOpenCv(member)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>View CV</span>
              </button>

              <a
                href={member.cvUrl}
                download={cvFilename}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download CV (PDF)</span>
              </a>

              <a
                href={`mailto:${member.contact.email}`}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Email Researcher</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* B. Academic Qualifications */}
      <section className="mt-14" aria-labelledby="qualifications-heading">
        <div className="border-b border-[#E5E0D8] pb-3 dark:border-[#232D3F]">
          <h2
            id="qualifications-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
          >
            Academic Qualifications
          </h2>
        </div>

        <div className="mt-6 divide-y divide-[#E5E0D8] rounded-xl border border-[#E5E0D8] bg-white dark:divide-[#232D3F] dark:border-[#232D3F] dark:bg-[#121824]">
          {member.qualifications.map((q, idx) => (
            <div
              key={`${q.degree}-${idx}`}
              className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-12 sm:items-start"
            >
              <div className="sm:col-span-2">
                <span className="font-mono text-sm font-semibold tabular-nums text-[#1E3A8A] dark:text-[#60A5FA]">
                  {q.year}
                </span>
              </div>
              <div className="sm:col-span-10">
                <h3 className="font-serif text-lg font-semibold text-[#18181B] dark:text-[#F1F5F9]">
                  {q.degree}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-[#44403C] dark:text-[#CBD5E1]">
                  {q.institution}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#57534E] dark:text-[#94A3B8]">
                  Specialization: {q.specialization}
                  {q.achievements ? ` · ${q.achievements}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* C. Research Work */}
      <section className="mt-14" aria-labelledby="research-work-heading">
        <div className="flex flex-col gap-4 border-b border-[#E5E0D8] pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#232D3F]">
          <h2
            id="research-work-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
          >
            Research Work &amp; Projects
          </h2>

          <div
            className="inline-flex items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 self-start dark:bg-[#192130]"
            role="group"
            aria-label="Filter research projects by status"
          >
            {(['All', 'Ongoing', 'Completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setProjectFilter(status)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  projectFilter === status
                    ? 'bg-white text-[#18181B] shadow-xs dark:bg-[#0B0F17] dark:text-[#F1F5F9]'
                    : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
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
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs text-[#57534E] dark:text-[#94A3B8]">
                    <span className="font-semibold text-[#1E3A8A] dark:text-[#60A5FA]">
                      {project.status} Research
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">{project.timeframe}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{project.role}</span>
                  </p>
                  <h3 className="mt-2 font-serif text-lg font-semibold text-[#18181B] dark:text-[#F1F5F9]">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
                    {project.description}
                  </p>
                </div>

                {project.link && (
                  <div className="mt-4 border-t border-[#E5E0D8]/80 pt-3.5 dark:border-[#232D3F]/80">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] hover:underline dark:text-[#60A5FA]"
                    >
                      <span>View Project Repository / Paper</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* D. Publications */}
      <section className="mt-14" aria-labelledby="publications-heading">
        <div className="flex flex-col gap-4 border-b border-[#E5E0D8] pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#232D3F]">
          <h2
            id="publications-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
          >
            Publications
          </h2>

          <div
            className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 self-start dark:bg-[#192130]"
            role="group"
            aria-label="Filter publications by type"
          >
            {publicationTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPubFilter(type)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  pubFilter === type
                    ? 'bg-white text-[#18181B] shadow-xs dark:bg-[#0B0F17] dark:text-[#F1F5F9]'
                    : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                }`}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>

        {filteredPublications.length === 0 ? (
          <p className="mt-6 text-sm text-[#57534E] dark:text-[#94A3B8]">
            No publications recorded in this category.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-[#E5E0D8] rounded-xl border border-[#E5E0D8] bg-white dark:divide-[#232D3F] dark:border-[#232D3F] dark:bg-[#121824]">
            {filteredPublications.map((pub) => {
              const citationText = `${pub.authors} (${pub.year}). ${pub.title}. ${pub.venue}.${
                pub.doi ? ` https://doi.org/${pub.doi}` : ''
              }`;
              return (
                <div key={pub.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                      <h3 className="mt-1.5 font-serif text-base font-semibold leading-snug text-[#18181B] dark:text-[#F1F5F9]">
                        {pub.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#44403C] dark:text-[#CBD5E1]">
                        {pub.authors} — <span className="italic">{pub.venue}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(pub.id, citationText)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
                      >
                        {copiedId === pub.id ? (
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
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
                        >
                          <span>DOI / Link</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* E. Academic Experience */}
      <section className="mt-14" aria-labelledby="experience-heading">
        <div className="flex flex-col gap-4 border-b border-[#E5E0D8] pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#232D3F]">
          <h2
            id="experience-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
          >
            Academic Experience &amp; Training
          </h2>

          <div
            className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 self-start dark:bg-[#192130]"
            role="group"
            aria-label="Filter academic experience categories"
          >
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'teaching' as const, label: 'Teaching' },
              { key: 'research' as const, label: 'Research' },
              { key: 'internships' as const, label: 'Internships' },
              { key: 'workshops' as const, label: 'Workshops' },
              { key: 'certifications' as const, label: 'Certifications' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setExpTab(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  expTab === tab.key
                    ? 'bg-white text-[#18181B] shadow-xs dark:bg-[#0B0F17] dark:text-[#F1F5F9]'
                    : 'text-[#57534E] hover:text-[#18181B] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {visibleExperience.map((section) => (
            <div
              key={section.key}
              className="rounded-xl border border-[#E5E0D8] bg-white p-6 dark:border-[#232D3F] dark:bg-[#121824]"
            >
              <h3 className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
                {section.label}
              </h3>
              <div className="mt-4 divide-y divide-[#E5E0D8]/80 dark:divide-[#232D3F]/80">
                {section.items.map((item, idx) => (
                  <div
                    key={`${item.role}-${idx}`}
                    className="grid grid-cols-1 gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-3">
                      <p className="font-mono text-xs font-medium tabular-nums text-[#57534E] dark:text-[#94A3B8]">
                        {item.period}
                      </p>
                    </div>
                    <div className="sm:col-span-9">
                      <p className="font-medium text-[#18181B] dark:text-[#F1F5F9]">
                        {item.role}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-[#57534E] dark:text-[#94A3B8]">
                        {item.organization}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* F. Skills */}
      <section className="mt-14" aria-labelledby="skills-heading">
        <div className="border-b border-[#E5E0D8] pb-3 dark:border-[#232D3F]">
          <h2
            id="skills-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
          >
            Skills &amp; Technical Proficiencies
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {skillCategories.map((cat) => (
            <div
              key={cat.label}
              className="rounded-xl border border-[#E5E0D8] bg-white p-6 dark:border-[#232D3F] dark:bg-[#121824]"
            >
              <h3 className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
                {cat.label}
              </h3>
              <ul className="mt-3 divide-y divide-[#E5E0D8]/70 text-sm text-[#18181B] dark:divide-[#232D3F]/70 dark:text-[#E2E8F0]">
                {cat.items.map((skill) => (
                  <li key={skill} className="py-2 first:pt-0 last:pb-0">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* G. Social Media & Academic Profiles */}
      <section className="mt-14" aria-labelledby="socials-heading">
        <div className="border-b border-[#E5E0D8] pb-3 dark:border-[#232D3F]">
          <h2
            id="socials-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
          >
            Academic &amp; Social Profiles
          </h2>
        </div>

        <div className="mt-6">
          <SocialIcons socials={member.socials} memberName={member.name} variant="detailed" />
        </div>
      </section>

      {/* H. Contact Information */}
      <section className="mt-14" aria-labelledby="contact-heading">
        <div className="rounded-xl border border-[#E5E0D8] bg-white p-6 sm:p-8 dark:border-[#232D3F] dark:bg-[#121824]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A8A] dark:text-[#60A5FA]">
                Direct Correspondence
              </p>
              <h2
                id="contact-heading"
                className="font-serif text-2xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]"
              >
                Contact {member.name}
              </h2>

              <div className="mt-3 space-y-2 text-sm text-[#44403C] dark:text-[#CBD5E1]">
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                  <a
                    href={`mailto:${member.contact.email}`}
                    className="font-mono hover:underline"
                  >
                    {member.contact.email}
                  </a>
                </p>
                {member.contact.phone && (
                  <p className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                    <span className="font-mono tabular-nums">{member.contact.phone}</span>
                  </p>
                )}
                {member.contact.address && (
                  <p className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                    <span>{member.contact.address}</span>
                  </p>
                )}
                {member.contact.officeHours && (
                  <p className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0 text-[#1E3A8A] dark:text-[#60A5FA]" aria-hidden="true" />
                    <span>Office Hours: {member.contact.officeHours}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${member.contact.email}?subject=${encodeURIComponent(
                  `Academic Inquiry — ${member.name}`
                )}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Send Email</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-2.5 text-sm font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>Email Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('#/contact')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 dark:border-[#232D3F] dark:bg-[#121824] dark:text-[#F1F5F9] dark:hover:bg-[#192130]"
              >
                <span>Group Contact Page</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
