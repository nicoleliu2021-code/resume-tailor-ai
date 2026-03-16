import OpenAI from 'openai';
import type { StructuredResume } from '../../types/resume';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Lazy initialization - only create client when needed
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  return openai;
}

export async function parseResumeStructure(resumeText: string): Promise<StructuredResume> {
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `Parse this resume into structured JSON format.

Resume Text:
${resumeText}

Return a JSON object with this structure:
{
  "summary": "Professional summary or objective",
  "experience": [
    {
      "id": "unique-id",
      "company": "Company Name",
      "role": "Job Title",
      "location": "City, State (if available)",
      "startDate": "YYYY or Month YYYY",
      "endDate": "YYYY or Month YYYY or Present",
      "current": boolean,
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "id": "unique-id",
      "school": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "gpa": "3.8 (optional)"
    }
  ],
  "skills": [
    {
      "id": "unique-id",
      "name": "Skill Name",
      "category": "technical" | "soft" | "language" | "tool"
    }
  ],
  "projects": [
    {
      "id": "unique-id",
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"]
    }
  ]
}

Generate unique IDs for each item. Extract all relevant information accurately.`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser. Extract structured data from resumes accurately. Always return valid JSON.'
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
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content) as StructuredResume;
    parsed.rawText = resumeText;

    return parsed;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume structure');
  }
}
