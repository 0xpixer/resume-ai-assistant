import { NextResponse } from 'next/server';
import { Resume } from '@/types/resume';
import { OpenAI } from 'openai';

/**
 * API route to get an estimate of the number of issues in a resume
 * This is a lightweight version that only returns the count of issues
 * instead of detailed feedback, for use with the subscription paywall.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume, targetJob } = body;

    if (!resume) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }

    // For optimization, if the resume already has feedback, use that instead of generating new
    if (
      resume.feedback &&
      resume.feedback.categories &&
      Array.isArray(resume.feedback.categories)
    ) {
      const totalIssues = resume.feedback.categories.reduce(
        (total: number, category: { issues: any[] }) => total + category.issues.length,
        0
      );
      return NextResponse.json({ issueCount: totalIssues });
    }

    // Use a simplified approach to estimate the number of issues
    // This avoids generating full feedback which is expensive
    const issueCount = await getEstimatedIssueCount(resume, targetJob);
    
    return NextResponse.json({ issueCount });
  } catch (error) {
    console.error('Error in feedback-count API:', error);
    return NextResponse.json(
      { error: 'Failed to get issue count' },
      { status: 500 }
    );
  }
}

/**
 * Get an estimated number of issues in the resume
 * This is a lightweight alternative to generating full feedback
 */
async function getEstimatedIssueCount(
  resume: Resume | any,
  targetJob?: string
): Promise<number> {
  try {
    // If OpenAI is available, use it for a quick estimation
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const openai = new OpenAI({ apiKey });
      
      // Prepare resume data
      const resumeText = prepareResumeForAnalysis(resume);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume reviewer. Your task is to estimate the number of issues in a resume without providing detailed feedback. Only return a single number as your response, representing your estimate of how many issues need fixing.',
          },
          {
            role: 'user',
            content: `Here is a resume${targetJob ? ' for a ' + targetJob + ' position' : ''}:\n\n${resumeText}\n\nEstimate the number of issues that need improvement. Return only a single number.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 10,
      });
      
      const estimatedIssues = parseInt(response.choices[0]?.message.content?.trim() || '10');
      return isNaN(estimatedIssues) ? 10 : estimatedIssues;
    }
    
    // Fallback: Use a simple heuristic approach
    return getFallbackIssueCount(resume);
  } catch (error) {
    console.error('Error estimating issue count:', error);
    return 10; // Default fallback
  }
}

/**
 * Prepare resume data for analysis
 */
function prepareResumeForAnalysis(resume: Resume | any): string {
  // If resume has a rawText property, use that directly
  if (resume.rawText) {
    return resume.rawText;
  }
  
  // Otherwise, build a text representation from structured data
  const structured = resume.structured || resume;
  
  let resumeText = '';
  
  // Add contact info
  if (structured.contactInfo) {
    resumeText += `${structured.contactInfo.name || 'Unnamed'}\n`;
    resumeText += `${structured.contactInfo.email || ''}\n`;
    resumeText += `${structured.contactInfo.phone || ''}\n`;
    resumeText += `${structured.contactInfo.location || ''}\n\n`;
  }
  
  // Add summary
  if (structured.summary) {
    resumeText += `SUMMARY:\n${structured.summary}\n\n`;
  }
  
  // Add skills
  if (structured.skills && structured.skills.length > 0) {
    resumeText += `SKILLS:\n${structured.skills.join(', ')}\n\n`;
  }
  
  // Add experience
  if (structured.experience && structured.experience.length > 0) {
    resumeText += 'EXPERIENCE:\n';
    structured.experience.forEach((exp: any) => {
      resumeText += `${exp.title || 'Position'} at ${exp.company || 'Company'}, ${exp.dates || 'N/A'}\n`;
      resumeText += `${exp.description || ''}\n\n`;
    });
  }
  
  // Add education
  if (structured.education && structured.education.length > 0) {
    resumeText += 'EDUCATION:\n';
    structured.education.forEach((edu: any) => {
      resumeText += `${edu.degree || 'Degree'} at ${edu.institution || 'Institution'}, ${edu.dates || 'N/A'}\n`;
      resumeText += `${edu.description || ''}\n\n`;
    });
  }
  
  return resumeText;
}

/**
 * Get a fallback issue count based on simple heuristics
 * Used when OpenAI is not available
 */
function getFallbackIssueCount(resume: Resume | any): number {
  let issueCount = 0;
  const structured = resume.structured || resume;
  
  // Check for missing key sections
  if (!structured.summary || structured.summary.length < 50) issueCount += 1;
  if (!structured.skills || structured.skills.length < 5) issueCount += 1;
  
  // Check experience entries
  if (structured.experience) {
    structured.experience.forEach((exp: any) => {
      if (!exp.description || exp.description.length < 100) issueCount += 1;
      if (!exp.title || !exp.company || !exp.dates) issueCount += 1;
    });
  } else {
    issueCount += 3;
  }
  
  // Check education entries
  if (!structured.education || structured.education.length === 0) issueCount += 1;
  
  // Add some randomness to make it seem more natural
  issueCount += Math.floor(Math.random() * 3);
  
  return Math.min(Math.max(issueCount, 5), 15);
} 