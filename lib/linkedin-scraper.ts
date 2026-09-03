import * as cheerio from 'cheerio';

/**
 * Scrape public LinkedIn profile data
 * Note: Only works with public profiles (not behind login wall)
 */
export async function scrapeLinkedInProfile(
  profileUrl: string
): Promise<string> {
  try {
    // Add /en suffix if not present to get the English version
    let url = profileUrl.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    // Normalize URL
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('linkedin.com')) {
      throw new Error('Invalid LinkedIn URL');
    }

    // Add /en for English version and force public view
    if (!urlObj.pathname.includes('/en')) {
      urlObj.pathname = '/in/' + urlObj.pathname.split('/').pop() + '/en';
    }

    const response = await fetch(urlObj.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract text content from the page
    let profileText = '';

    // Get main content sections
    const mainContent = $('main, article, [data-test-id="profile"]').text();
    const aboutSection = $('[data-test-id="about-section"]').text();
    const experienceSection = $('[data-test-id="experience-section"]').text();
    const skillsSection = $('[data-test-id="skills-section"]').text();
    const recommendationsSection = $(
      '[data-test-id="recommendations-section"]'
    ).text();

    profileText = [
      mainContent,
      aboutSection,
      experienceSection,
      skillsSection,
      recommendationsSection,
    ]
      .filter((s) => s.trim().length > 0)
      .join('\n\n');

    if (!profileText.trim()) {
      // Fallback: get all visible text
      profileText = $('body').text();
    }

    return profileText.trim();
  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error);
    throw error;
  }
}

/**
 * Extract profile URL from various LinkedIn URL formats
 */
export function normalizeLinkedInUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);

    if (!urlObj.hostname.includes('linkedin.com')) {
      throw new Error('Not a LinkedIn URL');
    }

    // Extract profile ID or username from pathname
    const pathname = urlObj.pathname;
    const profileMatch = pathname.match(/\/(?:in|company)\/([^\/\?]+)/);

    if (!profileMatch) {
      throw new Error('Could not extract profile from URL');
    }

    const profileId = profileMatch[1];
    return `https://www.linkedin.com/in/${profileId}`;
  } catch (error) {
    console.error('Error normalizing LinkedIn URL:', error);
    throw error;
  }
}

/**
 * Validate if URL is a LinkedIn profile URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    return (
      urlObj.hostname.includes('linkedin.com') &&
      (urlObj.pathname.includes('/in/') || urlObj.pathname.includes('/company/'))
    );
  } catch {
    return false;
  }
}

/**
 * Extract sections from LinkedIn profile HTML
 */
export function extractLinkedInSections(html: string): {
  name?: string;
  headline?: string;
  about?: string;
  experience?: string[];
  education?: string[];
  skills?: string[];
} {
  const $ = cheerio.load(html);

  return {
    name: $('[data-test-id="profile-name"]').text().trim(),
    headline: $('[data-test-id="profile-headline"]').text().trim(),
    about: $('[data-test-id="about-section"] p').text().trim(),
    experience: $('[data-test-id="experience-section"] li')
      .map((_, el) => $(el).text())
      .get()
      .filter((text) => text.trim().length > 0),
    education: $('[data-test-id="education-section"] li')
      .map((_, el) => $(el).text())
      .get()
      .filter((text) => text.trim().length > 0),
    skills: $('[data-test-id="skills-section"] button')
      .map((_, el) => $(el).text())
      .get()
      .filter((text) => text.trim().length > 0),
  };
}
