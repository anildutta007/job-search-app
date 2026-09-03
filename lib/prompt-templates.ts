/**
 * Reusable prompt templates for Claude API calls
 */

export const PROMPTS = {
  /**
   * Extract skills from CV text
   */
  EXTRACT_SKILLS: (cvText: string, linkedinText?: string) => {
    const combined = linkedinText
      ? `CV:\n${cvText}\n\nLinkedIn Profile:\n${linkedinText}`
      : cvText;

    return `Analyze the following CV/LinkedIn profile and extract all skills. Categorize them and return as JSON.

${combined}

Return ONLY this JSON structure:
{
  "technical": ["programming languages and technical skills"],
  "frameworks": ["frameworks like React, Django, Spring"],
  "tools": ["tools like Git, Docker, AWS"],
  "softSkills": ["soft skills like communication, leadership"],
  "languages": ["human languages"],
  "yearsOfExperience": number or null,
  "seniority": "junior" | "mid-level" | "senior" | "lead" or null
}`;
  },

  /**
   * Extract required skills from job description
   */
  EXTRACT_JOB_SKILLS: (jobDescription: string) => {
    return `Extract all required technical and professional skills from this job description. Return as a JSON array of strings only.

Job Description:
${jobDescription}

Return ONLY: ["skill1", "skill2", ...]. Include programming languages, frameworks, tools. Exclude generic soft skills.`;
  },

  /**
   * Generate optimized CV for a specific job
   */
  GENERATE_OPTIMIZED_CV: (
    originalCV: string,
    jobDescription: string,
    userSkills: string[]
  ) => {
    return `You are an expert career coach. I have an original CV and a target job description. Please generate an optimized version of the CV that:

1. Highlights the most relevant skills and experiences for THIS specific job
2. Reorganizes sections to emphasize job match
3. Adds specific metrics, achievements, and outcomes that align with job requirements
4. Uses keywords from the job description where appropriate
5. Maintains truthfulness - do NOT fabricate experience or skills

IMPORTANT: Only reorganize, reword, and emphasize existing content. Do NOT add experiences or skills not in the original CV.

Original CV:
${originalCV}

Job Description:
${jobDescription}

User's Skills:
${userSkills.join(', ')}

Generate a complete, polished CV that is tailored to this job. Format it professionally with clear sections. Only output the CV content, no explanations.`;
  },

  /**
   * Generate cover letter
   */
  GENERATE_COVER_LETTER: (
    candidateName: string,
    candidateBackground: string,
    userSkills: string[],
    jobTitle: string,
    company: string,
    jobDescription: string,
    companyInfo?: string
  ) => {
    const companySection = companyInfo
      ? `\nCompany Information:\n${companyInfo}`
      : '';

    return `Write a compelling, professional cover letter for a job applicant. The letter should be 3-4 paragraphs and feel personal and authentic.

Candidate Information:
Name: ${candidateName}
Background: ${candidateBackground}
Skills: ${userSkills.join(', ')}

Target Job:
Title: ${jobTitle}
Company: ${company}
Description: ${jobDescription}
${companySection}

The cover letter should:
1. Be personalized and specific to the company and role
2. Highlight the most relevant skills for THIS job
3. Show genuine enthusiasm and cultural alignment
4. Use professional but warm tone
5. Be 3-4 paragraphs (approximately 250-400 words)
6. NOT include header/footer formatting, just the letter body

Generate ONLY the cover letter text, no explanations or formatting instructions.`;
  },

  /**
   * Analyze skill gaps
   */
  ANALYZE_SKILL_GAPS: (
    userSkills: string[],
    jobSkillsList: Array<{ title: string; skills: string[] }>
  ) => {
    const jobsText = jobSkillsList
      .map((job) => `- ${job.title}: ${job.skills.join(', ')}`)
      .join('\n');

    return `Analyze skill gaps between a candidate and multiple target jobs.

Candidate's Current Skills:
${userSkills.join(', ')}

Target Jobs and Required Skills:
${jobsText}

Return a JSON object with this structure:
{
  "commonMissingSkills": ["skills appearing in 3+ jobs but not in candidate's profile"],
  "skillGapAnalysis": [
    {
      "skill": "skill name",
      "appearanceCount": number,
      "estimatedLearnTime": "weeks/months",
      "importance": "high/medium/low"
    }
  ],
  "recommendations": ["ordered list of skills to learn for maximum job match"],
  "estimatedTimeToUpskill": "total time estimate"
}

Return ONLY valid JSON.`;
  },

  /**
   * Parse job description summary
   */
  PARSE_JOB_SUMMARY: (jobDescription: string) => {
    return `Parse this job description and extract key information. Return as JSON.

Job Description:
${jobDescription}

Return this JSON structure only:
{
  "keyResponsibilities": ["list of main job responsibilities"],
  "requiredQualifications": ["list of must-have qualifications"],
  "preferredQualifications": ["list of nice-to-have qualifications"],
  "salaryIndicators": "any salary range mentioned or null",
  "jobType": "full-time/part-time/contract/remote/other",
  "experience": "years of experience required or null",
  "seniority": "junior/mid-level/senior/lead or null"
}`;
  },
};

export default PROMPTS;
