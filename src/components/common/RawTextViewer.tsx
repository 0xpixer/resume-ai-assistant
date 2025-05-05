'use client';

import React from 'react';

interface RawTextViewerProps {
  text: string;
  onClear?: () => void;
  title?: string;
}

const RawTextViewer: React.FC<RawTextViewerProps> = ({ 
  text, 
  onClear, 
  title = 'Raw Extracted Text' 
}) => {
  if (!text) return null;
  
  return (
    <div className="mt-4 p-4 border rounded bg-[#fbfbfb]">
      <div className="flex justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>
      <pre className="whitespace-pre-wrap text-xs bg-[#fbfbfb] p-3 border rounded max-h-96 overflow-auto">
        {text || 'No text extracted'}
      </pre>
    </div>
  );
};

export default RawTextViewer; 