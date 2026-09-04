import { JobListing } from '@/types/job';

/**
 * Search for jobs using JSearch API (RapidAPI)
 * Searches for UK jobs by default
 */
export async function searchJobsJSearch(
  skills: string[],
  limit: number = 20
): Promise<JobListing[]> {
  const jobs: JobListing[] = [];

  try {
    if (!process.env.JSEARCH_API_KEY) {
      console.warn('❌ JSearch API key NOT FOUND. Using mock jobs.');
      return generateMockJobs(limit);
    }

    console.log('✅ JSearch API key found');

    // Create search query from top skills
    const query = skills.slice(0, 2).join(' ');

    console.log(`🔍 Searching JSearch for: "${query}" in UK`);

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.JSEARCH_API_KEY,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
    };

    const searchUrl = new URL('https://jsearch.p.rapidapi.com/search');
    searchUrl.searchParams.append('query', `${query} UK`);
    searchUrl.searchParams.append('page', '1');
    searchUrl.searchParams.append('num_pages', '1');
    searchUrl.searchParams.append('country', 'GB'); // UK only
    searchUrl.searchParams.append('date_posted', 'month'); // Last month

    const response = await fetch(searchUrl.toString(), options);

    console.log(`📡 JSearch API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ JSearch API error: ${response.status} - ${errorText}`
      );
      console.warn('Falling back to mock jobs.');
      return generateMockJobs(limit);
    }

    const data = await response.json();
    const apiJobs = data.data || [];

    console.log(`✅ JSearch returned ${apiJobs.length} jobs`);

    // Transform API response to our format
    for (const apiJob of apiJobs.slice(0, limit)) {
      jobs.push({
        externalId: apiJob.job_id,
        source: 'jsearch',
        title: apiJob.job_title,
        company: apiJob.employer_name,
        location: apiJob.job_city
          ? `${apiJob.job_city}, ${apiJob.job_country}`
          : apiJob.job_country,
        description:
          apiJob.job_description || 'No description available',
        requiredSkills: extractSkillsFromDescription(
          apiJob.job_description || ''
        ),
        url: apiJob.job_apply_link || apiJob.job_google_link || '#',
        postedDate: new Date(apiJob.job_posted_at_datetime_utc),
        scrapedAt: new Date(),
        jobType: apiJob.job_employment_type,
        salaryRange:
          apiJob.job_min_salary && apiJob.job_max_salary
            ? {
                min: apiJob.job_min_salary,
                max: apiJob.job_max_salary,
                currency: apiJob.job_salary_currency || 'GBP',
              }
            : undefined,
      });
    }

    console.log(`Found ${jobs.length} jobs from JSearch`);
    return jobs;
  } catch (error) {
    console.error('Error searching JSearch:', error);
    console.log('Falling back to mock jobs');
    return generateMockJobs(limit);
  }
}

/**
 * Extract skills from job description using simple keyword matching
 */
function extractSkillsFromDescription(description: string): string[] {
  const commonSkills = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'React',
    'Node.js',
    'AWS',
    'Docker',
    'Kubernetes',
    'PostgreSQL',
    'MongoDB',
    'Git',
    'REST API',
    'GraphQL',
    'CI/CD',
    'Agile',
    'C#',
    '.NET',
    'Vue.js',
    'Angular',
    'SQL',
    'HTML',
    'CSS',
    'Bootstrap',
    'Tailwind',
    'Linux',
    'Terraform',
    'Jenkins',
    'GitLab',
    'Communication',
    'Leadership',
    'Problem Solving',
  ];

  const foundSkills: string[] = [];
  const descLower = description.toLowerCase();

  for (const skill of commonSkills) {
    if (descLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }

  return [...new Set(foundSkills)]; // Remove duplicates
}

/**
 * Generate mock jobs for testing (remove in production)
 */
export function generateMockJobs(count: number = 25): JobListing[] {
  const mockJobs: JobListing[] = [];
  const companies = [
    'Google',
    'Microsoft',
    'Amazon',
    'Meta',
    'Apple',
    'Netflix',
    'Tesla',
    'Uber',
    'Airbnb',
    'Stripe',
  ];
  const titles = [
    'Senior Full Stack Developer',
    'React.js Developer',
    'Backend Engineer',
    'Frontend Engineer',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Product Manager',
    'Solutions Architect',
  ];

  for (let i = 0; i < count; i++) {
    const company = companies[i % companies.length];
    const title = titles[i % titles.length];

    mockJobs.push({
      externalId: `mock-${i}`,
      source: 'other',
      title,
      company,
      location: ['San Francisco', 'New York', 'Remote', 'Seattle'][i % 4],
      description: `${company} is hiring a ${title}. This is a great opportunity to work with cutting-edge technologies and collaborate with talented engineers.`,
      requiredSkills: [
        'JavaScript',
        'React',
        'Node.js',
        'MongoDB',
        'AWS',
        'Python',
      ].slice(0, 4 + (i % 2)),
      url: `https://example.com/jobs/${i}`,
      postedDate: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ),
      scrapedAt: new Date(),
      jobType: ['Full-time', 'Contract'][i % 2],
      salaryRange: {
        min: 80000 + Math.random() * 80000,
        max: 160000 + Math.random() * 80000,
        currency: 'USD',
      },
    });
  }

  return mockJobs;
}
