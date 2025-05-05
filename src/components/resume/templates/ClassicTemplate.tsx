'use client';

import React from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';

interface ClassicTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ resume, formatOptions }) => {
  // 获取主色调
  const primaryColor = formatOptions?.primaryColor || '#0c3b5f';
  const secondaryColor = formatOptions?.secondaryColor || '#4a6072';

  // 获取字体大小
  const getFontSize = () => {
    if (!formatOptions) return '1rem';
    switch (formatOptions.fontSize) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      case 'medium':
      default: return '1rem';
    }
  };

  // 获取行间距
  const getLineSpacing = () => {
    if (!formatOptions) return '1.5';
    switch (formatOptions.lineSpacing) {
      case 'small': return '1.3';
      case 'large': return '1.8';
      case 'medium':
      default: return '1.5';
    }
  };

  // 获取段落间距
  const getParagraphSpacing = () => {
    if (!formatOptions) return '1rem';
    switch (formatOptions.paragraphSpacing) {
      case 'small': return '0.5rem';
      case 'large': return '1.5rem';
      case 'medium':
      default: return '1rem';
    }
  };

  // 获取区块间距
  const getSectionSpacing = () => {
    if (!formatOptions) return '1.5rem';
    switch (formatOptions.sectionSpacing) {
      case 'small': return '1rem';
      case 'large': return '2rem';
      case 'medium':
      default: return '1.5rem';
    }
  };

  // 获取标题对齐样式
  const getHeadingAlignClass = () => {
    if (!formatOptions) return 'text-left';
    switch (formatOptions.headingAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left':
      default: return 'text-left';
    }
  };
  
  // 获取内容对齐样式
  const getContentAlignClass = () => {
    if (!formatOptions) return 'text-left';
    switch (formatOptions.contentAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left':
      default: return 'text-left';
    }
  };
  
  // 获取紧凑布局样式
  const getSpacingClass = () => {
    if (!formatOptions || !formatOptions.compactLayout) {
      return 'mb-5';
    }
    return 'mb-3';
  };
  
  // 获取边框样式
  const getBorderClass = () => {
    if (!formatOptions || formatOptions.showBorders) {
      return 'border-b-2';
    }
    return '';
  };

  return (
    <div 
      className="p-8 text-gray-800 h-full flex flex-col"
      style={{
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        backgroundColor: '#ffffff',
        fontFamily: formatOptions?.fontFamily === 'serif' ? 'Georgia, serif' : 
                   formatOptions?.fontFamily === 'mono' ? 'monospace' : 
                   'Helvetica, Arial, sans-serif',
        fontSize: getFontSize(),
        lineHeight: getLineSpacing(),
        '--paragraph-spacing': getParagraphSpacing(),
        '--section-spacing': getSectionSpacing(),
      } as React.CSSProperties}
    >
      {/* 头部: 姓名和联系信息 */}
      <header className="mb-6 pb-4" style={{
        borderBottom: `1px solid ${primaryColor}20`
      }}>
        <h1 className={`text-3xl font-bold mb-3 ${getHeadingAlignClass()}`} style={{ 
          color: 'var(--primary-color)',
          letterSpacing: '0.02em'
        }}>
          {resume.contactInfo?.name || '姓名'}
        </h1>
        
        {resume.contactInfo?.title && (
          <h2 className={`text-xl font-normal mb-4 ${getHeadingAlignClass()}`} style={{ 
            color: 'var(--secondary-color)',
            letterSpacing: '0.01em'
          }}>
            {resume.contactInfo.title}
          </h2>
        )}
        
        <div className={`flex flex-wrap justify-center text-sm gap-4 ${getContentAlignClass()}`}>
          {resume.contactInfo?.email && (
            <div className="flex items-center">
              <FaEnvelope className="mr-2" style={{ color: 'var(--primary-color)' }} />
              <span>{resume.contactInfo.email}</span>
            </div>
          )}
          
          {resume.contactInfo?.phone && (
            <div className="flex items-center">
              <FaPhone className="mr-2" style={{ color: 'var(--primary-color)' }} />
              <span>{resume.contactInfo.phone}</span>
            </div>
          )}
          
          {resume.contactInfo?.location && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2" style={{ color: 'var(--primary-color)' }} />
              <span>{resume.contactInfo.location}</span>
            </div>
          )}
          
          {resume.contactInfo?.website && (
            <div className="flex items-center">
              <FaGlobe className="mr-2" style={{ color: 'var(--primary-color)' }} />
              <span>{resume.contactInfo.website}</span>
            </div>
          )}
          
          {resume.contactInfo?.linkedin && (
            <div className="flex items-center">
              <FaLinkedin className="mr-2" style={{ color: 'var(--primary-color)' }} />
              <span>{resume.contactInfo.linkedin}</span>
            </div>
          )}
          
          {resume.contactInfo?.github && (
            <div className="flex items-center">
              <FaGithub className="mr-2" style={{ color: 'var(--primary-color)' }} />
              <span>{resume.contactInfo.github}</span>
            </div>
          )}
        </div>
      </header>

      {/* 个人简介 */}
      {resume.summary && (
        <section className={getSpacingClass()}>
          <h2 className={`text-lg font-bold ${getBorderClass()} mb-3 pb-1 uppercase tracking-wider ${getHeadingAlignClass()}`} 
            style={{ 
              color: 'var(--primary-color)',
              borderColor: `${primaryColor}50`
            }}>
            Professional Summary
          </h2>
          <p className={`${getContentAlignClass()} leading-relaxed`}>{resume.summary}</p>
        </section>
      )}

      {/* 工作经历 */}
      {resume.experience && resume.experience.length > 0 && (
        <section className={getSpacingClass()}>
          <h2 className={`text-lg font-bold ${getBorderClass()} mb-3 pb-1 uppercase tracking-wider ${getHeadingAlignClass()}`}
            style={{ 
              color: 'var(--primary-color)',
              borderColor: `${primaryColor}50`
            }}>
            Work Experience
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4" style={{
              position: 'relative'
            }}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-base" style={{ color: 'var(--primary-color)' }}>{exp.position}</h3>
                <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <div className="mb-2 text-base" style={{ color: 'var(--secondary-color)' }}>
                <span className="font-medium">{exp.company}</span>
                {exp.location && <span className="ml-2 text-sm">| {exp.location}</span>}
              </div>
              {exp.achievements && exp.achievements.length > 0 && formatOptions?.showBullets && (
                <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
              {exp.achievements && exp.achievements.length > 0 && !formatOptions?.showBullets && (
                <div className="space-y-1 text-sm leading-relaxed">
                  {exp.achievements.map((achievement, idx) => (
                    <p key={idx} className="mb-1">{achievement}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 教育背景 */}
      {resume.education && resume.education.length > 0 && (
        <section className={getSpacingClass()}>
          <h2 className={`text-lg font-bold ${getBorderClass()} mb-3 pb-1 uppercase tracking-wider ${getHeadingAlignClass()}`}
            style={{ 
              color: 'var(--primary-color)',
              borderColor: `${primaryColor}50`
            }}>
            Education
          </h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-base" style={{ color: 'var(--primary-color)' }}>{edu.degree}</h3>
                <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <div className="mb-1" style={{ color: 'var(--secondary-color)' }}>
                <span className="font-medium">{edu.institution}</span>
                {edu.location && <span className="ml-2 text-sm">| {edu.location}</span>}
              </div>
              {edu.field && <div className="text-sm mb-1">Field of Study: {edu.field}</div>}
              {edu.gpa && <div className="text-sm mb-1">GPA: {edu.gpa}</div>}
              {edu.achievements && edu.achievements.length > 0 && formatOptions?.showBullets && (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {edu.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
              {edu.achievements && edu.achievements.length > 0 && !formatOptions?.showBullets && (
                <div className="space-y-1 text-sm">
                  {edu.achievements.map((achievement, idx) => (
                    <p key={idx} className="mb-1">{achievement}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 技能 */}
      {resume.skills && resume.skills.length > 0 && (
        <section className={getSpacingClass()}>
          <h2 className={`text-lg font-bold ${getBorderClass()} mb-3 pb-1 uppercase tracking-wider ${getHeadingAlignClass()}`}
            style={{ 
              color: 'var(--primary-color)',
              borderColor: `${primaryColor}50`
            }}>
            Skills
          </h2>
          <div className={`flex flex-wrap gap-2 ${getContentAlignClass()}`}>
            {resume.skills.map((skill, index) => (
              <span 
                key={index} 
                className="px-3 py-1.5 rounded-sm text-sm"
                style={{ 
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                  border: formatOptions?.showBorders ? `1px solid ${primaryColor}30` : 'none'
                }}
              >
                {skill.name} {skill.level && `(${skill.level}/5)`}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 项目经验 */}
      {resume.projects && resume.projects.length > 0 && (
        <section className={getSpacingClass()}>
          <h2 className={`text-xl font-bold ${getBorderClass()} mb-2 ${getHeadingAlignClass()}`} style={{ color: 'var(--primary-color)' }}>
            项目经验
          </h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <h3 className="font-bold" style={{ color: 'var(--primary-color)' }}>{project.name}</h3>
                {(project.startDate || project.endDate) && (
                  <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                    {project.startDate && project.startDate} 
                    {project.startDate && project.endDate && ' - '} 
                    {project.endDate || '至今'}
                  </span>
                )}
              </div>
              {project.role && (
                <div className="italic mb-1" style={{ color: 'var(--secondary-color)' }}>{project.role}</div>
              )}
              {project.description && <p className="text-sm mb-1">{project.description}</p>}
              {project.technologies && project.technologies.length > 0 && (
                <div className="text-sm mt-1">
                  <span className="font-medium">技术栈: </span>
                  {project.technologies.join(', ')}
                </div>
              )}
              {project.achievements && project.achievements.length > 0 && formatOptions?.showBullets && (
                <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                  {project.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
              {project.achievements && project.achievements.length > 0 && !formatOptions?.showBullets && (
                <div className="space-y-1 text-sm mt-1">
                  {project.achievements.map((achievement, idx) => (
                    <p key={idx}>{achievement}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 证书 */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section className={getSpacingClass()}>
          <h2 className={`text-xl font-bold ${getBorderClass()} mb-2 ${getHeadingAlignClass()}`} style={{ color: 'var(--primary-color)' }}>
            证书
          </h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-bold" style={{ color: 'var(--primary-color)' }}>{cert.name}</h3>
              {cert.issuer && <div className="text-sm">发证机构: {cert.issuer}</div>}
              {cert.date && <div className="text-sm">日期: {cert.date}</div>}
              {cert.description && <p className="text-sm">{cert.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* 语言 */}
      {resume.languages && resume.languages.length > 0 && (
        <section>
          <h2 className={`text-xl font-bold ${getBorderClass()} mb-2 ${getHeadingAlignClass()}`} style={{ color: 'var(--primary-color)' }}>
            语言
          </h2>
          <div className={`flex flex-wrap gap-4 ${getContentAlignClass()}`}>
            {resume.languages.map((lang, index) => (
              <div key={index} className="mb-1">
                <span className="font-medium">{lang.name}</span>
                {lang.proficiency && (
                  <span className="text-sm ml-1" style={{ color: 'var(--secondary-color)' }}>
                    ({lang.proficiency})
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ClassicTemplate; 