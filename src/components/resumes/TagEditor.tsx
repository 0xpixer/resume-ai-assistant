'use client';

import React, { useState, useEffect, useRef } from 'react';
import TagBadge from './TagBadge';

interface TagEditorProps {
  isOpen: boolean;
  onClose: () => void;
  tags: string[];
  onSave: (tags: string[]) => void;
}

const TagEditor: React.FC<TagEditorProps> = ({
  isOpen,
  onClose,
  tags,
  onSave,
}) => {
  const [currentTags, setCurrentTags] = useState<string[]>(tags);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus the input when the modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Handle click outside to close the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const handleAddTag = () => {
    const tag = inputValue.trim();
    if (tag && !currentTags.includes(tag)) {
      setCurrentTags([...currentTags, tag]);
      setInputValue('');
      inputRef.current?.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setCurrentTags(currentTags.filter(t => t !== tag));
  };
  
  const handleSave = () => {
    onSave(currentTags);
  };
  
  // Common tag suggestions
  const suggestions = [
    'technical', 'software', 'marketing', 'design', 'management', 
    'data', 'finance', 'sales', 'research', 'entry-level', 'senior'
  ].filter(tag => !currentTags.includes(tag));
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-[#fbfbfb] rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Tags</h3>
        
        <div className="mb-4">
          <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700 mb-1">
            Add Tags
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="tag-input"
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
              placeholder="Enter tag name"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 8).map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setCurrentTags([...currentTags, suggestion]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Current tags:</p>
          {currentTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentTags.map(tag => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onRemove={() => handleRemoveTag(tag)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">No tags yet</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-[#fbfbfb] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagEditor; 