import { CVParsedData, CVExperience, CVEducation } from '@/types/cv';

/**
 * Basic CV text extraction - parses raw CV text into structured format
 * This provides initial structure before Claude API refinement
 */
export function extractCVBasics(text: string): CVParsedData {
  const lines = text.split('\n').map((line) => line.trim());
  const data: CVParsedData = {
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
  };

  // Extract email
  const emailMatch = text.match(
    /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  );
  if (emailMatch) {
    data.email = emailMatch[1];
  }

  // Extract phone
  const phoneMatch = text.match(
    /(\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4})/
  );
  if (phoneMatch) {
    data.phone = phoneMatch[1];
  }

  // Extract name (usually first non-empty line)
  for (const line of lines) {
    if (
      line.length > 0 &&
      line.length < 100 &&
      !line.includes('@') &&
      !line.match(/\d{3}/)
    ) {
      data.fullName = line;
      break;
    }
  }

  // Extract skills (look for common keywords)
  const skillKeywords = [
    'skills',
    'technical',
    'competencies',
    'expertise',
    'proficiencies',
  ];
  let inSkillsSection = false;
  const tempSkills: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (
      skillKeywords.some(
        (keyword) =>
          line.includes(keyword) &&
          (line === keyword ||
            line.includes(':') ||
            line.includes('|') ||
            line.includes(','))
      )
    ) {
      inSkillsSection = true;
      // Try to extract skills from current or next line
      const skillLine =
        lines[i].includes(':') || lines[i].includes('|')
          ? lines[i].split(/[:|\n]/)[1] || lines[i + 1] || ''
          : lines[i + 1] || '';

      if (skillLine) {
        const skills = skillLine.split(/[,;]/).map((s) => s.trim());
        tempSkills.push(...skills);
      }
      continue;
    }

    if (
      inSkillsSection &&
      skillKeywords.some(
        (keyword) =>
          line.includes(keyword) &&
          line !== 'skills' &&
          line !== 'technical'
      )
    ) {
      inSkillsSection = false;
    }

    if (inSkillsSection && lines[i].trim()) {
      // Add skills if we're still in the skills section
      const skills = lines[i].split(/[,;]/).map((s) => s.trim());
      tempSkills.push(...skills);
    }
  }

  data.skills = Array.from(new Set(tempSkills.filter((s) => s.length > 0)));

  return data;
}

/**
 * Clean and normalize skill names
 */
export function normalizeSkills(skills: string[]): string[] {
  return Array.from(
    new Set(
      skills
        .map((skill) =>
          skill
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^a-z0-9\s\+\#\.]/g, '')
        )
        .filter((skill) => skill.length > 1 && skill.length < 50)
    )
  );
}

/**
 * Extract years of experience from text
 */
export function extractExperienceYears(text: string): number {
  const matches = text.match(/(\d+)\s*(?:\+)?\s*years?/i);
  if (matches) {
    return parseInt(matches[1], 10);
  }

  // Count years from dates if present
  const dateMatches = text.match(/\d{4}/g);
  if (dateMatches && dateMatches.length >= 2) {
    const years = dateMatches.map((d) => parseInt(d, 10));
    const maxYear = Math.max(...years);
    const minYear = Math.min(...years);
    return Math.max(0, maxYear - minYear);
  }

  return 0;
}

/**
 * Extract common programming languages
 */
export function extractProgrammingLanguages(text: string): string[] {
  const languages = [
    'python',
    'javascript',
    'typescript',
    'java',
    'cpp',
    'c++',
    'c#',
    'ruby',
    'php',
    'go',
    'rust',
    'kotlin',
    'swift',
    'scala',
    'r',
    'matlab',
    'perl',
    'groovy',
    'dart',
    'haskell',
    'clojure',
  ];

  const lowerText = text.toLowerCase();
  const found = languages.filter((lang) => {
    const regex = new RegExp(`\\b${lang}\\b`, 'i');
    return regex.test(lowerText);
  });

  return found;
}

/**
 * Extract common frameworks and libraries
 */
export function extractFrameworks(text: string): string[] {
  const frameworks = [
    'react',
    'vue',
    'angular',
    'svelte',
    'next.js',
    'nuxt',
    'gatsby',
    'express',
    'fastapi',
    'django',
    'flask',
    'spring',
    'spring boot',
    'node.js',
    'rails',
    'laravel',
    '.net',
    'asp.net',
    'graphql',
    'rest',
  ];

  const lowerText = text.toLowerCase();
  const found = frameworks.filter((fw) => {
    const regex = new RegExp(`\\b${fw.replace(/\./g, '\\.')}\\b`, 'i');
    return regex.test(lowerText);
  });

  return found;
}

/**
 * Extract common tools and technologies
 */
export function extractTools(text: string): string[] {
  const tools = [
    'git',
    'docker',
    'kubernetes',
    'jenkins',
    'gitlab',
    'github',
    'aws',
    'gcp',
    'azure',
    'postgresql',
    'mysql',
    'mongodb',
    'redis',
    'elasticsearch',
    'kafka',
    'docker',
    'linux',
    'windows',
    'macos',
    'agile',
    'scrum',
    'jira',
    'confluence',
  ];

  const lowerText = text.toLowerCase();
  const found = tools.filter((tool) => {
    const regex = new RegExp(`\\b${tool.replace(/\./g, '\\.')}\\b`, 'i');
    return regex.test(lowerText);
  });

  return found;
}
