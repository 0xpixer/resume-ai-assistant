'use client';

import React from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';

interface MinimalTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ resume, formatOptions }) => {
  // 获取主色调
  const primaryColor = formatOptions?.primaryColor || '#333333';
  const secondaryColor = formatOptions?.secondaryColor || '#777777';
  
  // 获取字体
  const getFontFamily = () => {
    if (!formatOptions) return 'Helvetica, Arial, sans-serif';
    
    switch (formatOptions.fontFamily) {
      case 'serif': return 'Georgia, "Times New Roman", serif';
      case 'mono': return '"Courier New", monospace';
      case 'sans':
      default: return 'Helvetica, Arial, sans-serif';
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
  
  // 获取间距类
  const getSpacingClass = () => {
    if (!formatOptions || !formatOptions.compactLayout) {
      return 'mb-7';
    }
    return 'mb-4';
  };

  return (
    <div 
      className="p-6 sm:p-8 text-gray-800 h-full flex flex-col"
      style={{
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        fontFamily: getFontFamily(),
        backgroundColor: '#ffffff',
        color: '#333333',
        lineHeight: formatOptions?.lineSpacing === 'small' ? '1.3' : 
                   formatOptions?.lineSpacing === 'large' ? '1.8' : '1.5',
      } as React.CSSProperties}
    >
      {/* 头部: 姓名和联系信息 */}
      <header className="mb-8 pb-0">
        <div className={`${getHeadingAlignClass()}`}>
          <h1 className="text-3xl font-light tracking-wide mb-1" style={{ 
            color: primaryColor,
            letterSpacing: '0.05em',
          }}>
            {resume.contactInfo?.name || '姓名'}
          </h1>
          
          {resume.contactInfo?.title && (
            <h2 className="text-lg font-light mb-4" style={{ 
              color: secondaryColor,
              letterSpacing: '0.03em'
            }}>
              {resume.contactInfo.title}
            </h2>
          )}
        </div>
        
        <div className={`flex flex-wrap ${getHeadingAlignClass() === 'text-center' ? 'justify-center' : 
                                         getHeadingAlignClass() === 'text-right' ? 'justify-end' : 
                                         'justify-start'} 
                          gap-x-6 gap-y-1 mt-3 text-sm`}>
          {resume.contactInfo?.email && (
            <div className="flex items-center">
              <FaEnvelope className="mr-1.5 text-xs" style={{ color: secondaryColor }} />
              <span>{resume.contactInfo.email}</span>
            </div>
          )}
          
          {resume.contactInfo?.phone && (
            <div className="flex items-center">
              <FaPhone className="mr-1.5 text-xs" style={{ color: secondaryColor }} />
              <span>{resume.contactInfo.phone}</span>
            </div>
          )}
          
          {resume.contactInfo?.location && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-1.5 text-xs" style={{ color: secondaryColor }} />
              <span>{resume.contactInfo.location}</span>
            </div>
          )}
          
          {resume.contactInfo?.website && (
            <div className="flex items-center">
              <FaGlobe className="mr-1.5 text-xs" style={{ color: secondaryColor }} />
              <span>{resume.contactInfo.website}</span>
            </div>
          )}
          
          {resume.contactInfo?.linkedin && (
            <div className="flex items-center">
              <FaLinkedin className="mr-1.5 text-xs" style={{ color: secondaryColor }} />
              <span>{resume.contactInfo.linkedin}</span>
            </div>
          )}
          
          {resume.contactInfo?.github && (
            <div className="flex items-center">
              <FaGithub className="mr-1.5 text-xs" style={{ color: secondaryColor }} />
              <span>{resume.contactInfo.github}</span>
            </div>
          )}
        </div>
        
        {formatOptions?.showBorders && (
          <div className="w-full mt-5" style={{
            height: '1px',
            backgroundColor: `${primaryColor}20`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              width: '20%',
              height: '2px',
              backgroundColor: primaryColor,
              left: getHeadingAlignClass() === 'text-center' ? '40%' : 
                   getHeadingAlignClass() === 'text-right' ? '80%' : '0',
              top: '-0.5px'
            }}></div>
          </div>
        )}
      </header>

      {/* 简历内容区域 */}
      <div className="flex-1 mx-auto w-full max-w-4xl">
        {/* 个人简介 */}
        {resume.summary && (
          <section className={getSpacingClass()}>
            <h2 className={`text-lg font-normal mb-3 uppercase tracking-widest ${getHeadingAlignClass()}`} style={{ 
              color: primaryColor,
            }}>
              Profile
            </h2>
            <p className={`leading-relaxed ${getContentAlignClass()}`} style={{
              fontSize: formatOptions?.fontSize === 'small' ? '0.9rem' : 
                       formatOptions?.fontSize === 'large' ? '1.1rem' : '1rem',
            }}>
              {resume.summary}
            </p>
          </section>
        )}

        {/* 工作经历 */}
        {resume.experience && resume.experience.length > 0 && (
          <section className={getSpacingClass()}>
            <h2 className={`text-lg font-normal mb-3 uppercase tracking-widest ${getHeadingAlignClass()}`} style={{ 
              color: primaryColor,
            }}>
              Experience
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h3 className="font-medium" style={{ color: primaryColor }}>{exp.position}</h3>
                    <span className="text-sm" style={{ color: secondaryColor }}>
                      {exp.startDate} — {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-sm mb-1.5" style={{ color: secondaryColor }}>
                    {exp.company}{exp.location && `, ${exp.location}`}
                  </div>
                  {exp.achievements && exp.achievements.length > 0 && formatOptions?.showBullets && (
                    <ul className={`list-disc pl-5 text-sm space-y-1 ${getContentAlignClass()}`}>
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && !formatOptions?.showBullets && (
                    <div className={`text-sm space-y-1.5 ${getContentAlignClass()}`}>
                      {exp.achievements.map((achievement, idx) => (
                        <p key={idx}>{achievement}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 教育背景 */}
        {resume.education && resume.education.length > 0 && (
          <section className={getSpacingClass()}>
            <h2 className={`text-lg font-normal mb-3 uppercase tracking-widest ${getHeadingAlignClass()}`} style={{ 
              color: primaryColor,
            }}>
              Education
            </h2>
            <div className="space-y-3">
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h3 className="font-medium" style={{ color: primaryColor }}>{edu.degree}</h3>
                    <span className="text-sm" style={{ color: secondaryColor }}>
                      {edu.startDate} — {edu.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-sm mb-1" style={{ color: secondaryColor }}>
                    {edu.institution}{edu.location && `, ${edu.location}`}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {edu.field && <span>{edu.field}</span>}
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                  {edu.achievements && edu.achievements.length > 0 && formatOptions?.showBullets && (
                    <ul className={`list-disc pl-5 text-sm space-y-1 mt-2 ${getContentAlignClass()}`}>
                      {edu.achievements.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                  {edu.achievements && edu.achievements.length > 0 && !formatOptions?.showBullets && (
                    <div className={`text-sm space-y-1.5 mt-2 ${getContentAlignClass()}`}>
                      {edu.achievements.map((achievement, idx) => (
                        <p key={idx}>{achievement}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 技能部分 - 使用极简样式 */}
        {resume.skills && resume.skills.length > 0 && (
          <section className={getSpacingClass()}>
            <h2 className={`text-lg font-normal mb-3 uppercase tracking-widest ${getHeadingAlignClass()}`} style={{ 
              color: primaryColor,
            }}>
              Skills
            </h2>
            <div className={`flex flex-wrap gap-4 ${getContentAlignClass() === 'text-center' ? 'justify-center' : 
                                                  getContentAlignClass() === 'text-right' ? 'justify-end' : 
                                                  'justify-start'}`}>
              {resume.skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="inline-block"
                  style={{
                    position: 'relative',
                    paddingBottom: formatOptions?.showBorders ? '3px' : '0'
                  }}
                >
                  <span className="text-sm font-medium">{skill.name}</span>
                  {skill.level && <span className="ml-1 text-sm opacity-70">({skill.level})</span>}
                  {formatOptions?.showBorders && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '1px',
                      backgroundColor: `${primaryColor}40`
                    }}></div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 证书部分 */}
        {resume.certifications && resume.certifications.length > 0 && (
          <section className={getSpacingClass()}>
            <h2 className={`text-lg font-normal mb-3 uppercase tracking-widest ${getHeadingAlignClass()}`} style={{ 
              color: primaryColor,
            }}>
              Certifications
            </h2>
            <div className="space-y-2">
              {resume.certifications.map((cert, index) => (
                <div key={index} className={`mb-2 ${getContentAlignClass()}`}>
                  <div className="font-medium text-sm" style={{ color: primaryColor }}>
                    {cert.name}
                  </div>
                  <div className="text-sm" style={{ color: secondaryColor }}>
                    {cert.issuer}
                    {cert.date && <span className="ml-1">• {cert.date}</span>}
                  </div>
                  {cert.description && (
                    <p className="text-sm mt-1">{cert.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* 语言能力部分 */}
        {resume.languages && resume.languages.length > 0 && (
          <section className={getSpacingClass()}>
            <h2 className={`text-lg font-normal mb-3 uppercase tracking-widest ${getHeadingAlignClass()}`} style={{ 
              color: primaryColor,
            }}>
              Languages
            </h2>
            <div className={`flex flex-wrap gap-4 ${getContentAlignClass() === 'text-center' ? 'justify-center' : 
                                                  getContentAlignClass() === 'text-right' ? 'justify-end' : 
                                                  'justify-start'}`}>
              {resume.languages.map((lang, index) => (
                <div key={index} className="inline-block">
                  <span className="text-sm font-medium">{lang.name}</span>
                  {lang.proficiency && (
                    <span className="ml-1 text-sm" style={{ color: secondaryColor }}>
                      ({lang.proficiency})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      
      {/* 页脚分割线 */}
      {formatOptions?.showBorders && (
        <footer className="mt-auto pt-3">
          <div className="w-full" style={{
            height: '1px',
            backgroundColor: `${primaryColor}20`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              width: '10%',
              height: '2px',
              backgroundColor: primaryColor,
              right: getHeadingAlignClass() === 'text-center' ? '45%' : 
                    getHeadingAlignClass() === 'text-right' ? '0' : '90%',
              top: '-0.5px'
            }}></div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MinimalTemplate; 