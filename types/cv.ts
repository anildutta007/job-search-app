export interface CVExperience {
  company: string;
  position: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  description: string;
  responsibilities?: string[];
}

export interface CVEducation {
  school: string;
  degree: string;
  field: string;
  graduationYear?: string;
  gpa?: string;
}

export interface CVParsedData {
  fullName: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: CVExperience[];
  education: CVEducation[];
  certifications?: string[];
  languages?: string[];
  projects?: string[];
}

export interface CV {
  _id?: string;
  userId: string;
  originalText: string;
  fileName: string;
  uploadedAt: Date;
  parsedData: CVParsedData;
}

export interface ExtractedSkills {
  _id?: string;
  cvId: string;
  linkedinUrl?: string;
  linkedinData?: string;
  extractedSkills: {
    technical: string[];
    frameworks: string[];
    tools: string[];
    softSkills: string[];
    languages: string[];
  };
  analyzedAt: Date;
  claudePromptUsed?: string;
  tokensUsed?: number;
}
