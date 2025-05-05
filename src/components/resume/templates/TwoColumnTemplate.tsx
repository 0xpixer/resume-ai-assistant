'use client';

import React from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaLinkedin, FaGithub, FaBriefcase, FaGraduationCap, FaCode, FaLanguage, FaCertificate, FaUser } from 'react-icons/fa';

interface TwoColumnTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

const TwoColumnTemplate: React.FC<TwoColumnTemplateProps> = ({ resume, formatOptions }) => {
  const primaryColor = formatOptions?.primaryColor || '#eb3d24';
  const secondaryColor = formatOptions?.secondaryColor || '#333333';
  const fontSize = formatOptions?.fontSize || '14px';
  const lineSpacing = formatOptions?.lineSpacing || '1.5';
  const fontFamily = formatOptions?.fontFamily || 'sans';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily, fontSize, lineHeight: lineSpacing }}>
      <div className="grid grid-cols-12 gap-0">
        {/* 左侧栏 - 个人信息和技能 */}
        <div className="col-span-4 bg-[#f8f9fa] p-6" style={{ color: secondaryColor }}>
          {/* 头像和姓名 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
              {resume.contactInfo?.name}
            </h1>
            {resume.contactInfo?.title && (
              <p className="text-sm" style={{ color: secondaryColor }}>
                {resume.contactInfo.title}
              </p>
            )}
          </div>

          {/* 联系方式 */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: primaryColor }}>
              CONTACT
            </h2>
            <div className="space-y-2">
              {resume.contactInfo?.email && (
                <div className="flex items-center text-sm">
                  <FaEnvelope className="mr-2" style={{ color: primaryColor }} />
                  <span>{resume.contactInfo.email}</span>
                </div>
              )}
              {resume.contactInfo?.phone && (
                <div className="flex items-center text-sm">
                  <FaPhone className="mr-2" style={{ color: primaryColor }} />
                  <span>{resume.contactInfo.phone}</span>
                </div>
              )}
              {resume.contactInfo?.location && (
                <div className="flex items-center text-sm">
                  <FaMapMarkerAlt className="mr-2" style={{ color: primaryColor }} />
                  <span>{resume.contactInfo.location}</span>
                </div>
              )}
              {resume.contactInfo?.linkedin && (
                <div className="flex items-center text-sm">
                  <FaLinkedin className="mr-2" style={{ color: primaryColor }} />
                  <span>{resume.contactInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>

          {/* 技能 */}
          {resume.skills && resume.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3" style={{ color: primaryColor }}>
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 语言 */}
          {resume.languages && resume.languages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3" style={{ color: primaryColor }}>
                LANGUAGES
              </h2>
              <div className="space-y-2">
                {resume.languages.map((lang, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{lang.name}</span>
                    {lang.proficiency && (
                      <span className="text-gray-500 ml-2">({lang.proficiency})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧栏 - 工作经验和教育背景 */}
        <div className="col-span-8 p-6">
          {/* 个人简介 */}
          {resume.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-2" style={{ color: primaryColor }}>
                PROFILE
              </h2>
              <p className="text-sm">{resume.summary}</p>
            </div>
          )}

          {/* 工作经验 */}
          {resume.experience && resume.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3" style={{ color: primaryColor }}>
                WORK EXPERIENCE
              </h2>
              <div className="space-y-4">
                {resume.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 pl-4" style={{ borderColor: primaryColor }}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold">{exp.position}</h3>
                      <span className="text-xs" style={{ color: secondaryColor }}>
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    </div>
                    <div className="text-sm mb-2" style={{ color: secondaryColor }}>
                      {exp.company}
                    </div>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-sm">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 教育背景 */}
          {resume.education && resume.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3" style={{ color: primaryColor }}>
                EDUCATION
              </h2>
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <div key={index} className="border-l-2 pl-4" style={{ borderColor: primaryColor }}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <span className="text-xs" style={{ color: secondaryColor }}>
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </span>
                    </div>
                    <div className="text-sm" style={{ color: secondaryColor }}>
                      {edu.institution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 项目经验 */}
          {resume.projects && resume.projects.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: primaryColor }}>
                PROJECTS
              </h2>
              <div className="space-y-4">
                {resume.projects.map((project, index) => (
                  <div key={index} className="border-l-2 pl-4" style={{ borderColor: primaryColor }}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <span className="text-xs" style={{ color: secondaryColor }}>
                        {project.startDate} - {project.endDate || 'Present'}
                      </span>
                    </div>
                    {project.role && (
                      <div className="text-sm mb-2" style={{ color: secondaryColor }}>
                        {project.role}
                      </div>
                    )}
                    {project.description && (
                      <p className="text-sm">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, techIdx) => (
                          <span
                            key={techIdx}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              color: primaryColor
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate; 