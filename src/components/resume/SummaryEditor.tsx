'use client';

import React from 'react';
import RichTextEditor from './RichTextEditor';

interface SummaryEditorProps {
  summary: string;
  onChange: (summary: string) => void;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({ summary, onChange }) => {
  return (
    <div className="space-y-2">
      <RichTextEditor
        value={summary}
        onChange={onChange}
        minHeight="150px"
        placeholder="描述您的专业背景、核心竞争力和职业目标..."
        label="专业摘要"
        aiEnabled={true}
      />
    </div>
  );
};

export default SummaryEditor; 