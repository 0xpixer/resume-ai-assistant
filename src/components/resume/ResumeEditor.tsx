'use client';

import { useState } from 'react';
import { Resume } from '@/types/resume';
import ContactInfoEditor from './sections/ContactInfoEditor';
import SummaryEditor from './sections/SummaryEditor';
import ExperienceEditor from './sections/ExperienceEditor';
import EducationEditor from './sections/EducationEditor';
import SkillsEditor from './sections/SkillsEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import CertificationsEditor from './sections/CertificationsEditor';
import LanguagesEditor from './sections/LanguagesEditor';
import InterestsEditor from './sections/InterestsEditor';

interface ResumeEditorProps {
  resume: Resume;
  resumeData?: Resume;
  onUpdate: (resume: Resume) => void;
  onDataChange?: (data: Resume) => void;
  targetJob?: string;
  onTargetJobChange?: (job: string) => void;
}

const sections = [
  { id: 'contact', label: 'Contact Information' },
  { id: 'summary', label: 'Professional Summary' },
  { id: 'experience', label: 'Work Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'languages', label: 'Languages' },
  { id: 'interests', label: 'Interests' }
];

export default function ResumeEditor({ 
  resume, 
  resumeData,
  onUpdate,
  onDataChange,
  targetJob = '',
  onTargetJobChange
}: ResumeEditorProps) {
  const [activeSection, setActiveSection] = useState('contact');
  
  // 使用传入的resumeData或者resume
  const data = resumeData || resume;
  
  // 处理数据更新
  const handleUpdate = (updatedResume: Resume) => {
    if (onDataChange) {
      onDataChange(updatedResume);
    } else if (onUpdate) {
      onUpdate(updatedResume);
    }
  };

  // 处理目标职位变更
  const handleTargetJobChange = (job: string) => {
    if (onTargetJobChange) {
      onTargetJobChange(job);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-64 flex-shrink-0">
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeSection === section.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-6">
          {activeSection === 'contact' && (
            <ContactInfoEditor
              contactInfo={data.contactInfo}
              onChange={(value) => handleUpdate({
                ...data,
                contactInfo: value
              })}
            />
          )}
          {activeSection === 'summary' && (
            <SummaryEditor
              summary={data.summary || ''}
              onChange={(value) => handleUpdate({
                ...data,
                summary: value
              })}
            />
          )}
          {activeSection === 'experience' && (
            <ExperienceEditor
              experience={data.experience}
              onChange={(value) => handleUpdate({
                ...data,
                experience: value
              })}
            />
          )}
          {activeSection === 'education' && (
            <EducationEditor
              education={data.education}
              onChange={(value) => handleUpdate({
                ...data,
                education: value
              })}
            />
          )}
          {activeSection === 'skills' && (
            <SkillsEditor
              skills={data.skills}
              onChange={(value) => handleUpdate({
                ...data,
                skills: value
              })}
            />
          )}
          {activeSection === 'projects' && (
            <ProjectsEditor
              projects={data.projects || []}
              onChange={(value) => handleUpdate({
                ...data,
                projects: value
              })}
            />
          )}
          {activeSection === 'certifications' && (
            <CertificationsEditor
              certifications={data.certifications || []}
              onChange={(value) => handleUpdate({
                ...data,
                certifications: value
              })}
            />
          )}
          {activeSection === 'languages' && (
            <LanguagesEditor
              languages={data.languages || []}
              onChange={(value) => handleUpdate({
                ...data,
                languages: value
              })}
            />
          )}
          {activeSection === 'interests' && (
            <InterestsEditor
              interests={data.interests || []}
              onChange={(value) => handleUpdate({
                ...data,
                interests: value
              })}
            />
          )}
        </div>
      </div>
    </div>
  );
} 