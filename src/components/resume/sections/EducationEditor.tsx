'use client';

import React, { useState } from 'react';
import { EducationItem } from '@/types/resume';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import RichTextEditor from '../RichTextEditor';

interface EducationEditorProps {
  education: EducationItem[];
  onChange: (education: EducationItem[]) => void;
}

export default function EducationEditor({ education, onChange }: EducationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentEducation, setCurrentEducation] = useState<EducationItem>({
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    achievements: [],
    courses: []
  });

  const handleAddEducation = () => {
    if (currentEducation.institution.trim() && currentEducation.degree.trim()) {
      if (editIndex !== null) {
        const updatedEducation = [...education];
        updatedEducation[editIndex] = currentEducation;
        onChange(updatedEducation);
      } else {
        onChange([...education, currentEducation]);
      }
      setCurrentEducation({
        institution: '',
        degree: '',
        field: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
        achievements: [],
        courses: []
      });
      setIsEditing(false);
      setEditIndex(null);
    }
  };

  const handleEditEducation = (index: number) => {
    setCurrentEducation(education[index]);
    setEditIndex(index);
    setIsEditing(true);
  };

  const handleRemoveEducation = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    onChange(updatedEducation);
  };

  const handleAchievementsChange = (value: string) => {
    const achievements = value.split('\n').map(achievement => achievement.trim()).filter(achievement => achievement !== '');
    setCurrentEducation({ ...currentEducation, achievements });
  };

  const handleCoursesChange = (value: string) => {
    const courses = value.split(',').map(course => course.trim()).filter(course => course !== '');
    setCurrentEducation({ ...currentEducation, courses });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Add your educational background, starting with the most recent.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#eb3d24] hover:bg-[#d02e17]"
          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            Add Education
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-[#fbfbfb] p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#020202]">
                Institution Name
              </label>
              <input
                type="text"
                value={currentEducation.institution}
                onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
                placeholder="Stanford University"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#020202]">
                Degree
              </label>
              <input
                type="text"
                value={currentEducation.degree}
                onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
                placeholder="Bachelor of Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#020202]">
                Field of Study
              </label>
              <input
                type="text"
                value={currentEducation.field || ''}
                onChange={(e) => setCurrentEducation({ ...currentEducation, field: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#020202]">
                Location
              </label>
              <input
                type="text"
                value={currentEducation.location || ''}
                onChange={(e) => setCurrentEducation({ ...currentEducation, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
                placeholder="Stanford, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#020202]">
                Start Date
              </label>
              <input
                type="month"
                value={currentEducation.startDate || ''}
                onChange={(e) => setCurrentEducation({ ...currentEducation, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#020202]">
                End Date (or Expected)
              </label>
              <input
                type="month"
                value={currentEducation.endDate || ''}
                onChange={(e) => setCurrentEducation({ ...currentEducation, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#020202]">
                GPA (Optional)
              </label>
              <input
                type="text"
                value={currentEducation.gpa || ''}
                onChange={(e) => setCurrentEducation({ ...currentEducation, gpa: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
                placeholder="3.8"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#020202]">
                Relevant Courses
              </label>
              <p className="text-sm text-gray-500 mb-2">
                List relevant courses (comma-separated)
              </p>
              <input
                type="text"
                value={currentEducation.courses?.join(', ') || ''}
                onChange={(e) => handleCoursesChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] sm:text-sm"
                placeholder="Data Structures, Algorithms, Machine Learning"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#020202]">
                Achievements & Activities
              </label>
              <p className="text-sm text-gray-500 mb-2">
                List academic achievements, honors, and extracurricular activities (one per line)
              </p>
              <div className="mb-3">
                <RichTextEditor
                  value={currentEducation.achievements ? currentEducation.achievements.join('\n') : ''}
                  onChange={(value) => {
                    const achievements = value
                      .replace(/<[^>]*>/g, '')
                      .split(/[\n]/)
                      .map(item => item.trim())
                      .filter(item => item.length > 0);
                    
                    setCurrentEducation({ ...currentEducation, achievements });
                  }}
                  minHeight="120px"
                  placeholder="Describe your academic achievements, relevant courses, projects, and honors..."
                  aiEnabled={true}
                  sectionType="education"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditIndex(null);
                setCurrentEducation({
                  institution: '',
                  degree: '',
                  field: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  gpa: '',
                  achievements: [],
                  courses: []
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#020202] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddEducation}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#eb3d24] hover:bg-[#d02e17]"
            >
              {editIndex !== null ? 'Save Changes' : 'Add Education'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {education.map((edu, index) => (
          <div
            key={index}
            className="bg-[#fbfbfb] p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-gray-900">{edu.institution}</h3>
                  <p className="text-sm text-gray-600">
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </p>
                  {edu.location && (
                    <p className="text-sm text-gray-500">{edu.location}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {edu.startDate}
                  {edu.endDate && ` - ${edu.endDate}`}
                </p>
                {edu.gpa && (
                  <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                )}
                {edu.courses && edu.courses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {edu.courses.map((course, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                )}
                {edu.achievements && edu.achievements.length > 0 && (
                  <div className="mb-3">
                    <RichTextEditor
                      value={edu.achievements.join('\n')}
                      onChange={(value) => {
                        const achievements = value
                          .replace(/<[^>]*>/g, '')
                          .split(/[\n]/)
                          .map(item => item.trim())
                          .filter(item => item.length > 0);
                        
                        const updatedEducation = [...education];
                        updatedEducation[index] = { 
                          ...updatedEducation[index], 
                          achievements 
                        };
                        onChange(updatedEducation);
                      }}
                      minHeight="120px"
                      placeholder="Describe your academic achievements, relevant courses, projects, and honors..."
                      aiEnabled={true}
                      sectionType="education"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditEducation(index)}
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 