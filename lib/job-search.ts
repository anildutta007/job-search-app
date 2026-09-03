import { JobListing } from '@/types/job';

/**
 * Search for jobs based on extracted skills
 * Combines results from multiple job sources
 */
export async function searchJobsMultipleSources(
  skills: string[],
  location?: string,
  limit: number = 50
): Promise<JobListing[]> {
  try {
    const allJobs: JobListing[] = [];

    // Search from multiple sources in parallel
    const [indeedJobs, linkedinJobs] = await Promise.allSettled([
      searchIndeedJobs(skills, location, Math.ceil(limit / 2)),
      searchLinkedInJobs(skills, location, Math.ceil(limit / 2)),
    ]);

    if (indeedJobs.status === 'fulfilled') {
      allJobs.push(...indeedJobs.value);
    }

    if (linkedinJobs.status === 'fulfilled') {
      allJobs.push(...linkedinJobs.value);
    }

    // Remove duplicates (by URL)
    const uniqueJobs = Array.from(
      new Map(allJobs.map((job) => [job.url, job])).values()
    );

    // Sort by posted date (newest first)
    uniqueJobs.sort(
      (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    return uniqueJobs.slice(0, limit);
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
}

/**
 * Search Indeed for jobs based on keywords
 * Note: Using web scraping as Indeed API is restricted
 */
export async function searchIndeedJobs(
  skills: string[],
  location?: string,
  limit: number = 25
): Promise<JobListing[]> {
  const jobs: JobListing[] = [];

  try {
    // Create search query from top skills
    const query = skills.slice(0, 3).join(' OR ');
    const queryParam = encodeURIComponent(query);
    const locationParam = location ? `&l=${encodeURIComponent(location)}` : '';

    const url = `https://www.indeed.com/jobs?q=${queryParam}${locationParam}&limit=${limit}`;

    console.log('Searching Indeed:', url);

    // Note: In production, use official Indeed API if available
    // For now, this is a placeholder that would require actual web scraping implementation
    // or API integration

    return jobs;
  } catch (error) {
    console.error('Error searching Indeed:', error);
    return jobs;
  }
}

/**
 * Search LinkedIn Jobs for matching positions
 */
export async function searchLinkedInJobs(
  skills: string[],
  location?: string,
  limit: number = 25
): Promise<JobListing[]> {
  const jobs: JobListing[] = [];

  try {
    // Create search query from top skills
    const query = skills.slice(0, 3).join(' OR ');
    const queryParam = encodeURIComponent(query);
    const locationParam = location ? `&location=${encodeURIComponent(location)}` : '';

    const url = `https://www.linkedin.com/jobs/search/?keywords=${queryParam}${locationParam}`;

    console.log('Searching LinkedIn:', url);

    // Note: LinkedIn jobs scraping requires handling of dynamic content
    // For now, this is a placeholder that would require actual implementation

    return jobs;
  } catch (error) {
    console.error('Error searching LinkedIn jobs:', error);
    return jobs;
  }
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
