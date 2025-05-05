import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to detect language
function detectLanguage(text: string): 'en' | 'zh' {
  // Simple detection - if more Chinese characters than Latin, assume Chinese
  const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const latinCharCount = (text.match(/[a-zA-Z]/g) || []).length;
  
  return latinCharCount > chineseCharCount ? 'en' : 'zh';
}

// Prompt templates for different resume sections
const getPromptForSectionType = (sectionType: string, content: string, language: 'en' | 'zh') => {
  // Base templates in English
  const englishTemplates = {
    summary: `
As a professional resume optimization expert, please improve the "Professional Summary" section of the following resume to make it more attractive and targeted.

A professional summary should include:
1. Clear audience targeting
2. Your core years of experience
3. Relevant industry or well-known company experience
4. Core skills and keywords
5. 1-2 significant achievements
6. Total length controlled to about 300-350 characters
7. Use first person and ensure the first sentence captures the reader's attention

Original content:
${content}

Please provide an optimized professional summary that is more professional, more targeted, and more likely to interest recruiters.
IMPORTANT: Maintain the same language (${language === 'en' ? 'English' : 'Chinese'}) as the original content.
`,

    experience: `
As a professional resume optimization expert, please improve the following "Work Experience" description to better highlight achievements rather than responsibilities.

The work experience section should:
1. Highlight your achievements, not just job duties
2. Recent and most relevant work experience should contain 3-5 achievement points
3. Use action verbs in past tense
4. Include keywords and skills relevant to the position
5. Follow the formula "success verb + noun + metric + result"
6. Quantify your achievements using specific numbers

For example:
- "Organized a charity event with 300 participants, raising $500,000"
- "Conducted compliance training for over 100 managers across 5 locations, reducing company costs by 50%"
- "Implemented new payroll and tax accounting systems, saving the company $2 million over 5 years"

Original content:
${content}

Please provide an optimized work experience description that highlights your achievements, uses action verbs, and quantifies results.
IMPORTANT: Maintain the same language (${language === 'en' ? 'English' : 'Chinese'}) as the original content.
`,

    education: `
As a professional resume optimization expert, please improve the following "Education History" section to make it clearer and more relevant.

The education section should:
1. Clearly list degrees, majors, and school names
2. Include graduation years or study periods
3. Highlight relevant courses, projects, and academic achievements
4. If you're a recent graduate, emphasize GPA and academic honors
5. Keep it concise but include information relevant to the target position

Original content:
${content}

Please provide an optimized education history description, ensuring format consistency and professional expression.
IMPORTANT: Maintain the same language (${language === 'en' ? 'English' : 'Chinese'}) as the original content.
`,

    skills: `
As a professional resume optimization expert, please improve the following "Skills" section to make it more targeted and ATS-friendly.

The skills section should:
1. Prioritize skills directly relevant to the target position
2. Include a balance of industry-specific technical skills and soft skills
3. Use keywords common to ATS (Applicant Tracking Systems)
4. Organize skills by category (such as technical skills, soft skills, languages, etc.)
5. Avoid outdated skills unless still relevant
6. Don't use subjective proficiency assessments (like "proficient", "familiar")

Original content:
${content}

Please provide an optimized skills list to increase resume ATS compatibility and highlight the most relevant professional capabilities.
IMPORTANT: Maintain the same language (${language === 'en' ? 'English' : 'Chinese'}) as the original content.
`,

    general: `
As a professional resume optimization expert and ATS system expert, please improve the following resume content to make it more attractive, professional, and ATS-friendly.

Please follow these guidelines:
1. Keep language professional, concise, and persuasive
2. Use industry-relevant keywords, but avoid keyword stuffing
3. Emphasize results and quantified achievements, using numbers to demonstrate impact
4. Use strong action verbs (e.g., "led", "developed", "implemented")
5. Maintain consistent formatting and grammar
6. Remove redundant content and irrelevant information
7. Ensure content meets ATS system search criteria

Original content:
${content}

Please provide optimized content that maintains approximately the same length and structure style as the original, but with improvements in expression and professionalism.
IMPORTANT: Maintain the same language (${language === 'en' ? 'English' : 'Chinese'}) as the original content.
`
  };

  // Select the appropriate template based on section type
  const template = englishTemplates[sectionType as keyof typeof englishTemplates] || englishTemplates.general;
  
  return template;
};

export async function POST(request: Request) {
  try {
    const { content, plainText, sectionType = 'general' } = await request.json();

    if (!plainText || plainText.trim() === "") {
      return NextResponse.json(
        { error: "Please provide text content to optimize" },
        { status: 400 }
      );
    }

    // Detect the language of the input text
    const language = detectLanguage(plainText);
    
    // Get the appropriate prompt based on section type and language
    const prompt = getPromptForSectionType(sectionType, plainText, language);

    // Call OpenAI API
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional resume optimization assistant skilled at enhancing resume content for professionalism and ATS compatibility. You must preserve the original language of the text (${language === 'en' ? 'English' : 'Chinese'}) in your response.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Process the result
    const optimizedText = aiResponse.choices[0]?.message?.content || "";

    // If we have plain text, we need to preserve the original HTML format, only replacing the text content
    // This simple handling only applies to basic scenarios, more complex HTML handling may require an HTML parsing library
    let optimizedContent = content;
    
    if (optimizedText && content.includes(plainText)) {
      // Simple replacement, suitable for simple HTML structures
      optimizedContent = content.replace(plainText, optimizedText);
    } else {
      // If unable to replace, return plain text
      optimizedContent = optimizedText;
    }

    return NextResponse.json({
      optimizedContent,
      success: true
    });
  } catch (error) {
    console.error("Resume optimization API error:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
} 