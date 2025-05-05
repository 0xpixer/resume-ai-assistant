import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ResumeData {
  structured?: {
    summary?: string;
    experience?: Array<{
      company?: string;
      position?: string;
      description?: string;
      achievements?: string[];
    }>;
    skills?: string[];
  };
  experience?: Array<{
    company?: string;
    position?: string;
    description?: string;
    achievements?: string[];
  }>;
  summary?: string;
  skills?: string[];
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { resume, targetJob } = await request.json();

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // 标准化简历数据结构
    const resumeData: ResumeData = resume;
    const structured = resumeData.structured || resumeData;
    
    // 提取所需数据
    const summary = structured.summary || '';
    const experience = structured.experience || [];
    const skills = structured.skills || [];

    // 构建简历内容
    const experienceText = experience.map(exp => {
      const achievements = exp.achievements || [];
      return `
Position: ${exp.position || 'Not specified'}
Company: ${exp.company || 'Not specified'}
Description: ${exp.description || 'Not specified'}
Achievements:
${achievements.map(achievement => `- ${achievement}`).join('\n')}
      `.trim();
    }).join('\n\n');

    const prompt = `As an expert resume reviewer, analyze this resume for a ${targetJob || 'professional'} position:

Summary:
${summary}

Experience:
${experienceText}

Skills:
${skills.join(', ')}

Provide detailed feedback in the following categories:
1. Tailored Suggestions - Assess if the resume content aligns well with the target role. If not, suggest specific modifications to better tailor it.
2. Measurable Results - Identify whether achievements include quantifiable metrics (e.g., percentages, revenue impact, KPIs). If missing, suggest adding measurable outcomes.
3. Wording & Readability - Check for clarity, conciseness, and the use of strong action verbs. Recommend sentence improvements with more impactful phrasing.
4. Spelling & Grammar - Identify any spelling, grammar, or punctuation issues and suggest corrections.

For each category, identify specific issues and provide actionable fixes. Format the response as a JSON object with this structure:
{
  "categories": [
    {
      "name": "Category Name",
      "issues": [
        {
          "issue": "Specific issue description",
          "fix": "Detailed suggestion for improvement"
        }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer. Provide detailed, actionable feedback in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No feedback generated');
    }

    const feedback = JSON.parse(response);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate feedback' },
      { status: 500 }
    );
  }
} 