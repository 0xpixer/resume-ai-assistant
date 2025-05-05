'use client';

import React, { useState } from 'react';
import DateRangePicker from '../ui/DateRangePicker';
import RichTextEditor from './RichTextEditor';

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  current?: boolean;
}

interface EducationEditorProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  onChange,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(education.length > 0 ? 0 : null);

  const handleChange = (index: number, field: keyof Education, value: string | boolean) => {
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    };
    
    if (field === 'current' && value === true) {
      updatedEducation[index].endDate = '';
    }
    
    onChange(updatedEducation);
  };

  const handleAdd = () => {
    const newEdu: Education = {
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false,
    };
    onChange([newEdu, ...education]);
    setActiveIndex(0);
  };

  const handleRemove = (index: number) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    onChange(updatedEducation);
    
    if (activeIndex === index) {
      setActiveIndex(updatedEducation.length > 0 ? 0 : null);
    } else if (activeIndex !== null && activeIndex > index) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleDateChange = (index: number, startDate: string, endDate: string) => {
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      startDate,
      endDate,
    };
    onChange(updatedEducation);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">教育经历</h3>
        <button
          type="button"
          onClick={handleAdd}
          className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          添加教育
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-gray-500 text-sm italic">暂无教育经历，点击"添加教育"按钮开始添加</div>
      ) : (
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4 bg-[#fbfbfb] shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学校</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleChange(index, 'school', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="学校名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学位</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleChange(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="学士/硕士/博士"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">专业</label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => handleChange(index, 'field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="您的专业领域"
                />
              </div>
              
              <div className="mb-4">
                <DateRangePicker
                  startDate={edu.startDate}
                  endDate={edu.endDate}
                  isCurrent={edu.current || false}
                  onDateChange={(startDate, endDate) => handleDateChange(index, startDate, endDate)}
                  onCurrentChange={(current) => handleChange(index, 'current', current)}
                />
              </div>

              <div className="mb-3">
                <RichTextEditor
                  value={edu.description}
                  onChange={(value) => handleChange(index, 'description', value)}
                  minHeight="120px"
                  placeholder="描述您的学习成果、相关课程、项目和荣誉..."
                  aiEnabled={true}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  删除此教育
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationEditor; 