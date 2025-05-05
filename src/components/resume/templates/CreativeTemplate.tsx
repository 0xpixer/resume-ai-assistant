'use client';

import React from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaLinkedin, FaGithub, FaBriefcase, FaGraduationCap, FaCode, FaLanguage, FaCertificate, FaUser } from 'react-icons/fa';

interface CreativeTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ resume, formatOptions }) => {
  // 获取主色调
  const primaryColor = formatOptions?.primaryColor || '#7C3AED'; // 紫色作为默认
  const secondaryColor = formatOptions?.secondaryColor || '#8B5CF6';
  
  // 辅助色
  const accentColor = getComplementaryColor(primaryColor);
  
  // 计算互补色
  function getComplementaryColor(hex: string): string {
    // 去掉十六进制的 '#' 前缀
    hex = hex.replace('#', '');
    
    // 将十六进制颜色转换为 RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // 计算互补色（255 - 原色）
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    
    // 转回十六进制
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
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

  return (
    <div 
      className="h-full flex flex-col bg-[#FAFAFA]"
      style={{
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        '--accent-color': accentColor,
        fontFamily: formatOptions?.fontFamily === 'serif' ? 'Georgia, serif' : 
                   formatOptions?.fontFamily === 'mono' ? 'monospace' : 
                   'Poppins, Helvetica, Arial, sans-serif',
      } as React.CSSProperties}
    >
      {/* 顶部设计元素 - 装饰性几何图案 */}
      <div className="absolute top-0 right-0 w-1/3 h-32 overflow-hidden">
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '100%',
          height: '200%',
          background: `linear-gradient(45deg, ${primaryColor}30 0%, transparent 70%)`,
          borderRadius: '0 0 0 100%',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '60%',
          height: '60%',
          background: `${primaryColor}20`,
          borderRadius: '50%',
          zIndex: 2
        }}></div>
      </div>
      
