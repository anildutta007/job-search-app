export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface JobListing {
  _id?: string;
  externalId: string;
  source: 'indeed' | 'linkedin' | 'glassdoor' | 'other' | 'jsearch' | 'mock';
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[];
  salaryRange?: SalaryRange;
  url: string;
  postedDate: Date;
  scrapedAt: Date;
  jobType?: string;
  experienceLevel?: string;
}

export interface SkillMatch {
  _id?: string;
  userId: string;
  jobId: string;
  matchScore: number; // 0-10
  matchPercentage: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  matchedAt: Date;
}

export interface Application {
  _id?: string;
  userId: string;
  jobId: string;
  status: 'applied' | 'interview' | 'rejected' | 'offer' | 'interested';
  appliedAt: Date;
  generatedCvId?: string;
  generatedCoverId?: string;
  notes?: string;
}

export interface GeneratedContent {
  _id?: string;
  userId: string;
  jobId: string;
  type: 'cv' | 'cover_letter';
  originalContent: string;
  generatedContent: string;
  promptUsed?: string;
  claudeTokensUsed?: number;
  generatedAt: Date;
}
