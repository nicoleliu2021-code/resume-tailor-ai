// Real job search integration using JSearch API (RapidAPI)
// Fetches actual job postings from LinkedIn, Indeed, Glassdoor, etc.

export interface RealJob {
  job_id: string;
  employer_name: string;
  employer_logo?: string;
  job_title: string;
  job_description: string;
  job_apply_link: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_posted_at_datetime_utc?: string;
  job_employment_type?: string;
  job_is_remote?: boolean;
  job_required_skills?: string[];
  job_salary?: string;
}

export interface JobSearchResponse {
  jobs: RealJob[];
  total: number;
}

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
const RAPID_API_HOST = 'jsearch.p.rapidapi.com';

/**
 * Search for real jobs using job title from user's resume
 */
export async function searchRealJobs(
  jobTitle: string,
  location: string = 'United States',
  numResults: number = 10
): Promise<JobSearchResponse> {
  console.log('[JobSearch] Searching for real jobs:', { jobTitle, location, numResults });

  if (!RAPID_API_KEY || RAPID_API_KEY === 'your-rapidapi-key-here') {
    console.warn('[JobSearch] RapidAPI key not configured, using fallback');
    return searchJobsFallback(jobTitle, location, numResults);
  }

  try {
    const query = encodeURIComponent(`${jobTitle} in ${location}`);
    const url = `https://${RAPID_API_HOST}/search?query=${query}&num_pages=1&page=1&date_posted=month`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`Job search API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[JobSearch] Found', data.data?.length || 0, 'real jobs');

    return {
      jobs: data.data?.slice(0, numResults) || [],
      total: data.data?.length || 0,
    };
  } catch (error) {
    console.error('[JobSearch] Error fetching real jobs:', error);
    // Fallback to local search if API fails
    return searchJobsFallback(jobTitle, location, numResults);
  }
}

/**
 * Fallback: Generate job board search links when API is not available
 */
function searchJobsFallback(
  jobTitle: string,
  location: string,
  numResults: number
): JobSearchResponse {
  console.log('[JobSearch] Using fallback - generating search links');

  const encodedTitle = encodeURIComponent(jobTitle);
  const encodedLocation = encodeURIComponent(location);

  // Generate search links for major job boards
  const jobBoards = [
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${encodedLocation}`,
      description: `Search for ${jobTitle} positions on LinkedIn`,
    },
    {
      name: 'Indeed',
      url: `https://www.indeed.com/jobs?q=${encodedTitle}&l=${encodedLocation}`,
      description: `Search for ${jobTitle} positions on Indeed`,
    },
    {
      name: 'Glassdoor',
      url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedTitle}&locT=&locId=`,
      description: `Search for ${jobTitle} positions on Glassdoor`,
    },
    {
      name: 'ZipRecruiter',
      url: `https://www.ziprecruiter.com/jobs-search?search=${encodedTitle}&location=${encodedLocation}`,
      description: `Search for ${jobTitle} positions on ZipRecruiter`,
    },
    {
      name: 'Monster',
      url: `https://www.monster.com/jobs/search?q=${encodedTitle}&where=${encodedLocation}`,
      description: `Search for ${jobTitle} positions on Monster`,
    },
  ];

  const jobs: RealJob[] = jobBoards.slice(0, numResults).map((board, index) => ({
    job_id: `fallback_${index}`,
    employer_name: board.name,
    job_title: `${jobTitle} - Search on ${board.name}`,
    job_description: board.description,
    job_apply_link: board.url,
    job_country: location,
    job_is_remote: false,
  }));

  return {
    jobs,
    total: jobs.length,
  };
}

/**
 * Get the latest job title from user's resume
 */
export function getLatestJobTitle(resume: any): string {
  if (!resume?.experience || resume.experience.length === 0) {
    return 'Software Engineer'; // Default fallback
  }

  // Sort experiences by date (current first, then most recent)
  const sortedExp = [...resume.experience].sort((a: any, b: any) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;

    const dateA = new Date(a.endDate || a.startDate);
    const dateB = new Date(b.endDate || b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  return sortedExp[0].role || 'Software Engineer';
}
