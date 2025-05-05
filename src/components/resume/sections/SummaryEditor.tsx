'use client';

import React from 'react';
import RichTextEditor from '../RichTextEditor';

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
        placeholder="Describe your professional background, core competencies, and career objectives..."
        aiEnabled={true}
        sectionType="summary"
      />
    </div>
  );
};

export default SummaryEditor; 