'use client';

import React, { useState, useEffect } from 'react';
import { Resume } from '@/types/resume';
import ResumeFeedback from './ResumeFeedback';
import WithSubscription from '../subscription/WithSubscription';

interface ResumeFeedbackWithSubscriptionProps {
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

/**
 * A wrapper component that adds subscription functionality to ResumeFeedback
 */
const ResumeFeedbackWithSubscription: React.FC<ResumeFeedbackWithSubscriptionProps> = ({
  resumeData,
  targetJob,
  onFeedbackSaved
}) => {
  const [issueCount, setIssueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Extract issue count from the feedback if available
  useEffect(() => {
    setLoading(true);
    if (resumeData) {
      const resumeWithMetadata = resumeData as any;
      if (resumeWithMetadata.feedback && resumeWithMetadata.feedback.categories) {
        // Calculate total issues from the feedback
        const totalIssues = resumeWithMetadata.feedback.categories.reduce(
          (total: number, category: { issues: any[] }) => total + category.issues.length,
          0
        );
        setIssueCount(totalIssues);
        setLoading(false);
      } else {
        // If no feedback data, use an API call to get a count only
        // This is an optimization to avoid fetching full data for non-subscribers
        const getIssueCount = async () => {
          try {
            const response = await fetch('/api/resume/feedback-count', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                resume: resumeData,
                targetJob,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.issueCount !== undefined) {
                setIssueCount(data.issueCount);
              } else {
                setIssueCount(10); // Fallback number if API doesn't return a count
              }
            } else {
              setIssueCount(10); // Fallback number
            }
          } catch (error) {
            console.error('Error fetching issue count:', error);
            setIssueCount(10); // Fallback number
          } finally {
            setLoading(false);
          }
        };

        getIssueCount();
      }
    }
  }, [resumeData, targetJob]);

  // Handle the feedback saved callback to update the issue count
  const handleFeedbackSaved = (feedback: any) => {
    if (feedback && feedback.categories) {
      const totalIssues = feedback.categories.reduce(
        (total: number, category: { issues: any[] }) => total + category.issues.length,
        0
      );
      setIssueCount(totalIssues);
    }

    // Pass the feedback to the parent component if needed
    if (onFeedbackSaved) {
      onFeedbackSaved(feedback);
    }
  };

  return (
    <WithSubscription
      featureKey="feedback"
      title="Resume Feedback"
      issueCount={issueCount}
      loading={loading}
    >
      <ResumeFeedback
        resumeData={resumeData}
        targetJob={targetJob}
        onFeedbackSaved={handleFeedbackSaved}
      />
    </WithSubscription>
  );
};

export default ResumeFeedbackWithSubscription; 