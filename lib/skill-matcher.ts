import { SkillAnalysisResult } from './skill-analyzer';

export interface SkillMatchResult {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  matchScore: number; // 0-10
  details: {
    technicalMatch: number;
    toolsMatch: number;
    frameworksMatch: number;
  };
}

/**
 * Calculate skill match between user skills and job requirements
 */
export function calculateSkillMatch(
  userSkills: SkillAnalysisResult,
  requiredSkills: string[]
): SkillMatchResult {
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
      if (
        userSkill === required ||
        userSkill.includes(required) ||
        required.includes(userSkill)
      ) {
        // Avoid duplicate matches
        if (!matchedSkills.includes(required)) {
          matchedSkills.push(required);
        }
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

  // Calculate detailed match scores
  const technicalMatch = calculateCategoryMatch(
    userSkills.technical,
    requiredSkills
  );
  const toolsMatch = calculateCategoryMatch(userSkills.tools, requiredSkills);
  const frameworksMatch = calculateCategoryMatch(
    userSkills.frameworks,
    requiredSkills
  );

  // Convert percentage to 0-10 score
  // 0-20% = 2/10, 20-40% = 4/10, etc.
  const matchScoreRaw = matchPercentage / 10;
  const matchScore = Math.min(10, Math.max(0, matchScoreRaw));

  return {
    matchedSkills: uniqueMatched,
    missingSkills: uniqueMissing,
    matchPercentage: parseFloat(matchPercentage.toFixed(1)),
    matchScore: parseFloat(matchScore.toFixed(1)),
    details: {
      technicalMatch: parseFloat(technicalMatch.toFixed(1)),
      toolsMatch: parseFloat(toolsMatch.toFixed(1)),
      frameworksMatch: parseFloat(frameworksMatch.toFixed(1)),
    },
  };
}

/**
 * Calculate match percentage for a specific skill category
 */
function calculateCategoryMatch(
  userCategorySkills: string[],
  requiredSkills: string[]
): number {
  if (userCategorySkills.length === 0) return 0;

  const normalizedUserSkills = userCategorySkills.map((skill) =>
    skill.toLowerCase().trim()
  );
  const normalizedRequired = requiredSkills.map((skill) =>
    skill.toLowerCase().trim()
  );

  let matches = 0;
  for (const userSkill of normalizedUserSkills) {
    for (const required of normalizedRequired) {
      if (userSkill === required || userSkill.includes(required)) {
        matches++;
        break;
      }
    }
  }

  return (matches / normalizedUserSkills.length) * 100;
}

/**
 * Rank jobs by match score
 */
export function rankJobsByMatch(
  jobs: any[],
  matchResults: Map<string, SkillMatchResult>
): any[] {
  return jobs.sort((a, b) => {
    const scoreA = matchResults.get(a._id?.toString() || a.externalId)
      ?.matchScore || 0;
    const scoreB = matchResults.get(b._id?.toString() || b.externalId)
      ?.matchScore || 0;
    return scoreB - scoreA;
  });
}

/**
 * Get score color/badge for UI display
 */
export function getScoreBadge(score: number): {
  color: string;
  label: string;
} {
  if (score >= 8) {
    return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
  } else if (score >= 6) {
    return { color: 'bg-blue-100 text-blue-800', label: 'Good' };
  } else if (score >= 4) {
    return { color: 'bg-yellow-100 text-yellow-800', label: 'Fair' };
  } else {
    return { color: 'bg-red-100 text-red-800', label: 'Poor' };
  }
}
