import { callClaudeJSON } from './anthropic-client';

export interface SkillAnalysisResult {
  technical: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
  languages: string[];
  yearsOfExperience?: number;
  seniority?: 'junior' | 'mid-level' | 'senior' | 'lead';
}

/**
 * Use Claude API to extract and categorize skills from CV text
 */
export async function analyzeSkillsWithClaude(
  cvText: string,
  linkedinText?: string
): Promise<SkillAnalysisResult> {
  const combinedText = linkedinText
    ? `CV:\n${cvText}\n\nLinkedIn Profile:\n${linkedinText}`
    : cvText;

  const prompt = `Analyze the following CV/LinkedIn profile and extract all skills. Categorize them into the following categories and return as JSON.

${combinedText}

Return a JSON object with this exact structure (only include skills that are explicitly mentioned):
{
  "technical": ["list of programming languages and technical skills"],
  "frameworks": ["list of frameworks like React, Django, Spring, etc."],
  "tools": ["list of tools like Git, Docker, AWS, etc."],
  "softSkills": ["list of soft skills like communication, leadership, etc."],
  "languages": ["list of human languages"],
  "yearsOfExperience": number or null,
  "seniority": "junior" or "mid-level" or "senior" or "lead" or null
}

Be thorough but only include skills that are explicitly mentioned in the text. Remove duplicates. Return ONLY valid JSON, no markdown formatting.`;

  try {
    const result = await callClaudeJSON<SkillAnalysisResult>(prompt, {
      model: 'claude-haiku-4-5-20251001', // Use sonnet model for text extraction
      maxTokens: 1500,
      temperature: 0.2,
    });

    // Validate and clean the result
    return {
      technical: Array.isArray(result.technical) ? result.technical : [],
      frameworks: Array.isArray(result.frameworks) ? result.frameworks : [],
      tools: Array.isArray(result.tools) ? result.tools : [],
      softSkills: Array.isArray(result.softSkills) ? result.softSkills : [],
      languages: Array.isArray(result.languages) ? result.languages : [],
      yearsOfExperience: result.yearsOfExperience || undefined,
      seniority: result.seniority || undefined,
    };
  } catch (error) {
    console.error('Error analyzing skills with Claude:', error);
    throw error;
  }
}

/**
 * Extract job requirements (required skills) from a job description
 */
export async function extractJobRequiredSkills(
  jobDescription: string
): Promise<string[]> {
  const prompt = `Extract all required technical and professional skills from this job description. Return as a JSON array of strings.

Job Description:
${jobDescription}

Return ONLY a JSON array like ["skill1", "skill2", ...]. No markdown, no explanations. Include programming languages, frameworks, tools, and relevant hard skills but exclude generic soft skills like "attention to detail".`;

  try {
    const result = await callClaudeJSON<string[]>(prompt, {
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 1000,
      temperature: 0.2,
    });

    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error extracting job required skills:', error);
    return [];
  }
}

/**
 * Calculate skill match between user skills and job requirements
 */
export function calculateSkillMatch(
  userSkills: SkillAnalysisResult,
  requiredSkills: string[]
): {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  matchScore: number;
} {
  // Combine all user skills into one list (normalized to lowercase)
  const allUserSkills = [
    ...userSkills.technical,
    ...userSkills.frameworks,
    ...userSkills.tools,
    ...userSkills.softSkills,
    ...userSkills.languages,
  ].map((skill) => skill.toLowerCase().trim());

  // Normalize required skills
  const normalizedRequired = requiredSkills.map((skill) =>
    skill.toLowerCase().trim()
  );

  // Find matches (allowing for partial matches)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const required of normalizedRequired) {
    let found = false;

    // Check for exact match or partial match
    for (const userSkill of allUserSkills) {
      if (userSkill === required || userSkill.includes(required)) {
        matchedSkills.push(required);
        found = true;
        break;
      }
    }

    if (!found) {
      missingSkills.push(required);
    }
  }

  // Remove duplicates
  const uniqueMatched = Array.from(new Set(matchedSkills));
  const uniqueMissing = Array.from(new Set(missingSkills));

  const totalRequired = normalizedRequired.length;
  const matchPercentage =
    totalRequired > 0 ? (uniqueMatched.length / totalRequired) * 100 : 0;

  // Convert percentage to 0-10 score
  // 0-20% = 2/10, 20-40% = 4/10, etc.
  const matchScoreRaw = matchPercentage / 10;
  const matchScore = Math.min(10, Math.max(0, matchScoreRaw));

  return {
    matchedSkills: uniqueMatched,
    missingSkills: uniqueMissing,
    matchPercentage: parseFloat(matchPercentage.toFixed(1)),
    matchScore: parseFloat(matchScore.toFixed(1)),
  };
}
