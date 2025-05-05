'use client';

import { useState, useEffect, useRef } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiLoader } from 'react-icons/fi';
import { ParsedResume, Resume, ExperienceItem } from '@/types/resume';
// 使用我们的兼容层替代next-intl
import { useTranslations } from '@/lib/next-intl-shim';

interface ResumeFeedbackProps {
  resumeData: Resume | {
    structured?: Resume;
    rawText?: string;
    name?: string;
    title?: string;
    summary?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
  };
  targetJob?: string;
  onFeedbackSaved?: (feedback: {
    categories: {
      name: string;
      issues: {
        issue: string;
        fix: string;
      }[];
    }[];
  }) => void;
}

interface FeedbackItem {
  type: 'success' | 'warning' | 'info';
  section: string;
  message: string;
  suggestion?: string;
}

interface AIFeedbackCategory {
  name: string;
  issues: {
    issue: string;
    fix: string;
  }[];
}

export default function ResumeFeedback({ resumeData, targetJob = '', onFeedbackSaved }: ResumeFeedbackProps) {
  const [score, setScore] = useState<number | null>(null);
  const [aiFeedback, setAIFeedback] = useState<AIFeedbackCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<{[key: string]: boolean}>({});
  const [shouldFetchFeedback, setShouldFetchFeedback] = useState(false);
  
  // 使用 ref 来跟踪状态，避免无限渲染循环
  const callbackCalledRef = useRef(false);
  const resumeIdRef = useRef<string | null>(null);
  
  // Toggle expansion of an issue
  const toggleIssue = (categoryIndex: number, issueIndex: number) => {
    const issueKey = `${categoryIndex}-${issueIndex}`;
    setExpandedIssues(prev => ({
      ...prev,
      [issueKey]: !prev[issueKey]
    }));
  };

  // Check if an issue is expanded
  const isIssueExpanded = (categoryIndex: number, issueIndex: number) => {
    const issueKey = `${categoryIndex}-${issueIndex}`;
    return !!expandedIssues[issueKey];
  };
  
  // 第一步：仅在 resumeData 变化时检查是否有保存的反馈数据（同步操作）
  useEffect(() => {
    // 避免在每次渲染时都执行这个逻辑
    if (!resumeData) return;
    
    // 获取当前简历的 ID 或其他唯一标识符
    const currentResumeId = (resumeData as any)._id || JSON.stringify(resumeData).slice(0, 50);
    const isSameResume = currentResumeId && currentResumeId === resumeIdRef.current;
    
    // 如果是同一个简历且已经设置过反馈，则不重复设置
    if (isSameResume && aiFeedback.length > 0) return;
    
    // 更新当前简历 ID
    resumeIdRef.current = currentResumeId;
    
    // 重置回调状态
    callbackCalledRef.current = false;
    
    // 检查是否已有保存的反馈数据
    const resumeWithMetadata = resumeData as any;
    if (resumeWithMetadata.feedback && resumeWithMetadata.feedback.categories) {
      console.log('Using saved feedback data');
      
      // 直接设置已保存的数据（同步操作）
      setAIFeedback(resumeWithMetadata.feedback.categories);
      setScore(calculateScoreFromAIFeedback(resumeWithMetadata.feedback.categories));
      
      // 调用回调
      if (onFeedbackSaved && !callbackCalledRef.current) {
        callbackCalledRef.current = true;
        onFeedbackSaved(resumeWithMetadata.feedback);
      }
    } else {
      // 没有保存的数据，设置标记以触发获取操作
      setShouldFetchFeedback(true);
    }
  }, [resumeData, onFeedbackSaved]);
  
  // 第二步：仅在需要获取反馈时执行异步操作
  useEffect(() => {
    // 仅在标记为 true 且尚未加载时执行
    if (!shouldFetchFeedback || loading || !resumeData) return;
    
    // 重置标记，避免重复执行
    setShouldFetchFeedback(false);
    
    // 异步获取反馈
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/resume/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume: resumeData,
            targetJob,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch AI feedback');
        }

        if (!data.categories || !Array.isArray(data.categories)) {
          throw new Error('Invalid feedback data received');
        }

        // 设置 UI 数据
        setAIFeedback(data.categories);
        setScore(calculateScoreFromAIFeedback(data.categories));
        
        // 准备要保存的反馈数据
        const feedbackToSave = {
          categories: data.categories
        };
        
        // 保存到简历
        const resumeWithMetadata = resumeData as any;
        if (resumeWithMetadata.id) {
          await saveFeedbackToAPI(resumeWithMetadata, feedbackToSave);
        }
        
        // 调用回调
        if (onFeedbackSaved && !callbackCalledRef.current) {
          callbackCalledRef.current = true;
          onFeedbackSaved(feedbackToSave);
        }
      } catch (e) {
        console.error('Error fetching feedback:', e);
        setError(e instanceof Error ? e.message : 'Failed to generate feedback');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [shouldFetchFeedback, loading, resumeData, targetJob, onFeedbackSaved]);
  
  // 保存反馈数据到API
  const saveFeedbackToAPI = async (resumeWithMetadata: any, feedbackData: any) => {
    try {
      const updateData = {
        name: resumeWithMetadata.name || 'Resume',
        resume: {
          ...resumeWithMetadata,
          feedback: feedbackData
        }
      };
      
      const response = await fetch(`/api/resumes/${resumeWithMetadata.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        console.log('Feedback saved to resume via API');
      }
    } catch (error) {
      console.error('Error saving feedback to resume:', error);
    }
  };

  // Calculate score based on AI feedback
  const calculateScoreFromAIFeedback = (categories: AIFeedbackCategory[]): number => {
    let totalIssues = 0;
    let criticalIssues = 0;

    categories.forEach(category => {
      totalIssues += category.issues.length;
      // Count critical issues (based on keywords)
      category.issues.forEach(issue => {
        if (
          issue.issue.toLowerCase().includes('missing') ||
          issue.issue.toLowerCase().includes('weak') ||
          issue.issue.toLowerCase().includes('lack') ||
          issue.issue.toLowerCase().includes('no ') ||
          issue.issue.toLowerCase().includes('incorrect')
        ) {
          criticalIssues++;
        }
      });
    });

    // Base score 100, deduct points for each issue, more for critical issues
    const baseScore = 100;
    const regularDeduction = 5;
    const criticalDeduction = 10;

    const score = baseScore - 
      (totalIssues - criticalIssues) * regularDeduction - 
      criticalIssues * criticalDeduction;

    return Math.max(0, Math.min(100, score));
  };

  const generateFeedback = (data: ResumeFeedbackProps['resumeData']) => {
    const feedbackItems: FeedbackItem[] = [];
    let score = 0;
    
    let structured: Resume | undefined;
    
    if ('structured' in data && data.structured) {
      structured = data.structured;
    } else if (!('structured' in data)) {
      structured = data as Resume;
    }
    
    if (!structured) {
      return [{
        type: 'warning',
        section: 'General',
        message: 'Unable to load resume data'
      }];
    }

    // 1. Tailored Content Analysis
    const hasTargetedSummary = structured.summary?.toLowerCase().includes(targetJob?.toLowerCase() || '');
    if (hasTargetedSummary) {
      score += 10;
      feedbackItems.push({
        type: 'success',
        section: 'Tailored Content',
        message: 'Summary is well-aligned with target role'
      });
    } else {
      feedbackItems.push({
        type: 'warning',
        section: 'Tailored Content',
        message: 'Summary could be more targeted',
        suggestion: 'Customize your summary to align with the specific role you\'re applying for'
      });
    }

    // 2. Measurable Results Check
    let measurableResultsCount = 0;
    let totalAchievements = 0;
    structured.experience.forEach(exp => {
      exp.achievements.forEach(achievement => {
        totalAchievements++;
        if (/\d+%|\$\d+|increased|decreased|improved|reduced|generated|saved|managed|led \d+|team of \d+/i.test(achievement)) {
          measurableResultsCount++;
        }
      });
    });

    const measurableResultsRatio = totalAchievements > 0 ? measurableResultsCount / totalAchievements : 0;
    if (measurableResultsRatio >= 0.5) {
      score += 15;
      feedbackItems.push({
        type: 'success',
        section: 'Measurable Results',
        message: 'Strong quantifiable achievements'
      });
    } else {
      feedbackItems.push({
        type: 'warning',
        section: 'Measurable Results',
        message: 'Limited quantifiable achievements',
        suggestion: 'Add more specific numbers, percentages, and metrics to demonstrate your impact'
      });
    }

    // 3. Action Verbs Analysis
    const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 'analyzed', 'improved', 'increased', 'decreased'];
    let actionVerbCount = 0;
    structured.experience.forEach(exp => {
      exp.achievements.forEach(achievement => {
        if (actionVerbs.some(verb => achievement.toLowerCase().startsWith(verb))) {
          actionVerbCount++;
        }
      });
    });

    if (actionVerbCount >= totalAchievements * 0.7) {
      score += 10;
      feedbackItems.push({
        type: 'success',
        section: 'Wording & Readability',
        message: 'Strong action verbs usage'
      });
    } else {
      feedbackItems.push({
        type: 'info',
        section: 'Wording & Readability',
        message: 'Could use more action verbs',
        suggestion: 'Start achievement statements with strong action verbs'
      });
    }

    // 4. Length and Conciseness
    const totalWords = structured.experience.reduce((acc, exp) => {
      return acc + exp.achievements.reduce((sum, achievement) => sum + achievement.split(' ').length, 0);
    }, 0);

    const averageWordsPerAchievement = totalWords / totalAchievements;
    if (averageWordsPerAchievement > 20) {
      feedbackItems.push({
        type: 'warning',
        section: 'Conciseness',
        message: 'Achievement statements are too long',
        suggestion: 'Keep achievement statements concise (12-15 words) while maintaining impact'
      });
    } else if (averageWordsPerAchievement < 8) {
      feedbackItems.push({
        type: 'warning',
        section: 'Detail Level',
        message: 'Achievement statements are too brief',
        suggestion: 'Provide more detail in your achievements while staying concise'
      });
    } else {
      score += 10;
      feedbackItems.push({
        type: 'success',
        section: 'Content Balance',
        message: 'Good balance of detail and conciseness'
      });
    }

    // 5. Skills Relevance
    if (targetJob) {
      const relevantSkills = analyzeKeywordMatches(data, targetJob);
      const relevanceScore = (relevantSkills.length / structured.skills.length) * 100;
      
      if (relevanceScore >= 70) {
        score += 15;
        feedbackItems.push({
          type: 'success',
          section: 'Skills Relevance',
          message: 'Skills well-aligned with target role'
        });
      } else {
        feedbackItems.push({
          type: 'info',
          section: 'Skills Relevance',
          message: 'Skills could be better aligned',
          suggestion: 'Highlight skills that are most relevant to the target position'
        });
      }
    }

    // 6. Grammar and Formatting Check (Basic)
    const commonErrors = [
      'i ', ' i ', 'doesnt', 'dont', 'cant', 'wont', 'shouldnt',
      'responsible for', 'duties include', 'worked with'
    ];

    let grammarIssues = false;
    structured.experience.forEach(exp => {
      exp.achievements.forEach(achievement => {
        if (commonErrors.some(error => achievement.toLowerCase().includes(error))) {
          grammarIssues = true;
        }
      });
    });

    if (grammarIssues) {
      feedbackItems.push({
        type: 'warning',
        section: 'Grammar & Style',
        message: 'Potential grammar or style issues detected',
        suggestion: 'Review for common grammar issues and avoid weak phrases'
      });
    } else {
      score += 10;
      feedbackItems.push({
        type: 'success',
        section: 'Grammar & Style',
        message: 'No common grammar issues detected'
      });
    }

    // Add basic contact info checks from existing code
    const contactInfo = structured.contactInfo;
    if (contactInfo.email) {
      score += 5;
      feedbackItems.push({
        type: 'success',
        section: 'Contact Information',
        message: 'Email address included'
      });
    }
    
    if (contactInfo.phone) {
      score += 5;
      feedbackItems.push({
        type: 'success',
        section: 'Contact Information',
        message: 'Phone number included'
      });
    }

    return feedbackItems;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#333333]';
    if (score >= 60) return 'text-[#f59e0b]';
    return 'text-[#020202]';
  };

  // Analyze keyword matches
  const analyzeKeywordMatches = (data: ResumeFeedbackProps['resumeData'], job: string): string[] => {
    // Job-related keywords (in a real application, could use a more sophisticated industry keyword database)
    const jobKeywords: Record<string, string[]> = {
      'developer': ['javascript', 'react', 'node', 'web', 'frontend', 'developer', 'programmer', 'html', 'css'],
      'designer': ['ui', 'ux', 'design', 'figma', 'sketch', 'adobe', 'user experience', 'interaction'],
      'manager': ['management', 'leadership', 'team', 'leadership', 'strategy', 'decision-making', 'project management'],
      'data': ['data', 'analysis', 'python', 'sql', 'statistics', 'visualization', 'machine learning', 'ai']
    };
    
    // Extract keywords from target job
    const lowerJob = job.toLowerCase();
    let relevantKeywords: string[] = [];
    
    // Add default keywords for target job
    Object.entries(jobKeywords).forEach(([key, words]) => {
      if (lowerJob.includes(key)) {
        relevantKeywords = [...relevantKeywords, ...words];
      }
    });
    
    // If no matching job type found, use general keywords
    if (relevantKeywords.length === 0) {
      relevantKeywords = ['professional', 'experience', 'skills', 'communication', 'team', 'project', 'achievement'];
    }
    
    // Keywords included in the resume
    let resumeText = '';
    
    if ('structured' in data && data.structured) {
      const structured = data.structured;
      resumeText = [
        structured.summary,
        ...(structured.experience?.map(e => `${e.company} ${e.position} ${e.achievements?.join(' ')}`) || []),
        ...(structured.skills?.map(s => typeof s === 'string' ? s : s.name) || []),
      ].join(' ').toLowerCase();
    } else if ('rawText' in data && data.rawText) {
      resumeText = data.rawText.toLowerCase();
    } else {
      // Assume it's a direct Resume object
      const resume = data as Resume;
      resumeText = [
        resume.summary,
        ...resume.experience.map(e => `${e.company} ${e.position} ${e.achievements.join(' ')}`),
        ...resume.skills.map(s => s.name),
      ].join(' ').toLowerCase();
    }
    
    // Return matching keywords
    return relevantKeywords.filter(word => resumeText.includes(word));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <FiLoader className="w-8 h-8 text-[#eb3d24] animate-spin mb-4" />
        <p className="text-slate-600">Analyzing your resume...</p>
      </div>
    );
  }

  return (
    <div className="resume-panel">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className="mb-6 text-center py-4 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">Resume Score</div>
            <div className={`text-4xl font-bold ${score && score >= 80 ? 'text-[#eb3d24]' : score && score >= 60 ? 'text-[#f59e0b]' : 'text-[#020202]'}`}>
              {score !== null ? score.toFixed(0) : 'Analyzing...'}
            </div>
            <div className="text-slate-500 text-sm">/100</div>
          </div>

          <div className="space-y-5 px-4 pb-4">
            {aiFeedback.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                <h3 className="text-md font-semibold text-[#020202] mb-3 flex items-center">
                  {category.name}
                  <span className="text-xs ml-2 bg-[#333333] px-2 py-1 rounded-full text-[#f7f7f7]">{category.issues.length} {category.issues.length === 1 ? 'issue' : 'issues'}</span>
                </h3>
                <div className="space-y-3">
                  {category.issues.map((issue, issueIndex) => {
                    // Determine feedback type color and icon
                    let Icon = FiAlertCircle;
                    
                    // Adjust style based on category name
                    switch(category.name) {
                      case "Tailored Suggestions":
                        Icon = FiInfo;
                        break;
                      case "Measurable Results":
                        Icon = FiAlertCircle;
                        break;
                      case "Wording & Readability":
                        Icon = FiInfo;
                        break;
                      case "Spelling & Grammar":
                        Icon = FiAlertCircle;
                        break;
                    }
                    
                    const expanded = isIssueExpanded(categoryIndex, issueIndex);
                    
                    return (
                      <div 
                        key={issueIndex}
                        className={`resume-feedback-item ${expanded ? 'resume-feedback-item-expanded' : 'resume-feedback-item-collapsed'}`}
                      >
                        <div 
                          className="p-3 flex items-start cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleIssue(categoryIndex, issueIndex)}
                        >
                          <Icon className={`w-5 h-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0`} />
                          <div className="w-full">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-sm text-gray-800 pr-4">{issue.issue}</p>
                              <div className="flex items-center ml-2">
                                <div className={`w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="p-3 pt-0 border-t border-gray-200 mx-3 mt-1">
                            <div className="text-xs font-medium uppercase text-gray-500 mb-2 mt-2">Suggested Improvements:</div>
                            <div className="text-sm">
                              {issue.fix.split('. ').filter(point => point.trim()).map((point, i) => (
                                <div key={i} className="flex items-start mb-2 last:mb-0">
                                  <span className="mr-2 text-gray-500 flex-shrink-0 font-bold">•</span>
                                  <p className="text-gray-700">{point.trim().endsWith('.') ? point.trim() : `${point.trim()}.`}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 