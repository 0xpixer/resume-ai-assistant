import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Both resume and job description are required' },
        { status: 400 }
      );
    }

    // Prepare the prompt for OpenAI with more detailed instructions
    const prompt = `
      As an expert ATS (Applicant Tracking System) analyzer and resume consultant, carefully analyze the following resume against the job description:

      JOB DESCRIPTION:
      ${jobDescription}

      RESUME:
      ${JSON.stringify(resume)}

      Provide a detailed analysis in the following format:

      1. Calculate a match percentage (0-100) based on:
         - Required skills/qualifications match
         - Experience level alignment
         - Industry relevance
         - Key responsibilities overlap

      2. Identify specific keywords and skills that are:
         - Present in the job description but missing from the resume
         - Critical for the role
         - Would significantly improve the resume's ATS score

      3. Provide actionable suggestions to improve the resume:
         - How to incorporate missing keywords naturally
         - Which experiences to emphasize
         - What achievements to highlight
         - Specific formatting recommendations

      4. List the key strengths that make this candidate suitable:
         - Direct experience matches
         - Transferable skills
         - Relevant achievements
         - Industry knowledge

      Format your response as a JSON object with this exact structure:
      {
        "matchPercentage": number (0-100),
        "missingKeywords": string[] (list of important missing terms),
        "suggestions": string[] (list of specific, actionable improvements),
        "strengths": string[] (list of matching qualifications and relevant strengths)
      }

      Ensure all arrays contain specific, detailed items rather than general statements.
      Focus on actionable insights that will help the candidate improve their match score.
    `;

    // Call OpenAI API with adjusted parameters
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.5, // Reduced for more consistent results
      max_tokens: 1500, // Increased for more detailed analysis
      presence_penalty: 0.3, // Slight penalty for repetition
      frequency_penalty: 0.3, // Slight penalty for repetition
    });

    // Parse the response
    const content = completion.choices[0].message.content;
    let analysis = {};
    
    try {
      analysis = JSON.parse(content || '{}');
      
      // Validate the response structure
      if (!analysis.matchPercentage || !Array.isArray(analysis.missingKeywords) || 
          !Array.isArray(analysis.suggestions) || !Array.isArray(analysis.strengths)) {
        throw new Error('Invalid response format from OpenAI');
      }
      
      // Ensure matchPercentage is within bounds
      analysis.matchPercentage = Math.min(100, Math.max(0, analysis.matchPercentage));
      
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return NextResponse.json(
        { error: 'Failed to parse analysis results' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('ATS check error:', error);
    return NextResponse.json(
      { error: 'Failed to perform ATS check' },
      { status: 500 }
    );
  }
} 