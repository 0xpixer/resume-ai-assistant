import React, { useState, useEffect } from 'react';
import { Resume } from '@/types/resume';
import { FaStar, FaSpinner, FaTimes } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';

interface ATSCheckerProps {
  resume: Resume;
  initialJobDescription?: string;
}

interface ATSAnalysis {
  matchPercentage: number;
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
}

const ATSChecker: React.FC<ATSCheckerProps> = ({ resume, initialJobDescription = '' }) => {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 如果有初始职位描述，自动进行分析
  useEffect(() => {
    if (initialJobDescription && !analysis) {
      handleAnalyze();
    }
  }, [initialJobDescription]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('请输入职位描述');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/resume/ats-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '分析简历失败');
      }

      setAnalysis(data.analysis);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析简历失败');
    } finally {
      setIsAnalyzing(false);
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
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isEditing ? <FaTimes size={16} /> : <MdEdit size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Job Description Input */}
        {isEditing ? (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                职位描述
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="在此粘贴职位描述..."
                className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isAnalyzing}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="w-full bg-blue-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
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
        ) : (
          <div className="p-4">
            {!analysis ? (
              <div className="text-center text-gray-500 py-8">
                <p>您的简历需要与职位描述进行匹配分析。</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  添加职位描述
                </button>
              </div>
            ) : (
              <>
                {/* Match Score */}
                <div className="mb-6">
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                        analysis.matchPercentage >= 70 ? 'bg-green-500' :
                        analysis.matchPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysis.matchPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium">
                      {analysis.matchPercentage}% 匹配度
                    </span>
                    <FaStar className={`${
                      analysis.matchPercentage >= 70 ? 'text-green-500' :
                      analysis.matchPercentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    您的简历需要更好地针对此职位进行定制。
                  </p>
                </div>

                {/* Resume Tailoring Tips */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium">简历定制建议</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      编辑职位描述
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    针对您理想职位定制简历的建议
                  </p>
                  
                  {/* Missing Keywords */}
                  {analysis.missingKeywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium mb-2">缺失的关键词：</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.missingKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-block bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full border border-red-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analysis.suggestions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium mb-2">建议：</h4>
                      <ul className="text-xs space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start bg-blue-50 p-2 rounded">
                            <span className="mr-2 text-blue-500">•</span>
                            <span className="text-gray-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium mb-2">您的优势：</h4>
                      <ul className="text-xs space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start bg-green-50 p-2 rounded">
                            <span className="mr-2 text-green-500">✓</span>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSChecker; 