      {/* 标题区域 */}
      <header className="relative z-10 px-8 pt-8 pb-6" style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wide" style={{ 
              color: primaryColor,
              position: 'relative',
              display: 'inline-block'
            }}>
              {resume.contactInfo?.name || '姓名'}
              {/* 名字下的装饰线 */}
              <div style={{
                position: 'absolute',
                bottom: '-5px',
                left: '0',
                width: '50%',
                height: '3px',
                background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}00)`,
              }}></div>
            </h1>
            
            {resume.contactInfo?.title && (
              <h2 className="text-xl mt-2 ml-1 font-light" style={{ color: secondaryColor }}>
                {resume.contactInfo.title}
              </h2>
            )}
          </div>
          
          {/* 联系信息 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 md:mt-0 text-sm">
            {resume.contactInfo?.email && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full mr-2" style={{
                  backgroundColor: `${primaryColor}15`
                }}>
                  <FaEnvelope style={{ color: primaryColor }} />
                </div>
                <span>{resume.contactInfo.email}</span>
              </div>
            )}
            
            {resume.contactInfo?.phone && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full mr-2" style={{
                  backgroundColor: `${primaryColor}15`
                }}>
                  <FaPhone style={{ color: primaryColor }} />
                </div>
                <span>{resume.contactInfo.phone}</span>
              </div>
            )}
            
            {resume.contactInfo?.location && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full mr-2" style={{
                  backgroundColor: `${primaryColor}15`
                }}>
                  <FaMapMarkerAlt style={{ color: primaryColor }} />
                </div>
                <span>{resume.contactInfo.location}</span>
              </div>
            )}
            
            {resume.contactInfo?.website && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full mr-2" style={{
                  backgroundColor: `${primaryColor}15`
                }}>
                  <FaGlobe style={{ color: primaryColor }} />
                </div>
                <span>{resume.contactInfo.website}</span>
              </div>
            )}
            
            {resume.contactInfo?.linkedin && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full mr-2" style={{
                  backgroundColor: `${primaryColor}15`
                }}>
                  <FaLinkedin style={{ color: primaryColor }} />
                </div>
                <span>{resume.contactInfo.linkedin}</span>
              </div>
            )}
            
            {resume.contactInfo?.github && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full mr-2" style={{
                  backgroundColor: `${primaryColor}15`
                }}>
                  <FaGithub style={{ color: primaryColor }} />
                </div>
                <span>{resume.contactInfo.github}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="flex-1 px-8 py-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左边栏：个人简介和技能 */}
          <div className="md:col-span-1 flex flex-col gap-6">
            {/* 个人简介 */}
            {resume.summary && (
              <section className={`${getSpacingClass()} relative overflow-hidden rounded-lg p-6`} style={{
                backgroundColor: 'white',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
                border: formatOptions?.showBorders ? `1px solid ${primaryColor}20` : 'none',
              }}>
                <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full" style={{
                  backgroundColor: `${primaryColor}10`
                }}></div>
                
                {/* 标题带有图标 */}
                <div className="flex items-center mb-4">
                  <FaUser className="mr-2" style={{ color: primaryColor }} />
                  <h2 className={`text-lg font-bold ${getHeadingAlignClass()}`} style={{ color: primaryColor }}>
                    About Me
                  </h2>
                </div>
                
                <p className={`${getContentAlignClass()} relative z-10 leading-relaxed`}>
                  {resume.summary}
                </p>
              </section>
            )}
            
            {/* 技能 */}
            {resume.skills && resume.skills.length > 0 && (
              <section className={`${getSpacingClass()} relative overflow-hidden rounded-lg p-6`} style={{
                backgroundColor: 'white',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
                border: formatOptions?.showBorders ? `1px solid ${primaryColor}20` : 'none',
              }}>
                {/* 标题带有图标 */}
                <div className="flex items-center mb-4">
                  <FaCode className="mr-2" style={{ color: primaryColor }} />
                  <h2 className={`text-lg font-bold ${getHeadingAlignClass()}`} style={{ color: primaryColor }}>
                    Skills
                  </h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="text-sm py-1.5 px-3 rounded-lg"
                      style={{
                        backgroundColor: `${primaryColor}10`,
                        border: formatOptions?.showBorders ? `1px solid ${primaryColor}30` : 'none',
                        color: primaryColor
                      }}
                    >
                      {skill.name}
                      {skill.level && <span className="ml-1">({skill.level})</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* 语言 */}
            {resume.languages && resume.languages.length > 0 && (
              <section className={`${getSpacingClass()} relative overflow-hidden rounded-lg p-6`} style={{
                backgroundColor: 'white',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
                border: formatOptions?.showBorders ? `1px solid ${primaryColor}20` : 'none',
              }}>
                {/* 标题带有图标 */}
                <div className="flex items-center mb-4">
                  <FaLanguage className="mr-2" style={{ color: primaryColor }} />
                  <h2 className={`text-lg font-bold ${getHeadingAlignClass()}`} style={{ color: primaryColor }}>
                    Languages
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {resume.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium">{lang.name}</div>
                      {lang.proficiency && (
                        <div className="text-sm px-2 py-0.5 rounded-full" style={{
                          backgroundColor: `${primaryColor}10`,
                          color: primaryColor
                        }}>
                          {lang.proficiency}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* 证书 */}
            {resume.certifications && resume.certifications.length > 0 && (
              <section className={`${getSpacingClass()} relative overflow-hidden rounded-lg p-6`} style={{
                backgroundColor: 'white',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
                border: formatOptions?.showBorders ? `1px solid ${primaryColor}20` : 'none',
              }}>
                {/* 标题带有图标 */}
                <div className="flex items-center mb-4">
                  <FaCertificate className="mr-2" style={{ color: primaryColor }} />
                  <h2 className={`text-lg font-bold ${getHeadingAlignClass()}`} style={{ color: primaryColor }}>
                    Certifications
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {resume.certifications.map((cert, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-md"
                      style={{ backgroundColor: index % 2 === 0 ? `${primaryColor}05` : 'transparent' }}
                    >
                      <div className="font-medium" style={{ color: primaryColor }}>
                        {cert.name}
                      </div>
                      <div className="text-sm">
                        {cert.issuer}
                        {cert.date && <span className="ml-2 text-xs">({cert.date})</span>}
                      </div>
                      {cert.description && (
                        <p className="text-sm mt-1 italic">{cert.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          {/* 右边栏：工作经验和教育 */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* 工作经验 */}
            {resume.experience && resume.experience.length > 0 && (
              <section className={`${getSpacingClass()} relative overflow-hidden rounded-lg p-6`} style={{
                backgroundColor: 'white',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
                border: formatOptions?.showBorders ? `1px solid ${primaryColor}20` : 'none',
              }}>
                {/* 标题带有图标 */}
                <div className="flex items-center mb-4">
                  <FaBriefcase className="mr-2" style={{ color: primaryColor }} />
                  <h2 className={`text-lg font-bold ${getHeadingAlignClass()}`} style={{ color: primaryColor }}>
                    Work Experience
                  </h2>
                </div>
                
                <div className="space-y-5">
                  {resume.experience.map((exp, index) => (
                    <div key={index} className="relative">
                      {/* 时间轴 */}
                      {formatOptions?.showBorders && index < resume.experience.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '24px',
                          left: '12px',
                          width: '1px',
                          height: 'calc(100% - 10px)',
                          backgroundColor: `${primaryColor}30`
                        }}></div>
                      )}
                      
                      <div className="flex gap-4">
                        {/* 左侧时间点或icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
                            backgroundColor: primaryColor
                          }}>
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        </div>
                        
                        {/* 右侧内容 */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                            <div>
                              <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                                {exp.position}
                              </h3>
                              <div className="text-sm" style={{ color: secondaryColor }}>
                                {exp.company}
                                {exp.location && <span className="ml-2">| {exp.location}</span>}
                              </div>
                            </div>
                            <div className="text-sm whitespace-nowrap mt-1 sm:mt-0 px-2 py-1 rounded" style={{
                              backgroundColor: `${primaryColor}10`,
                              color: primaryColor
                            }}>
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </div>
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
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* 教育经历 */}
            {resume.education && resume.education.length > 0 && (
              <section className={`${getSpacingClass()} relative overflow-hidden rounded-lg p-6`} style={{
                backgroundColor: 'white',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
                border: formatOptions?.showBorders ? `1px solid ${primaryColor}20` : 'none',
              }}>
                {/* 标题带有图标 */}
                <div className="flex items-center mb-4">
                  <FaGraduationCap className="mr-2" style={{ color: primaryColor }} />
                  <h2 className={`text-lg font-bold ${getHeadingAlignClass()}`} style={{ color: primaryColor }}>
                    Education
                  </h2>
                </div>
                
                <div className="space-y-5">
                  {resume.education.map((edu, index) => (
                    <div key={index} className="flex gap-4">
                      {/* 左侧学位图标 */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                          backgroundColor: `${primaryColor}20`
                        }}>
                          <FaGraduationCap size={18} style={{ color: primaryColor }} />
                        </div>
                      </div>
                      
                      {/* 右侧内容 */}
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                              {edu.degree}{edu.field ? ` - ${edu.field}` : ''}
                            </h3>
                            <div className="text-sm" style={{ color: secondaryColor }}>
                              {edu.institution}
                              {edu.location && <span className="ml-2">| {edu.location}</span>}
                            </div>
                          </div>
                          <div className="text-sm whitespace-nowrap mt-1 sm:mt-0">
                            {edu.startDate} - {edu.endDate || 'Present'}
                          </div>
                        </div>
                        
                        {edu.gpa && (
                          <div className="text-sm mb-2">
                            <span className="font-medium">GPA:</span> {edu.gpa}
                          </div>
                        )}
                        
                        {edu.achievements && edu.achievements.length > 0 && formatOptions?.showBullets && (
                          <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
                            {edu.achievements.map((achievement, idx) => (
                              <li key={idx}>{achievement}</li>
                            ))}
                          </ul>
                        )}
                        
                        {edu.achievements && edu.achievements.length > 0 && !formatOptions?.showBullets && (
                          <div className="space-y-2 text-sm leading-relaxed">
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
          </div>
        </div>
      </div>
      
      {/* 底部设计元素 */}
      <div className="absolute bottom-0 left-0 w-full h-3" style={{
        background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      }}></div>
    </div>
  );
};

export default CreativeTemplate; 