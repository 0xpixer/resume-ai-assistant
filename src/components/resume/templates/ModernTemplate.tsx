'use client';

import React from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';

interface ModernTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ resume, formatOptions }) => {
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
      return 'mb-6';
    }
    return 'mb-3';
  };

  // 获取主色调
  const primaryColor = formatOptions?.primaryColor || '#2563eb';
  const secondaryColor = formatOptions?.secondaryColor || '#475569';

  return (
    <div 
      className="h-full flex flex-col bg-white text-gray-800"
      style={{
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        fontFamily: formatOptions?.fontFamily === 'serif' ? 'Georgia, serif' : 
                   formatOptions?.fontFamily === 'mono' ? 'monospace' : 
                   'Helvetica, Arial, sans-serif',
      } as React.CSSProperties}
    >
      {/* 头部区域 - 姓名和标题 */}
      <header 
        className="relative p-8 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* 装饰性几何形状 */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
          background: `radial-gradient(circle, ${primaryColor}50 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)'
        }}></div>
        
        <h1 className={`text-3xl font-bold mb-2 relative z-10 ${getHeadingAlignClass()}`} style={{
          letterSpacing: '0.05em'
        }}>
          {resume.contactInfo?.name || '姓名'}
        </h1>
        
        {resume.contactInfo?.title && (
          <p className={`text-xl mt-1 mb-4 relative z-10 ${getHeadingAlignClass()}`} style={{ 
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: '0.02em'
          }}>
            {resume.contactInfo.title}
          </p>
        )}
        
        {/* 联系信息 - 水平排列 */}
        <div className={`flex flex-wrap gap-4 mt-4 text-sm relative z-10 ${getHeadingAlignClass() === 'text-center' ? 'justify-center' : getHeadingAlignClass() === 'text-right' ? 'justify-end' : 'justify-start'}`}>
          {resume.contactInfo?.email && (
            <div className="flex items-center">
              <FaEnvelope className="mr-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
              <span>{resume.contactInfo.email}</span>
            </div>
          )}
          
          {resume.contactInfo?.phone && (
            <div className="flex items-center">
              <FaPhone className="mr-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
              <span>{resume.contactInfo.phone}</span>
            </div>
          )}
          
          {resume.contactInfo?.location && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
              <span>{resume.contactInfo.location}</span>
            </div>
          )}
          
          {resume.contactInfo?.website && (
            <div className="flex items-center">
              <FaGlobe className="mr-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
              <span>{resume.contactInfo.website}</span>
            </div>
          )}
          
          {resume.contactInfo?.linkedin && (
            <div className="flex items-center">
              <FaLinkedin className="mr-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
              <span>{resume.contactInfo.linkedin}</span>
            </div>
          )}
          
          {resume.contactInfo?.github && (
            <div className="flex items-center">
              <FaGithub className="mr-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
              <span>{resume.contactInfo.github}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* 左侧栏 - 技能和认证 */}
        <aside className="w-1/3 p-6 flex flex-col space-y-6" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRight: formatOptions?.showBorders ? `1px solid ${primaryColor}15` : 'none',
        }}>
          {/* 技能 */}
          {resume.skills && resume.skills.length > 0 && (
            <section>
              <h2 className={`text-lg font-semibold mb-4 ${getHeadingAlignClass()}`} style={{ 
                color: 'var(--primary-color)',
                position: 'relative',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  position: 'relative',
                  display: formatOptions?.showBorders ? 'inline-block' : 'block',
                  paddingBottom: '4px'
                }}>
                  Skills
                  {formatOptions?.showBorders && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: primaryColor
                    }}></span>
                  )}
                </span>
              </h2>
              <div className="space-y-3">
                {resume.skills.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <div className={`flex justify-between items-center mb-1 ${getContentAlignClass()}`}>
                      <span className="font-medium">{skill.name}</span>
                      {skill.level && (
                        <span className="text-xs" style={{ color: 'var(--secondary-color)' }}>
                          {skill.level}/5
                        </span>
                      )}
                    </div>
                    {skill.level && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(typeof skill.level === 'string' ? parseInt(skill.level) : skill.level) / 5 * 100}%`,
                            background: `linear-gradient(to right, ${primaryColor}99, ${primaryColor})`
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 语言 */}
          {resume.languages && resume.languages.length > 0 && (
            <section>
              <h2 className={`text-lg font-semibold mb-4 ${getHeadingAlignClass()}`} style={{ 
                color: 'var(--primary-color)',
                position: 'relative',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  position: 'relative',
                  display: formatOptions?.showBorders ? 'inline-block' : 'block',
                  paddingBottom: '4px'
                }}>
                  Languages
                  {formatOptions?.showBorders && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: primaryColor
                    }}></span>
                  )}
                </span>
              </h2>
              <div className={`space-y-2 ${getContentAlignClass()}`}>
                {resume.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{lang.name}</span>
                    {lang.proficiency && (
                      <span className="text-sm px-2 py-1 rounded-full" style={{ 
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor
                      }}>
                        {lang.proficiency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 证书 */}
          {resume.certifications && resume.certifications.length > 0 && (
            <section>
              <h2 className={`text-lg font-semibold mb-4 ${getHeadingAlignClass()}`} style={{ 
                color: 'var(--primary-color)',
                position: 'relative',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  position: 'relative',
                  display: formatOptions?.showBorders ? 'inline-block' : 'block',
                  paddingBottom: '4px'
                }}>
                  Certifications
                  {formatOptions?.showBorders && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: primaryColor
                    }}></span>
                  )}
                </span>
              </h2>
              <div className="space-y-3">
                {resume.certifications.map((cert, index) => (
                  <div key={index} className={`p-3 rounded-md ${getContentAlignClass()}`} style={{
                    backgroundColor: index % 2 === 0 ? `${primaryColor}08` : 'transparent',
                  }}>
                    <div className="font-medium" style={{ color: 'var(--primary-color)' }}>
                      {cert.name}
                    </div>
                    {cert.issuer && (
                      <div className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                        {cert.issuer}
                      </div>
                    )}
                    {cert.date && (
                      <div className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>
                        {cert.date}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* 右侧主区域 - 简介、工作经验、教育、项目 */}
        <main className="w-2/3 p-6 flex flex-col space-y-6">
          {/* Summary */}
          {resume.summary && (
            <section className={getSpacingClass()}>
              <h2 className={`text-lg font-semibold mb-4 ${getHeadingAlignClass()}`} style={{ 
                color: 'var(--primary-color)',
                position: 'relative',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  position: 'relative',
                  display: formatOptions?.showBorders ? 'inline-block' : 'block',
                  paddingBottom: '4px'
                }}>
                  Professional Summary
                  {formatOptions?.showBorders && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: primaryColor
                    }}></span>
                  )}
                </span>
              </h2>
              <p className={`leading-relaxed ${getContentAlignClass()}`}>{resume.summary}</p>
            </section>
          )}

          {/* Work Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <section className={getSpacingClass()}>
              <h2 className={`text-lg font-semibold mb-4 ${getHeadingAlignClass()}`} style={{ 
                color: 'var(--primary-color)',
                position: 'relative',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  position: 'relative',
                  display: formatOptions?.showBorders ? 'inline-block' : 'block',
                  paddingBottom: '4px'
                }}>
                  Work Experience
                  {formatOptions?.showBorders && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: primaryColor
                    }}></span>
                  )}
                </span>
              </h2>
              <div className="space-y-5">
                {resume.experience.map((exp, index) => (
                  <div 
                    key={index} 
                    className={`pl-4 ${formatOptions?.showBorders ? 'border-l-2' : ''}`}
                    style={{ 
                      borderColor: formatOptions?.showBorders ? primaryColor : 'transparent',
                      position: 'relative',
                      paddingBottom: '1rem'
                    }}
                  >
                    {/* 时间线上的点 */}
                    {formatOptions?.showBorders && (
                      <div style={{
                        position: 'absolute',
                        left: '-5px',
                        top: '0',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: primaryColor
                      }}></div>
                    )}
                    
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold" style={{ color: 'var(--primary-color)' }}>
                          {exp.position}
                        </h3>
                        <span className="text-sm font-medium px-2 py-0.5 rounded" style={{ 
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor
                        }}>
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      
                      <div className="text-base mb-2" style={{ color: 'var(--secondary-color)' }}>
                        {exp.company}
                        {exp.location && <span className="ml-2">| {exp.location}</span>}
                      </div>
                      
                      {exp.achievements && exp.achievements.length > 0 && formatOptions?.showBullets && (
                        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
                          {exp.achievements.map((achievement, idx) => (
                            <li key={idx}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                      
                      {exp.achievements && exp.achievements.length > 0 && !formatOptions?.showBullets && (
                        <div className="space-y-2 text-sm leading-relaxed">
                          {exp.achievements.map((achievement, idx) => (
                            <p key={idx}>{achievement}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <section className={getSpacingClass()}>
              <h2 className={`text-lg font-semibold mb-4 ${getHeadingAlignClass()}`} style={{ 
                color: 'var(--primary-color)',
                position: 'relative',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  position: 'relative',
                  display: formatOptions?.showBorders ? 'inline-block' : 'block',
                  paddingBottom: '4px'
                }}>
                  Education
                  {formatOptions?.showBorders && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: primaryColor
                    }}></span>
                  )}
                </span>
              </h2>
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <div key={index} className="flex">
                    {/* 左侧圆形学位标志 */}
                    <div className="mr-4 flex-shrink-0 hidden sm:block">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                        backgroundColor: `${primaryColor}15`
                      }}>
                        <span style={{ color: primaryColor }}>
                          {edu.degree.substring(0, 2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* 右侧内容 */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold" style={{ color: 'var(--primary-color)' }}>
                          {edu.degree}
                        </h3>
                        <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                          {edu.startDate} - {edu.endDate || 'Present'}
                        </span>
                      </div>
                      
                      <div className="text-base mb-1" style={{ color: 'var(--secondary-color)' }}>
                        {edu.institution}
                        {edu.location && <span className="ml-2 text-sm">| {edu.location}</span>}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {edu.field && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ 
                            backgroundColor: `${primaryColor}10`,
                            color: primaryColor
                          }}>
                            {edu.field}
                          </span>
                        )}
                        
                        {edu.gpa && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ 
                            backgroundColor: `${primaryColor}10`,
                            color: primaryColor
                          }}>
                            GPA: {edu.gpa}
                          </span>
                        )}
                      </div>
                      
                      {edu.achievements && edu.achievements.length > 0 && formatOptions?.showBullets && (
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          {edu.achievements.map((achievement, idx) => (
                            <li key={idx}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                      
                      {edu.achievements && edu.achievements.length > 0 && !formatOptions?.showBullets && (
                        <div className="space-y-1 text-sm mt-2">
                          {edu.achievements.map((achievement, idx) => (
                            <p key={idx}>{achievement}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects (if any) */}
          {resume.projects && resume.projects.length > 0 && (
            <section className={getSpacingClass()}>
              <h2 className={`text-lg font-semibold mb-4 ${getHeadingAlignClass()}`} style={{ 
                color: 'var(--primary-color)',
                position: 'relative',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  position: 'relative',
                  display: formatOptions?.showBorders ? 'inline-block' : 'block',
                  paddingBottom: '4px'
                }}>
                  Projects
                  {formatOptions?.showBorders && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: primaryColor
                    }}></span>
                  )}
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {resume.projects.map((project, index) => (
                  <div key={index} className="p-4 rounded-lg" style={{
                    backgroundColor: `${primaryColor}05`,
                    border: formatOptions?.showBorders ? `1px solid ${primaryColor}15` : 'none'
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold" style={{ color: 'var(--primary-color)' }}>
                        {project.name}
                      </h3>
                      {(project.startDate || project.endDate) && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ 
                          backgroundColor: 'white',
                          color: secondaryColor,
                          border: `1px solid ${secondaryColor}20`
                        }}>
                          {project.startDate && project.startDate} 
                          {project.startDate && project.endDate && ' - '} 
                          {project.endDate || 'Present'}
                        </span>
                      )}
                    </div>
                    
                    {project.role && (
                      <div className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>
                        {project.role}
                      </div>
                    )}
                    
                    {project.description && <p className="text-sm mb-2">{project.description}</p>}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, techIdx) => (
                          <span key={techIdx} className="text-xs px-2 py-0.5 rounded-full" style={{ 
                            backgroundColor: `${primaryColor}15`,
                            color: primaryColor
                          }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModernTemplate; 