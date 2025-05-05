'use client';

import React, { useState, useEffect } from 'react';
import { Resume } from '@/types/resume';
import ATSChecker from './ATSChecker';
import WithSubscription from '../subscription/WithSubscription';
import { FaEdit, FaSpinner, FaTimes } from 'react-icons/fa';

interface ATSCheckerWithSubscriptionProps {
  resume: Resume;
}

/**
 * A wrapper component that adds subscription functionality to ATSChecker
 * Only shows the paywall after a job description has been entered and analyzed
 */
const ATSCheckerWithSubscription: React.FC<ATSCheckerWithSubscriptionProps> = ({
  resume
}) => {
  const [issueCount, setIssueCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode
  const [error, setError] = useState<string | null>(null);

  // Handle analysis when user submits job description
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('请输入职位描述');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get issue count from API
      const response = await fetch('/api/resume/ats-check-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.issueCount !== undefined) {
          setIssueCount(data.issueCount);
        } else {
          setIssueCount(5); // Fallback number if API doesn't return a count
        }
      } else {
        setIssueCount(5); // Fallback number
      }
      
      setHasAnalyzed(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching ATS issue count:', error);
      setIssueCount(5); // Fallback number
      setError('分析时出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            ATS 检查
            <span className="text-xs text-gray-500 ml-1">*</span>
          </h2>
          {hasAnalyzed && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isEditing ? <FaTimes size={16} /> : <FaEdit size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Job Description Input or Analysis Results */}
      {isEditing ? (
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              职位描述
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="请在此粘贴职位描述..."
              className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="w-full bg-[#eb3d24] text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-[#d02e17] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb3d24] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin inline-block mr-2" />
                分析中...
              </>
            ) : (
              '分析简历'
            )}
          </button>

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      ) : hasAnalyzed ? (
        <WithSubscription
          featureKey="ats"
          title="ATS 检查"
          issueCount={issueCount}
          loading={false}
        >
          <ATSChecker resume={resume} initialJobDescription={jobDescription} />
        </WithSubscription>
      ) : (
        <div className="p-4 text-center text-gray-500">
          请输入职位描述以分析您的简历
        </div>
      )}
    </div>
  );
};

export default ATSCheckerWithSubscription; 