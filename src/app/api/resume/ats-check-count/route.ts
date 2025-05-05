import { NextResponse } from 'next/server';
import { Resume } from '@/types/resume';
import { OpenAI } from 'openai';

/**
 * API route to get an estimate of the number of ATS issues in a resume
 * This is a lightweight version that only returns the count of issues
 * instead of detailed analysis, for use with the subscription paywall.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume, jobDescription } = body;

    if (!resume) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    // For optimization, if the resume already has ATS analysis, use that instead of generating new
    if (
      resume.atsAnalysis &&
      resume.atsAnalysis.issues &&
      Array.isArray(resume.atsAnalysis.issues)
    ) {
      return NextResponse.json({ issueCount: resume.atsAnalysis.issues.length });
    }

    // Use a simplified approach to estimate the number of ATS issues
    // This avoids generating full analysis which is expensive
    const issueCount = await getEstimatedATSIssueCount(resume, jobDescription);
    
    return NextResponse.json({ issueCount });
  } catch (error) {
    console.error('Error in ats-check-count API:', error);
    return NextResponse.json(
      { error: 'Failed to get ATS issue count' },
      { status: 500 }
    );
  }
}

/**
 * Get an estimated number of ATS issues in the resume
 * This is a lightweight alternative to generating full analysis
 */
async function getEstimatedATSIssueCount(
  resume: Resume | any,
  jobDescription: string
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
            content: 'You are an expert in Applicant Tracking Systems (ATS). Your task is to estimate the number of issues that might prevent a resume from passing ATS screening for a specific job description. Only return a single number as your response.',
          },
          {
            role: 'user',
            content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nEstimate the number of ATS issues that would prevent this resume from being matched with this job. Return only a single number.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 10,
      });
      
      const estimatedIssues = parseInt(response.choices[0]?.message.content?.trim() || '5');
      return isNaN(estimatedIssues) ? 5 : estimatedIssues;
    }
    
    // Fallback: Use a simple keyword matching approach
    return getFallbackATSIssueCount(resume, jobDescription);
  } catch (error) {
    console.error('Error estimating ATS issue count:', error);
    return 5; // Default fallback
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
 * Get a fallback ATS issue count based on simple keyword matching
 * Used when OpenAI is not available
 */
function getFallbackATSIssueCount(resume: Resume | any, jobDescription: string): number {
  let issueCount = 0;
  
  // Extract important keywords from job description
  const keywordRegex = /\b(experience|skill|qualification|degree|certification|proficient|knowledge|familiar|year|expert)\w*\s+\w+(?:\s+\w+){0,5}/gi;
  const matches = jobDescription.match(keywordRegex) || [];
  
  // Get unique keywords
  const importantKeywords = Array.from(new Set(matches.map(kw => kw.toLowerCase())));
  
  // Get resume text
  const resumeText = prepareResumeForAnalysis(resume).toLowerCase();
  
  // Count missing keywords
  const missingKeywords = importantKeywords.filter(keyword => !resumeText.includes(keyword));
  issueCount = Math.min(missingKeywords.length, 10);
  
  // Check for common ATS issues
  if (!resumeText.includes('skill')) issueCount += 1;
  if (!resumeText.match(/\d{4}/)) issueCount += 1; // No years mentioned
  if (resumeText.length < 500) issueCount += 1; // Too short
  
  // Add some randomness to make it seem more natural
  issueCount += Math.floor(Math.random() * 2);
  
  return Math.min(Math.max(issueCount, 3), 10);
} 