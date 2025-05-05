'use client';

import React, { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

interface AIContentGeneratorProps {
  onGenerate: (prompt: string) => Promise<string>;
  onSelect: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export default function AIContentGenerator({
  onGenerate,
  onSelect,
  placeholder = 'Click "Generate" to create AI-powered content',
  buttonText = 'Generate',
  className = ''
}: AIContentGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await onGenerate(prompt);
      setGeneratedContent(content);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('Error generating content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Custom Instructions (Optional)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Add specific requirements or preferences for the AI-generated content"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading && <FiRefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />}
          {buttonText}
        </button>

        {generatedContent && (
          <button
            onClick={() => setGeneratedContent('')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {generatedContent && (
        <div className="relative">
          <div
            className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
            onClick={() => onSelect(generatedContent)}
          >
            {generatedContent}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Click on the generated content to use it
          </p>
        </div>
      )}

      {!generatedContent && !error && (
        <p className="text-sm text-gray-500 italic">
          {placeholder}
        </p>
      )}
    </div>
  );
} 