export interface SocialLinks {
  googleScholar?: string;
  researchGate?: string;
  orcid?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: string;
  specialization: string;
  achievements?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  status: 'Ongoing' | 'Completed';
  timeframe: string;
  description: string;
  image?: string;
  role: string;
  link?: string;
}

export type PublicationType =
  | 'Journal Article'
  | 'Conference Paper'
  | 'Book Chapter'
  | 'Research Paper';

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  type: PublicationType;
  doi?: string;
  url?: string;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  description: string;
}

export interface AcademicExperience {
  teaching: ExperienceItem[];
  research: ExperienceItem[];
  internships: ExperienceItem[];
  workshops: ExperienceItem[];
  certifications: ExperienceItem[];
}

export interface SkillSet {
  technical: string[];
  researchTools: string[];
  programming: string[];
  gisRemoteSensing: string[];
  professional: string[];
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  officeHours?: string;
}

export interface AcademicMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  institution: string;
  photo: string;
  cvUrl: string;
  shortBio: string;
  fullBio: string;
  researchInterests: string[];
  qualifications: Qualification[];
  researchProjects: ResearchProject[];
  publications: Publication[];
  experience: AcademicExperience;
  skills: SkillSet;
  socials: SocialLinks;
  contact: ContactInfo;
}

export interface GroupInfo {
  name: string;
  shortName: string;
  tagline: string;
  kicker: string;
  description: string;
  institution: string;
  department: string;
  location: string;
  email: string;
  heroImage: string;
  establishedYear: string;
}

export interface PortfolioData {
  group: GroupInfo;
  members: AcademicMember[];
}
