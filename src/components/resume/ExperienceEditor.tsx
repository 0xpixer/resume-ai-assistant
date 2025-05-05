'use client';

import React, { useState } from 'react';
import DateRangePicker from '../ui/DateRangePicker';
import RichTextEditor from './RichTextEditor';

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current?: boolean;
}

interface ExperienceEditorProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experiences,
  onChange,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(experiences.length > 0 ? 0 : null);

  const handleChange = (index: number, field: keyof Experience, value: string | boolean) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    
    if (field === 'current' && value === true) {
      updatedExperiences[index].endDate = '';
    }
    
    onChange(updatedExperiences);
  };

  const handleAdd = () => {
    const newExp: Experience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false,
    };
    onChange([newExp, ...experiences]);
    setActiveIndex(0);
  };

  const handleRemove = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    onChange(updatedExperiences);
    
    if (activeIndex === index) {
      setActiveIndex(updatedExperiences.length > 0 ? 0 : null);
    } else if (activeIndex !== null && activeIndex > index) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleDateChange = (index: number, startDate: string, endDate: string) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      startDate,
      endDate,
    };
    onChange(updatedExperiences);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">工作经历</h3>
        <button
          type="button"
          onClick={handleAdd}
          className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          添加经历
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-gray-500 text-sm italic">暂无工作经历，点击"添加经历"按钮开始添加</div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 bg-[#fbfbfb] shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleChange(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="公司名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleChange(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="您的职位"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <DateRangePicker
                  startDate={exp.startDate}
                  endDate={exp.endDate}
                  isCurrent={exp.current || false}
                  onDateChange={(startDate, endDate) => handleDateChange(index, startDate, endDate)}
                  onCurrentChange={(current) => handleChange(index, 'current', current)}
                />
              </div>

              <div className="mb-3">
                <RichTextEditor
                  value={exp.description}
                  onChange={(value) => handleChange(index, 'description', value)}
                  minHeight="120px"
                  placeholder="描述您的工作职责、成就和使用的技能..."
                  aiEnabled={true}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  删除此经历
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceEditor; 