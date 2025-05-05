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
import { FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';

interface CollapsibleResumeEditorProps {
  resume: Resume;
  onUpdate: (resume: Resume) => void;
}

interface SectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  hasAddButton?: boolean;
  onAdd?: () => void;
  children: React.ReactNode;
}

const Section = ({ id, title, isOpen, onToggle, hasAddButton, onAdd, children }: SectionProps) => {
  return (
    <div className="mb-6 resume-panel">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold text-[#020202]">{title}</h3>
        <div className="flex items-center">
          {hasAddButton && (
            <button
              type="button"
              className="mr-3 p-1 text-[#eb3d24] hover:text-[#d02e17] rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                if (onAdd) onAdd();
              }}
            >
              <FaPlus size={16} />
            </button>
          )}
          {isOpen ? <FaChevronUp size={16} className="text-[#020202]" /> : <FaChevronDown size={16} className="text-[#020202]" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default function CollapsibleResumeEditor({ resume, onUpdate }: CollapsibleResumeEditorProps) {
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    contact: true,
    summary: true,
    experience: true,
    education: true,
    skills: false,
    projects: false,
    certifications: false,
    languages: false
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleUpdateContact = (value: any) => {
    onUpdate({
      ...resume,
      contactInfo: value
    });
  };

  const handleUpdateSummary = (value: string) => {
    onUpdate({
      ...resume,
      summary: value
    });
  };

  const handleUpdateExperience = (value: any[]) => {
    onUpdate({
      ...resume,
      experience: value
    });
  };

  const handleUpdateEducation = (value: any[]) => {
    onUpdate({
      ...resume,
      education: value
    });
  };

  const handleUpdateSkills = (value: any[]) => {
    onUpdate({
      ...resume,
      skills: value
    });
  };

  const handleUpdateProjects = (value: any[]) => {
    onUpdate({
      ...resume,
      projects: value
    });
  };

  const handleUpdateCertifications = (value: any[]) => {
    onUpdate({
      ...resume,
      certifications: value
    });
  };

  const handleUpdateLanguages = (value: any[]) => {
    onUpdate({
      ...resume,
      languages: value
    });
  };

  return (
    <div className="space-y-2">
      <Section 
        id="contact" 
        title="Contact Information" 
        isOpen={openSections.contact} 
        onToggle={() => toggleSection('contact')}
      >
        <ContactInfoEditor 
          contactInfo={resume.contactInfo} 
          onChange={handleUpdateContact} 
        />
      </Section>

      <Section 
        id="summary" 
        title="Professional Summary" 
        isOpen={openSections.summary} 
        onToggle={() => toggleSection('summary')}
      >
        <SummaryEditor 
          summary={resume.summary || ''} 
          onChange={handleUpdateSummary} 
        />
      </Section>

      <Section 
        id="experience" 
        title="Work Experience" 
        isOpen={openSections.experience} 
        onToggle={() => toggleSection('experience')}
        hasAddButton
        onAdd={() => {
          const newExperience = [
            {
              position: '',
              company: '',
              location: '',
              startDate: '',
              endDate: '',
              achievements: []
            },
            ...resume.experience
          ];
          handleUpdateExperience(newExperience);
        }}
      >
        <ExperienceEditor 
          experience={resume.experience} 
          onChange={handleUpdateExperience} 
        />
      </Section>

      <Section 
        id="education" 
        title="Education" 
        isOpen={openSections.education} 
        onToggle={() => toggleSection('education')}
        hasAddButton
        onAdd={() => {
          const newEducation = [
            {
              institution: '',
              degree: '',
              location: '',
              startDate: '',
              endDate: '',
              gpa: ''
            },
            ...resume.education
          ];
          handleUpdateEducation(newEducation);
        }}
      >
        <EducationEditor 
          education={resume.education} 
          onChange={handleUpdateEducation} 
        />
      </Section>

      <Section 
        id="skills" 
        title="Skills" 
        isOpen={openSections.skills} 
        onToggle={() => toggleSection('skills')}
        hasAddButton
        onAdd={() => {
          const newSkills = [
            { name: '', level: '' },
            ...resume.skills
          ];
          handleUpdateSkills(newSkills);
        }}
      >
        <SkillsEditor 
          skills={resume.skills} 
          onChange={handleUpdateSkills} 
        />
      </Section>

      <Section 
        id="projects" 
        title="Projects" 
        isOpen={openSections.projects} 
        onToggle={() => toggleSection('projects')}
        hasAddButton
        onAdd={() => {
          const newProjects = [
            {
              name: '',
              role: '',
              startDate: '',
              endDate: '',
              description: ''
            },
            ...(resume.projects || [])
          ];
          handleUpdateProjects(newProjects);
        }}
      >
        <ProjectsEditor 
          projects={resume.projects || []} 
          onChange={handleUpdateProjects} 
        />
      </Section>

      <Section 
        id="certifications" 
        title="Certifications" 
        isOpen={openSections.certifications} 
        onToggle={() => toggleSection('certifications')}
        hasAddButton
        onAdd={() => {
          const newCertifications = [
            { name: '', date: '' },
            ...(resume.certifications || [])
          ];
          handleUpdateCertifications(newCertifications);
        }}
      >
        <CertificationsEditor 
          certifications={resume.certifications || []} 
          onChange={handleUpdateCertifications}
        />
      </Section>

      <Section 
        id="languages" 
        title="Languages" 
        isOpen={openSections.languages} 
        onToggle={() => toggleSection('languages')}
        hasAddButton
        onAdd={() => {
          const newLanguages = [
            { name: '', proficiency: '' },
            ...(resume.languages || [])
          ];
          handleUpdateLanguages(newLanguages);
        }}
      >
        <LanguagesEditor 
          languages={resume.languages || []} 
          onChange={handleUpdateLanguages}
        />
      </Section>
    </div>
  );
} 