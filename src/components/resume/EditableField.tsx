import React, { useRef, useEffect } from 'react';
import { Resume, ContactInfo } from '@/types/resume';
import { FaPen } from 'react-icons/fa';

interface EditableFieldProps {
  value: string;
  section: string;
  field: string;
  index?: number;
  className?: string;
  multiline?: boolean;
  editing: any;
  setEditing: (editing: any) => void;
  onUpdateResume: (updatedResume: Resume | ((prevResume: Resume) => Resume)) => void;
  resume?: Resume;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  section,
  field,
  index,
  className = '',
  multiline = false,
  editing,
  setEditing,
  onUpdateResume,
  resume
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && 
        editing.section === section && 
        editing.field === field && 
        editing.index === index && 
        inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing, section, field, index]);

  const startEditing = () => {
    setEditing({ section, field, index });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    }
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const finishEditing = () => {
    if (!inputRef.current) return;
    
    const newValue = inputRef.current.value;
    if (newValue === value) {
      setEditing(null);
      return;
    }

    // 使用函数形式的更新，这样可以获取到最新的 resume 状态
    onUpdateResume((prevResume: Resume) => {
      // 创建一个新的简历副本
      const newResume: Resume = JSON.parse(JSON.stringify(prevResume));
      
      try {
        // 根据不同的部分更新相应的值
        if (section === 'contactInfo') {
          // 更新联系信息
          newResume.contactInfo = {
            ...newResume.contactInfo,
            [field]: newValue
          };
        } 
        else if (section === 'summary') {
          // 直接更新摘要字段
          newResume.summary = newValue;
        }
        else if (section === 'experience' && index !== undefined) {
          // 更新经验信息
          const experiences = [...newResume.experience];
          
          if (field.startsWith('achievements[') && field.endsWith(']')) {
            // 处理成就数组的特定项
            const achievementIndex = parseInt(field.substring(13, field.length - 1));
            const achievements = [...experiences[index].achievements];
            achievements[achievementIndex] = newValue;
            experiences[index] = {
              ...experiences[index],
              achievements
            };
          } else if (field === 'position' || field === 'company' || field === 'location' || 
                    field === 'startDate' || field === 'endDate') {
            // 安全地更新字段
            experiences[index] = {
              ...experiences[index],
              [field]: newValue
            };
          }
          
          newResume.experience = experiences;
        }
        else if (section === 'education' && index !== undefined) {
          // 更新教育信息
          const educations = [...newResume.education];
          
          if (field === 'institution' || field === 'degree' || field === 'field' ||
              field === 'location' || field === 'startDate' || field === 'endDate' || 
              field === 'gpa') {
            educations[index] = {
              ...educations[index],
              [field]: newValue
            };
          }
          
          newResume.education = educations;
        }
        else if (section === 'skills' && index !== undefined) {
          // 更新技能信息
          const skills = [...newResume.skills];
          
          if (field === 'name' || field === 'category') {
            skills[index] = {
              ...skills[index],
              [field]: newValue
            };
          } else if (field === 'level' || field === 'years') {
            skills[index] = {
              ...skills[index],
              [field]: parseInt(newValue)
            };
          }
          
          newResume.skills = skills;
        }
      } catch (error) {
        console.error('Error updating resume:', error);
      }
      
      return newResume;
    });

    setEditing(null);
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const isEditing = editing && 
    editing.section === section && 
    editing.field === field && 
    editing.index === index;

  if (isEditing) {
    return (
      <textarea
        ref={inputRef}
        defaultValue={value}
        className={`w-full bg-white border rounded p-1 ${className}`}
        onBlur={finishEditing}
        onKeyDown={handleKeyDown}
        rows={multiline ? 3 : 1}
        style={{ resize: multiline ? 'vertical' : 'none' }}
      />
    );
  }

  return (
    <div className={`group relative inline-block ${className}`}>
      <span className="whitespace-pre-wrap">{value}</span>
      <button
        onClick={startEditing}
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
      >
        <FaPen size={12} />
      </button>
    </div>
  );
}; 