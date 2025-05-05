'use client';

import React from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin } from 'react-icons/fa';

interface ElegantSpacedTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

const ElegantSpacedTemplate: React.FC<ElegantSpacedTemplateProps> = ({
  resume,
  formatOptions
}) => {
  const primaryColor = formatOptions.primaryColor || '#333333';
  const secondaryColor = formatOptions.secondaryColor || '#666666';
  const fontSize = formatOptions.fontSize === 'small' ? '14px' : 
                  formatOptions.fontSize === 'large' ? '16px' : '15px';
  const fontFamily = formatOptions.fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' :
                    formatOptions.fontFamily === 'mono' ? '"Courier New", monospace' :
                    '"Segoe UI", Arial, sans-serif';

  const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '500',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: primaryColor,
    marginBottom: '1.5rem',
    marginTop: '2rem'
  };

  const contactItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: secondaryColor,
    fontSize: '0.9rem',
    marginBottom: '0.75rem'
  };

  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto" style={{ fontFamily, fontSize }}>
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl tracking-[0.3em] uppercase mb-4" style={{ 
          color: primaryColor,
          fontWeight: '400',
          letterSpacing: '0.3em'
        }}>
          {resume.contactInfo.name}
        </h1>
        {resume.contactInfo.title && (
          <div className="text-lg tracking-widest uppercase" style={{ 
            color: secondaryColor,
            letterSpacing: '0.15em'
          }}>
            {resume.contactInfo.title}
          </div>
        )}
      </header>

      <div className="border-t border-b border-gray-200 my-8"></div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Contact Info */}
        <div className="col-span-4">
          <div className="mb-8">
            <h2 style={sectionTitleStyle}>Contact</h2>
            <div className="space-y-2">
              {resume.contactInfo.phone && (
                <div style={contactItemStyle}>
                  <FaPhone size={12} />
                  <span>{resume.contactInfo.phone}</span>
                </div>
              )}
              {resume.contactInfo.email && (
                <div style={contactItemStyle}>
                  <FaEnvelope size={12} />
                  <span>{resume.contactInfo.email}</span>
                </div>
              )}
              {resume.contactInfo.location && (
                <div style={contactItemStyle}>
                  <FaMapMarkerAlt size={12} />
                  <span>{resume.contactInfo.location}</span>
                </div>
              )}
              {resume.contactInfo.linkedin && (
                <div style={contactItemStyle}>
                  <FaLinkedin size={12} />
                  <span>{resume.contactInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          {resume.skills && resume.skills.length > 0 && (
            <div className="mb-8">
              <h2 style={sectionTitleStyle}>Skills</h2>
              <div className="space-y-2">
                {resume.skills.map((skill, index) => (
                  <div key={index} style={{ color: secondaryColor }}>
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {resume.languages && resume.languages.length > 0 && (
            <div className="mb-8">
              <h2 style={sectionTitleStyle}>Languages</h2>
              <div className="space-y-2">
                {resume.languages.map((lang, index) => (
                  <div key={index} style={{ color: secondaryColor }}>
                    <span className="font-medium">{lang.name}</span>
                    {lang.proficiency && (
                      <span className="ml-2">({lang.proficiency})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="col-span-8">
          {/* Profile Section */}
          {resume.summary && (
            <div className="mb-8">
              <h2 style={sectionTitleStyle}>Profile</h2>
              <p className="leading-relaxed" style={{ color: secondaryColor }}>
                {resume.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <div className="mb-8">
              <h2 style={sectionTitleStyle}>Work Experience</h2>
              <div className="space-y-6">
                {resume.experience.map((exp, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium mb-1" style={{ color: primaryColor }}>
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
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div className="mb-8">
              <h2 style={sectionTitleStyle}>Education</h2>
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium mb-1" style={{ color: primaryColor }}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElegantSpacedTemplate; 