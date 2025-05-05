import React from 'react';
import { Resume } from '@/types/resume';
import { TemplateStyle } from './ResumeEditablePreview';
import { EditableField } from './EditableField';

interface ResumeHeaderProps {
  resume: Resume;
  styles: TemplateStyle;
  onUpdateResume: (updatedResume: Resume | ((prevResume: Resume) => Resume)) => void;
  editing: any;
  setEditing: (editing: any) => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({
  resume,
  styles,
  onUpdateResume,
  editing,
  setEditing
}) => {
  return (
    <div className="resume-header mb-4">
      <div
        style={{ 
          backgroundColor: styles.headerBg, 
          color: styles.headerText,
          borderBottom: styles.headerBorder,
          textAlign: styles.headingAlign as any,
          marginBottom: styles.sectionSpacing,
        }}
        className="py-4 px-3 rounded-t-md"
      >
        <h1 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          <EditableField
            value={resume.contactInfo.name}
            section="contactInfo"
            field="name"
            editing={editing}
            setEditing={setEditing}
            onUpdateResume={onUpdateResume}
            resume={resume}
          />
        </h1>
        {resume.contactInfo.title && (
          <div style={{ marginBottom: '0.5rem', color: styles.secondaryColor }}>
            <EditableField
              value={resume.contactInfo.title}
              section="contactInfo"
              field="title"
              editing={editing}
              setEditing={setEditing}
              onUpdateResume={onUpdateResume}
              resume={resume}
            />
          </div>
        )}
        <div style={{ fontSize: '0.9em' }}>
          <EditableField
            value={resume.contactInfo.email || ''}
            section="contactInfo"
            field="email"
            editing={editing}
            setEditing={setEditing}
            onUpdateResume={onUpdateResume}
            resume={resume}
          />
          {resume.contactInfo.phone && (
            <span> • <EditableField
              value={resume.contactInfo.phone}
              section="contactInfo"
              field="phone"
              className="inline-block"
              editing={editing}
              setEditing={setEditing}
              onUpdateResume={onUpdateResume}
              resume={resume}
            /></span>
          )}
          {resume.contactInfo.location && (
            <span> • <EditableField
              value={resume.contactInfo.location}
              section="contactInfo"
              field="location"
              className="inline-block"
              editing={editing}
              setEditing={setEditing}
              onUpdateResume={onUpdateResume}
              resume={resume}
            /></span>
          )}
        </div>
      </div>
    </div>
  );
}; 