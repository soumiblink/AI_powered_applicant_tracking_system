import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not defined in environment variables');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  atsScore: number;
}

export async function analyzeResumeWithJob(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description and provide a detailed assessment.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "matchScore": <number 0-100>,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "atsScore": <number 0-100>
}

Guidelines:
- matchScore: Overall match percentage between resume and job
- matchingSkills: Skills from job description found in resume
- missingSkills: Important skills from job description not in resume
- suggestions: Specific recommendations to improve the resume
- atsScore: How well the resume would perform in ATS systems (formatting, keywords, etc.)`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  
  try {
    const result = JSON.parse(content);
    return {
      matchScore: result.matchScore || 0,
      matchingSkills: result.matchingSkills || [],
      missingSkills: result.missingSkills || [],
      suggestions: result.suggestions || [],
      atsScore: result.atsScore || 0,
    };
  } catch (error) {
    console.error('Failed to parse Groq response:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
}
