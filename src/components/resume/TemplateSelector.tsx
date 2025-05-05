'use client';

import React from 'react';
import { Resume } from '@/types/resume';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';
import { getAvailableTemplates } from './templates';

export interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
  resume?: Resume;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  resume
}) => {
  const templates = getAvailableTemplates();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Select Template</h2>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-4 -mr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-[3/4] relative">
                <Image
                  src={template.preview}
                  alt={template.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-3 bg-white">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                  <FaCheck size={12} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 