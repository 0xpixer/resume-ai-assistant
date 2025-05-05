import React from 'react';
import { Resume } from '@/types/resume';
import { FormatOptions } from '@/types/format';
import { ResumeStyleUtils } from '@/utils/resumeStyleUtils';

interface ClassicTemplateProps {
  resume: Resume;
  formatOptions?: FormatOptions;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
  resume,
  formatOptions
}) => {
  const getFontFamily = () => {
    if (!formatOptions) return 'font-sans';
    switch (formatOptions.fontFamily) {
      case 'sans': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };
  
  // 获取页面边距样式
  const getPageMarginStyle = () => {
    if (!formatOptions) {
      return { margin: '2.54cm' };
    }
    
    // 如果设置了具体的边距值，则使用这些值
    if (formatOptions.marginLeft || formatOptions.marginRight || 
        formatOptions.marginTop || formatOptions.marginBottom) {
      return {
        marginLeft: formatOptions.marginLeft || '2.54cm',
        marginRight: formatOptions.marginRight || '2.54cm',
        marginTop: formatOptions.marginTop || '2.54cm',
        marginBottom: formatOptions.marginBottom || '2.54cm'
      };
    }
    
    // 否则根据 pageMargins 设置统一的边距
    switch (formatOptions.pageMargins) {
      case 'narrow': return { margin: '1.5cm' };
      case 'moderate': return { margin: '2cm' };
      case 'normal':
      default: return { margin: '2.54cm' };
    }
  };

  return (
    <div 
      className={`${getFontFamily()} max-w-4xl mx-auto`} 
      style={{
        ...getPageMarginStyle(),
        fontSize: ResumeStyleUtils.getFontSize(formatOptions)
      }}
    >
      {/* 头部信息 */}
      <div className={`text-center mb-8 ${ResumeStyleUtils.getHeadingAlignClass(formatOptions)}`}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: formatOptions?.primaryColor }}>
          {resume.contactInfo.name}
        </h1>
        <div className="text-gray-600">
          {resume.contactInfo.email} | {resume.contactInfo.phone} | {resume.contactInfo.location}
        </div>
      </div>

      {/* 教育经历 */}
      {resume.education.length > 0 && (
        <div className="mb-6" style={{ marginBottom: ResumeStyleUtils.getSectionSpacing(formatOptions) }}>
          <h2 
            className={`text-xl font-bold mb-4 ${ResumeStyleUtils.getHeadingAlignClass(formatOptions)} ${ResumeStyleUtils.getBorderClass(formatOptions)}`} 
            style={{ color: formatOptions?.primaryColor }}
          >
            Education
          </h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="mb-4" style={{ marginBottom: ResumeStyleUtils.getParagraphSpacing(formatOptions) }}>
              <div className="flex justify-between">
                <h3 className="font-semibold">{edu.institution}</h3>
                <span className="text-gray-600">{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="text-gray-600">{edu.degree} in {edu.field}</div>
              {edu.achievements && edu.achievements.length > 0 && (
                <div 
                  className={`mt-2 ${ResumeStyleUtils.getContentAlignClass(formatOptions)}`} 
                  style={{ lineHeight: ResumeStyleUtils.getLineSpacing(formatOptions) }}
                >
                  {edu.achievements.map((achievement, i) => (
                    <div key={i} className="mb-1">{achievement}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 工作经历 */}
      {resume.experience.length > 0 && (
        <div className="mb-6" style={{ marginBottom: ResumeStyleUtils.getSectionSpacing(formatOptions) }}>
          <h2 
            className={`text-xl font-bold mb-4 ${ResumeStyleUtils.getHeadingAlignClass(formatOptions)} ${ResumeStyleUtils.getBorderClass(formatOptions)}`} 
            style={{ color: formatOptions?.primaryColor }}
          >
            Experience
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4" style={{ marginBottom: ResumeStyleUtils.getParagraphSpacing(formatOptions) }}>
              <div className="flex justify-between">
                <h3 className="font-semibold">{exp.company}</h3>
                <span className="text-gray-600">{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="text-gray-600">{exp.position}</div>
              {exp.achievements && exp.achievements.length > 0 && (
                <div 
                  className={`mt-2 ${ResumeStyleUtils.getContentAlignClass(formatOptions)}`} 
                  style={{ lineHeight: ResumeStyleUtils.getLineSpacing(formatOptions) }}
                >
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="mb-1">{achievement}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 技能 */}
      {resume.skills.length > 0 && (
        <div className="mb-6" style={{ marginBottom: ResumeStyleUtils.getSectionSpacing(formatOptions) }}>
          <h2 
            className={`text-xl font-bold mb-4 ${ResumeStyleUtils.getHeadingAlignClass(formatOptions)} ${ResumeStyleUtils.getBorderClass(formatOptions)}`} 
            style={{ color: formatOptions?.primaryColor }}
          >
            Skills
          </h2>
          <div className={`${ResumeStyleUtils.getContentAlignClass(formatOptions)}`}>
            {resume.skills.map((skill, index) => (
              <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassicTemplate; 