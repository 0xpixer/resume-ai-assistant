'use client';

import React from 'react';
import RichTextEditor from './RichTextEditor';

interface SkillsEditorProps {
  skills: string;
  onChange: (skills: string) => void;
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, onChange }) => {
  return (
    <div className="space-y-2">
      <RichTextEditor
        value={skills}
        onChange={onChange}
        minHeight="120px"
        placeholder="列出您的专业技能，可以按类别组织，例如：编程语言、工具、软技能等..."
        label="技能"
        aiEnabled={true}
      />
    </div>
  );
};

export default SkillsEditor; 