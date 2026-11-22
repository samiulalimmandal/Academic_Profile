import React from 'react';
import { ArrowUpRight, Download } from 'lucide-react';
import type { AcademicMember } from '../types/academic';
import { SafeImage } from './SafeImage';
import { SocialIcons } from './SocialIcons';

interface MemberCardProps {
  member: AcademicMember;
  onViewProfile: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onViewProfile }) => {
  const cvFilename = `${member.id}-cv.pdf`;

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-[#E5E0D8] bg-white p-6 transition-colors duration-200 hover:border-[#1E3A8A]/40 dark:border-[#232D3F] dark:bg-[#121824] dark:hover:border-[#60A5FA]/40">
      <div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <a
            href={`#/profile/${member.id}`}
            onClick={(e) => {
              e.preventDefault();
              onViewProfile(member.id);
            }}
            className="block h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-[#E5E0D8] dark:border-[#232D3F]"
          >
            <SafeImage
              src={member.photo}
              alt={`Portrait of ${member.name}`}
              fallbackLabel={member.name}
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </a>

          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-xl font-semibold tracking-tight text-[#18181B] dark:text-[#F1F5F9]">
              <a
                href={`#/profile/${member.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onViewProfile(member.id);
                }}
                className="hover:text-[#1E3A8A] dark:hover:text-[#60A5FA]"
              >
                {member.name}
              </a>
            </h3>
            <p className="mt-1 text-sm font-medium text-[#1E3A8A] dark:text-[#60A5FA]">
              {member.designation}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#57534E] dark:text-[#94A3B8]">
              {member.department} · {member.institution}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#44403C] dark:text-[#CBD5E1]">
          {member.shortBio}
        </p>

        <div className="mt-4 border-t border-[#E5E0D8]/80 pt-3.5 dark:border-[#232D3F]/80">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-[#57534E] dark:text-[#94A3B8]">
            Research Interests
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#18181B] dark:text-[#E2E8F0]">
            {member.researchInterests.join(' · ')}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-[#E5E0D8]/80 pt-4 dark:border-[#232D3F]/80">
        <SocialIcons socials={member.socials} memberName={member.name} variant="compact" />

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`#/profile/${member.id}`}
            onClick={(e) => {
              e.preventDefault();
              onViewProfile(member.id);
            }}
            className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] dark:focus-visible:outline-[#60A5FA]"
          >
            <span>View Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <a
            href={member.cvUrl}
            download={cvFilename}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] dark:border-[#232D3F] dark:bg-[#0B0F17] dark:text-[#F1F5F9] dark:hover:bg-[#192130] dark:focus-visible:outline-[#60A5FA]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download CV</span>
          </a>
        </div>
      </div>
    </article>
  );
};
