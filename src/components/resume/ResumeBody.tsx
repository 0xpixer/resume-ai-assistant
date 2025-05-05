import React from 'react';
import { Resume } from '@/types/resume';
import { TemplateStyle } from './ResumeEditablePreview';
import { EditableField } from './EditableField';

interface ResumeBodyProps {
  resume: Resume;
  styles: TemplateStyle;
  onUpdateResume: (updatedResume: Resume | ((prevResume: Resume) => Resume)) => void;
  editing: any;
  setEditing: (editing: any) => void;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch (error) {
    return dateString;
  }
};

export const ResumeBody: React.FC<ResumeBodyProps> = ({
  resume,
  styles,
  onUpdateResume,
  editing,
  setEditing
}) => {
  return (
    <div className="resume-body">
      {/* 专业摘要 */}
      {resume.summary && (
        <div className="resume-block summary-block">
          <h2 
            style={{ 
              backgroundColor: styles.sectionTitleBg, 
              color: styles.sectionTitleText,
              borderBottom: styles.sectionTitleBorder,
              textAlign: styles.headingAlign as any,
              padding: '0.5rem',
              marginBottom: '0.5rem'
            }}
          >
            Professional Summary
          </h2>
          <div 
            style={{ 
              color: styles.primaryColor,
              textAlign: styles.contentAlign as any,
              marginBottom: styles.paragraphSpacing
            }}
          >
            <EditableField 
              value={resume.summary} 
              section="summary" 
              field="summary" 
              multiline={true}
              onUpdateResume={onUpdateResume}
              editing={editing}
              setEditing={setEditing}
            />
          </div>
        </div>
      )}
      
      {/* 工作经验 */}
      <div className="resume-block experience-section-block">
        <h2 
          style={{ 
            backgroundColor: styles.sectionTitleBg, 
            color: styles.sectionTitleText,
            borderBottom: styles.sectionTitleBorder,
            textAlign: styles.headingAlign as any,
            padding: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          Work Experience
        </h2>
        
        {resume.experience.map((exp, index) => (
          <div key={index} className="resume-block experience-item-block" style={{ marginBottom: styles.sectionSpacing }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ color: styles.primaryColor, margin: '0 0 0.25rem 0' }}>
                  <EditableField 
                    value={exp.position} 
                    section="experience" 
                    field="position" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </h3>
                <h4 style={{ color: styles.secondaryColor, margin: '0 0 0.25rem 0', fontWeight: 'normal' }}>
                  <EditableField 
                    value={exp.company} 
                    section="experience" 
                    field="company" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  <EditableField 
                    value={`${formatDate(exp.startDate || '')} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}`} 
                    section="experience" 
                    field="startDate" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  <EditableField 
                    value={exp.location || ''} 
                    section="experience" 
                    field="location" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </div>
              </div>
            </div>
            
            {exp.achievements && exp.achievements.length > 0 && (
              <ul style={{ 
                marginTop: '0.5rem', 
                paddingLeft: styles.showBullets ? '1.5rem' : '0',
                listStyleType: styles.showBullets ? 'disc' : 'none'
              }}>
                {exp.achievements.map((achievement, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>
                    <EditableField 
                      value={achievement} 
                      section="experience" 
                      field={`achievements[${i}]`} 
                      index={index}
                      onUpdateResume={onUpdateResume}
                      editing={editing}
                      setEditing={setEditing}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      
      {/* 教育背景 */}
      <div className="resume-block education-section-block">
        <h2 
          style={{ 
            backgroundColor: styles.sectionTitleBg, 
            color: styles.sectionTitleText,
            borderBottom: styles.sectionTitleBorder,
            textAlign: styles.headingAlign as any,
            padding: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          Education
        </h2>
        
        {resume.education.map((edu, index) => (
          <div key={index} className="resume-block education-item-block" style={{ marginBottom: styles.paragraphSpacing }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ color: styles.primaryColor, margin: '0 0 0.25rem 0' }}>
                  <EditableField 
                    value={edu.degree} 
                    section="education" 
                    field="degree" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </h3>
                <h4 style={{ color: styles.secondaryColor, margin: '0 0 0.25rem 0', fontWeight: 'normal' }}>
                  <EditableField 
                    value={edu.institution} 
                    section="education" 
                    field="institution" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  <EditableField 
                    value={`${formatDate(edu.startDate || '')} - ${edu.endDate ? formatDate(edu.endDate) : 'Present'}`} 
                    section="education" 
                    field="startDate" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  <EditableField 
                    value={edu.location || ''} 
                    section="education" 
                    field="location" 
                    index={index}
                    onUpdateResume={onUpdateResume}
                    editing={editing}
                    setEditing={setEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 技能 */}
      <div className="resume-block skills-section-block">
        <h2 
          style={{ 
            backgroundColor: styles.sectionTitleBg, 
            color: styles.sectionTitleText,
            borderBottom: styles.sectionTitleBorder,
            textAlign: styles.headingAlign as any,
            padding: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          Skills
        </h2>
        
        <div className="skills-container" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          marginBottom: styles.paragraphSpacing
        }}>
          {resume.skills.map((skill, index) => (
            <div key={index} className="skill-item" style={{ 
              padding: '0.25rem 0.5rem', 
              backgroundColor: styles.showBorders ? styles.secondaryColor + '20' : 'transparent',
              border: styles.showBorders ? `1px solid ${styles.secondaryColor}` : 'none',
              borderRadius: '4px'
            }}>
              <EditableField 
                value={skill.name} 
                section="skills" 
                field="name" 
                index={index}
                onUpdateResume={onUpdateResume}
                editing={editing}
                setEditing={setEditing}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 