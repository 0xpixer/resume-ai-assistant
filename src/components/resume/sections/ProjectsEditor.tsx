'use client';

import React, { useState } from 'react';
import { ProjectItem } from '@/types/resume';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

interface ProjectsEditorProps {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
}

export default function ProjectsEditor({ projects, onChange }: ProjectsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectItem>({
    name: '',
    description: '',
    role: '',
    url: '',
    startDate: '',
    endDate: '',
    technologies: [],
    achievements: []
  });

  const handleAddProject = () => {
    if (currentProject.name.trim()) {
      if (editIndex !== null) {
        const updatedProjects = [...projects];
        updatedProjects[editIndex] = currentProject;
        onChange(updatedProjects);
      } else {
        onChange([...projects, currentProject]);
      }
      setCurrentProject({
        name: '',
        description: '',
        role: '',
        url: '',
        startDate: '',
        endDate: '',
        technologies: [],
        achievements: []
      });
      setIsEditing(false);
      setEditIndex(null);
    }
  };

  const handleEditProject = (index: number) => {
    setCurrentProject(projects[index]);
    setEditIndex(index);
    setIsEditing(true);
  };

  const handleRemoveProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    onChange(updatedProjects);
  };

  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
    setCurrentProject({ ...currentProject, technologies });
  };

  const handleAchievementsChange = (value: string) => {
    const achievements = value.split('\n').map(achievement => achievement.trim()).filter(achievement => achievement !== '');
    setCurrentProject({ ...currentProject, achievements });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Add your notable projects and their achievements.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#eb3d24] hover:bg-[#d02e17]"
          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            Add Project
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-[#fbfbfb] p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="E-commerce Platform"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                value={currentProject.role || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Lead Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project URL
              </label>
              <input
                type="url"
                value={currentProject.url || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://github.com/username/project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="month"
                value={currentProject.startDate || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="month"
                value={currentProject.endDate || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Technologies Used
              </label>
              <input
                type="text"
                value={currentProject.technologies?.join(', ') || ''}
                onChange={(e) => handleTechnologiesChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="React, Node.js, MongoDB (comma-separated)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={currentProject.description || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Brief description of the project and its goals"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Key Achievements
              </label>
              <p className="text-sm text-gray-500 mb-2">
                List your achievements and contributions (one per line)
              </p>
              <textarea
                value={currentProject.achievements?.join('\n') || ''}
                onChange={(e) => handleAchievementsChange(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="- Increased performance by 50%&#10;- Implemented new features&#10;- Reduced bug count by 30%"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditIndex(null);
                setCurrentProject({
                  name: '',
                  description: '',
                  role: '',
                  url: '',
                  startDate: '',
                  endDate: '',
                  technologies: [],
                  achievements: []
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddProject}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {editIndex !== null ? 'Update' : 'Add'} Project
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-[#fbfbfb] p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                {project.role && (
                  <p className="text-sm text-gray-600">{project.role}</p>
                )}
                <p className="text-sm text-gray-500">
                  {project.startDate && `${project.startDate}`}
                  {project.endDate && ` - ${project.endDate}`}
                </p>
                {project.description && (
                  <p className="text-sm text-gray-600">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.achievements && project.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {project.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View Project
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditProject(index)}
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
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