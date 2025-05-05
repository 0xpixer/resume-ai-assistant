'use client';

import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiCopy, FiTag } from 'react-icons/fi';
import TagBadge from './TagBadge';
import TagEditor from './TagEditor';
import { Resume, ResumeWithMetadata } from '@/types/resume';

interface ResumeTableProps {
  resumes: ResumeWithMetadata[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onResumeClick?: (id: string) => void;
}

const ResumeTable: React.FC<ResumeTableProps> = ({
  resumes,
  onDelete,
  onEdit,
  onDuplicate,
  onUpdateTags,
  onResumeClick,
}) => {
  const [activeTagEditor, setActiveTagEditor] = useState<string | null>(null);
  
  const handleOpenTagEditor = (id: string) => {
    setActiveTagEditor(id);
  };
  
  const handleCloseTagEditor = () => {
    setActiveTagEditor(null);
  };
  
  const handleUpdateTags = (id: string, tags: string[]) => {
    onUpdateTags(id, tags);
    handleCloseTagEditor();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      onDelete(id);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resume
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Matched Job
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Match
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Edited
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tags
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[#fbfbfb] divide-y divide-gray-200">
          {resumes.map((resume) => (
            <tr 
              key={resume.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onResumeClick && onResumeClick(resume.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{resume.name}</div>
                <div className="text-sm text-gray-500">{resume.contactInfo.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {resume.score ? (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {resume.score}%
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{resume.matchedJob || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {resume.match ? (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {resume.match}%
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {resume.createdAt}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {resume.updatedAt}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {resume.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                  <button
                    onClick={() => handleOpenTagEditor(resume.id)}
                    className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    title="Edit tags"
                  >
                    <FiTag size={12} />
                  </button>
                </div>
                {activeTagEditor === resume.id && (
                  <TagEditor
                    isOpen={true}
                    onClose={handleCloseTagEditor}
                    tags={resume.tags}
                    onSave={(tags) => handleUpdateTags(resume.id, tags)}
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(resume.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="编辑简历"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDuplicate(resume.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="复制简历"
                  >
                    <FiCopy size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="text-red-600 hover:text-red-900"
                    title="删除简历"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResumeTable; 