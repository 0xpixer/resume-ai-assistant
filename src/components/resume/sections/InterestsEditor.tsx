'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface InterestsEditorProps {
  interests: string[];
  onChange: (interests: string[]) => void;
}

export default function InterestsEditor({ interests, onChange }: InterestsEditorProps) {
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      onChange([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    const updatedInterests = interests.filter((_, i) => i !== index);
    onChange(updatedInterests);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Interests</h2>
        <p className="text-sm text-gray-500">Add your hobbies and personal interests.</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
          placeholder="Add a new interest"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={handleAddInterest}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FiPlus className="mr-2 -ml-1 h-4 w-4" />
          Add
        </button>
      </div>

      <div className="space-y-2">
        {interests.map((interest, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-[#fbfbfb] rounded-lg shadow"
          >
            <span className="text-gray-900">{interest}</span>
            <button
              type="button"
              onClick={() => handleRemoveInterest(index)}
              className="text-gray-400 hover:text-red-600"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 