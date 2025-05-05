'use client';

import React from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin } from 'react-icons/fa';

interface MinimalElegantTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

const MinimalElegantTemplate: React.FC<MinimalElegantTemplateProps> = ({
  resume,
  formatOptions
}) => {
  const primaryColor = formatOptions.primaryColor || '#eb3d24';
  const secondaryColor = formatOptions.secondaryColor || '#666666';
  const fontSize = formatOptions.fontSize === 'small' ? '14px' : 
                  formatOptions.fontSize === 'large' ? '16px' : '15px';
  const fontFamily = formatOptions.fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' :
                    formatOptions.fontFamily === 'mono' ? '"Courier New", monospace' :
                    '"Segoe UI", Arial, sans-serif';

  const sectionTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: primaryColor,
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: `2px solid ${primaryColor}`,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily, fontSize }}>
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-light mb-2" style={{ color: primaryColor }}>
          {resume.contactInfo.name}
        </h1>
        {resume.contactInfo.title && (
          <div className="text-lg mb-4" style={{ color: secondaryColor }}>
            {resume.contactInfo.title}
          </div>
        )}
        
        {/* Contact Info */}
        <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: secondaryColor }}>
          {resume.contactInfo.email && (
            <div className="flex items-center gap-1">
              <FaEnvelope size={12} />
              <span>{resume.contactInfo.email}</span>
            </div>
          )}
          {resume.contactInfo.phone && (
            <div className="flex items-center gap-1">
              <FaPhone size={12} />
              <span>{resume.contactInfo.phone}</span>
            </div>
          )}
          {resume.contactInfo.location && (
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt size={12} />
              <span>{resume.contactInfo.location}</span>
            </div>
          )}
          {resume.contactInfo.linkedin && (
            <div className="flex items-center gap-1">
              <FaLinkedin size={12} />
              <span>{resume.contactInfo.linkedin}</span>
            </div>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {resume.summary && (
        <section className="mb-8">
          <h2 style={sectionTitleStyle}>Professional Summary</h2>
          <p className="leading-relaxed" style={{ color: secondaryColor }}>
            {resume.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section className="mb-8">
          <h2 style={sectionTitleStyle}>Work Experience</h2>
          <div className="space-y-6">
            {resume.experience.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: primaryColor }}>
                      {exp.position}
                    </h3>
                    <div style={{ color: secondaryColor }}>
                      {exp.company}
                    </div>
                  </div>
                  <div className="text-right" style={{ color: secondaryColor }}>
                    <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
                    {exp.location && <div>{exp.location}</div>}
                  </div>
                </div>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside mt-2 space-y-1" style={{ color: secondaryColor }}>
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="text-sm">{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section className="mb-8">
          <h2 style={sectionTitleStyle}>Education</h2>
          <div className="space-y-4">
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: primaryColor }}>
                      {edu.degree}
                    </h3>
                    <div style={{ color: secondaryColor }}>
                      {edu.institution}
                    </div>
                  </div>
                  <div className="text-right" style={{ color: secondaryColor }}>
                    <div>{edu.startDate} - {edu.endDate || 'Present'}</div>
                    {edu.location && <div>{edu.location}</div>}
                  </div>
                </div>
                {edu.field && (
                  <div className="text-sm mt-1" style={{ color: secondaryColor }}>
                    Major: {edu.field}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <section className="mb-8">
          <h2 style={sectionTitleStyle}>Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <div
                key={index}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor
                }}
              >
                {skill.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {resume.languages && resume.languages.length > 0 && (
        <section className="mb-8">
          <h2 style={sectionTitleStyle}>Languages</h2>
          <div className="space-y-2">
            {resume.languages.map((lang, index) => (
              <div key={index} className="flex justify-between" style={{ color: secondaryColor }}>
                <span className="font-medium">{lang.name}</span>
                {lang.proficiency && <span>{lang.proficiency}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalElegantTemplate; 