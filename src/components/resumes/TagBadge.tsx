'use client';

import React from 'react';

// Map of tag colors based on tag content
const tagColors: Record<string, { bg: string; text: string }> = {
  // Technical
  technical: { bg: 'bg-blue-100', text: 'text-blue-800' },
  tech: { bg: 'bg-blue-100', text: 'text-blue-800' },
  software: { bg: 'bg-blue-100', text: 'text-blue-800' },
  programming: { bg: 'bg-blue-100', text: 'text-blue-800' },
  developer: { bg: 'bg-blue-100', text: 'text-blue-800' },
  engineering: { bg: 'bg-blue-100', text: 'text-blue-800' },
  
  // Data
  data: { bg: 'bg-purple-100', text: 'text-purple-800' },
  analytics: { bg: 'bg-purple-100', text: 'text-purple-800' },
  analysis: { bg: 'bg-purple-100', text: 'text-purple-800' },
  
  // Design
  design: { bg: 'bg-pink-100', text: 'text-pink-800' },
  creative: { bg: 'bg-pink-100', text: 'text-pink-800' },
  ux: { bg: 'bg-pink-100', text: 'text-pink-800' },
  ui: { bg: 'bg-pink-100', text: 'text-pink-800' },
  
  // Management
  management: { bg: 'bg-amber-100', text: 'text-amber-800' },
  manager: { bg: 'bg-amber-100', text: 'text-amber-800' },
  director: { bg: 'bg-amber-100', text: 'text-amber-800' },
  lead: { bg: 'bg-amber-100', text: 'text-amber-800' },
  senior: { bg: 'bg-amber-100', text: 'text-amber-800' },
  
  // Marketing
  marketing: { bg: 'bg-green-100', text: 'text-green-800' },
  digital: { bg: 'bg-green-100', text: 'text-green-800' },
  content: { bg: 'bg-green-100', text: 'text-green-800' },
  
  // Finance
  finance: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  accounting: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
};

// Default color for tags that don't match any specific category
const defaultTagColor = { bg: 'bg-gray-100', text: 'text-gray-800' };

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag, onRemove }) => {
  // Find a matching color based on tag name or use default
  const getTagColor = (tagName: string) => {
    const normalizedTag = tagName.toLowerCase();
    
    // Check if there's a direct match
    if (tagColors[normalizedTag]) {
      return tagColors[normalizedTag];
    }
    
    // Check if the tag contains any of the keywords
    for (const [keyword, color] of Object.entries(tagColors)) {
      if (normalizedTag.includes(keyword)) {
        return color;
      }
    }
    
    // Return default color if no match is found
    return defaultTagColor;
  };
  
  const { bg, text } = getTagColor(tag);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:bg-gray-200"
        >
          <span className="sr-only">Remove</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default TagBadge; 