'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

interface LanguageItem {
  name: string;
  proficiency: string;
}

interface LanguagesEditorProps {
  languages: LanguageItem[];
  onChange: (languages: LanguageItem[]) => void;
}

const PROFICIENCY_LEVELS = [
  { value: 'Native', label: 'Native' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Basic', label: 'Basic' }
];

export default function LanguagesEditor({ languages, onChange }: LanguagesEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageItem>({
    name: '',
    proficiency: 'Intermediate'
  });

  const handleAddLanguage = () => {
    if (currentLanguage.name.trim()) {
      if (editIndex !== null) {
        const updatedLanguages = [...languages];
        updatedLanguages[editIndex] = currentLanguage;
        onChange(updatedLanguages);
      } else {
        onChange([...languages, { ...currentLanguage }]);
      }
      setCurrentLanguage({
        name: '',
        proficiency: 'Intermediate'
      });
      setIsEditing(false);
      setEditIndex(null);
    }
  };

  const handleEditLanguage = (index: number) => {
    setCurrentLanguage(languages[index]);
    setEditIndex(index);
    setIsEditing(true);
  };

  const handleRemoveLanguage = (index: number) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    onChange(updatedLanguages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Add languages you can communicate in.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#eb3d24] hover:bg-[#d02e17]"
          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            Add Language
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-[#fbfbfb] p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <input
                type="text"
                value={currentLanguage.name}
                onChange={(e) => setCurrentLanguage({ ...currentLanguage, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proficiency Level
              </label>
              <select
                value={currentLanguage.proficiency}
                onChange={(e) => setCurrentLanguage({ ...currentLanguage, proficiency: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditIndex(null);
                setCurrentLanguage({
                  name: '',
                  proficiency: 'Intermediate'
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddLanguage}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {editIndex !== null ? 'Update' : 'Add'} Language
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {languages.map((language, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-[#fbfbfb] rounded-lg shadow"
          >
            <div>
              <h3 className="font-medium text-gray-900">{language.name}</h3>
              <p className="text-sm text-gray-500">{language.proficiency}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleEditLanguage(index)}
                className="text-gray-400 hover:text-indigo-600"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveLanguage(index)}
                className="text-gray-400 hover:text-red-600"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 