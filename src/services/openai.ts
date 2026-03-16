import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your-api-key-here') {
  console.warn('OpenAI API key is not configured. Client-side AI features will not work.');
}

// Lazy initialization - only create client when needed
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend server
    });
  }

  return openai;
}

export interface JobAnalysis {
  roleTitle: string;
  seniorityLevel: string;
  industry: string;
  coreResponsibilities: string[];
  technicalSkills: string[];
  softSkills: string[];
  hiringSignals: string[];
  atsKeywords: string[];
}

export async function analyzeJobDescription(jobDescription: string): Promise<JobAnalysis> {
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key is not configured. Please add your API key to the .env.local file');
  }

  const prompt = `You are a hiring manager analyzing a job description.

Extract the following information:

1. Role title
2. Seniority level
3. Industry
4. Core responsibilities (top 5)
5. Key technical skills
6. Key soft skills
7. Signals that hiring managers care about
8. Keywords important for ATS systems

Return the output as structured JSON with these exact keys:
{
  "roleTitle": "string",
  "seniorityLevel": "string",
  "industry": "string",
  "coreResponsibilities": ["string"],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "hiringSignals": ["string"],
  "atsKeywords": ["string"]
}

Job description:
${jobDescription}`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert hiring manager and recruiter who analyzes job descriptions. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response received from OpenAI');
    }

    return JSON.parse(content) as JobAnalysis;
  } catch (error) {
    console.error('Error analyzing job description:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze job: ${error.message}`);
    }
    throw new Error('Failed to analyze job description. Please try again.');
  }
}

export async function tailorResume(
  resumeText: string,
  jobDescription: string,
  jobAnalysis: JobAnalysis
): Promise<string> {
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key is not configured. Please add your API key to the .env.local file');
  }

  const prompt = `You are an expert resume writer and career coach. Your task is to tailor a resume to match a specific job description.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

JOB ANALYSIS:
- Role: ${jobAnalysis.roleTitle} (${jobAnalysis.seniorityLevel})
- Industry: ${jobAnalysis.industry}
- Key Skills Needed: ${jobAnalysis.technicalSkills.join(', ')}
- Important Keywords: ${jobAnalysis.atsKeywords.join(', ')}

INSTRUCTIONS:
1. Analyze the resume and identify relevant experience matching the job requirements
2. Rewrite the resume to highlight skills and experience that match: ${jobAnalysis.technicalSkills.slice(0, 5).join(', ')}
3. Incorporate these ATS keywords naturally: ${jobAnalysis.atsKeywords.slice(0, 10).join(', ')}
4. Emphasize accomplishments relevant to: ${jobAnalysis.coreResponsibilities.slice(0, 3).join(', ')}
5. Maintain the original resume's structure and format
6. Keep all information truthful - do not fabricate experience or skills
7. Use action verbs and quantify achievements where possible
8. Make the resume ATS-friendly and compelling for the ${jobAnalysis.seniorityLevel} ${jobAnalysis.roleTitle} role

Provide ONLY the tailored resume text in a clean, professional format. Do not include any explanations or meta-commentary.`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer who helps job seekers tailor their resumes to specific job descriptions. You maintain honesty while highlighting the most relevant qualifications. Format the resume professionally with clear sections.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const tailoredResume = completion.choices[0]?.message?.content;

    if (!tailoredResume) {
      throw new Error('No response received from OpenAI');
    }

    return tailoredResume.trim();
  } catch (error) {
    console.error('Error tailoring resume:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to tailor resume: ${error.message}`);
    }
    throw new Error('Failed to tailor resume. Please try again.');
  }
}
