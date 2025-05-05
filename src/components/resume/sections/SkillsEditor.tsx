'use client';

import React, { useState, useEffect } from 'react';
import { SkillItem, SkillCategory } from '@/types/resume';
import { FiTrash2 } from 'react-icons/fi';
import RichTextEditor from '../RichTextEditor';

interface SkillsEditorProps {
  skills: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
}

export default function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [simpleSkills, setSimpleSkills] = useState('');
  
  const [newSkill, setNewSkill] = useState<SkillItem>({
    name: '',
    level: 3,
    category: 'technical'
  });

  // 初始化简单编辑模式的文本
  useEffect(() => {
    if (skills.length > 0) {
      const text = skills
        .map(skill => skill.name)
        .join(', ');
      setSimpleSkills(text);
    }
  }, []);

  // 从简单模式更新技能列表
  const updateSkillsFromText = (text: string) => {
    const skillNames = text.split(',').map(name => name.trim()).filter(name => name !== '');
    const updatedSkills = skillNames.map(name => {
      return {
        name: name,
        category: 'technical' as SkillCategory,
        level: 3
      };
    });
    onChange(updatedSkills);
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      onChange([...skills, { ...newSkill }]);
      setNewSkill({
        name: '',
        level: 3,
        category: 'technical'
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    onChange(updatedSkills);
  };

  const handleSkillChange = (index: number, field: keyof SkillItem, value: any) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    onChange(updatedSkills);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">
            Add your professional skills and proficiency levels
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsSimpleMode(!isSimpleMode)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            {isSimpleMode ? 'Switch to Detailed Mode' : 'Switch to Simple Mode'}
          </button>
        </div>
      </div>

      {isSimpleMode ? (
        <div className="mb-4">
          <RichTextEditor
            value={simpleSkills}
            onChange={(value) => {
              setSimpleSkills(value);
              updateSkillsFromText(value.replace(/<[^>]*>/g, ''));
            }}
            minHeight="150px"
            placeholder="List your professional skills, separated by commas, for example:\nJavaScript, React, Node.js, Team Management, Spanish"
            aiEnabled={true}
            sectionType="skills"
          />
        </div>
      ) : (
        // Original detailed editing mode code remains unchanged
        <div>
          {/* Form to add skills section */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-5">
              <label className="block text-sm font-medium text-gray-700">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g.: JavaScript"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skills</option>
                <option value="language">Language</option>
                <option value="tool">Tool</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Proficiency
              </label>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="1">Beginner</option>
                <option value="2">Basic</option>
                <option value="3">Proficient</option>
                <option value="4">Advanced</option>
                <option value="5">Expert</option>
              </select>
            </div>
            <div className="col-span-1 flex items-end">
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>

          {/* Display added skills list */}
          {skills.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Added Skills</h4>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({skill.category}
                        {skill.level && ` - ${['Beginner', 'Basic', 'Proficient', 'Advanced', 'Expert'][skill.level - 1]}`})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 