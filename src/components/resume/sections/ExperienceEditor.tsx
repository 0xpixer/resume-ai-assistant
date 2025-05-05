'use client';

import React, { useState, useCallback, memo, useEffect } from 'react';
import { ExperienceItem } from '@/types/resume';
import { FiPlus, FiTrash2, FiEdit2, FiChevronUp, FiChevronDown, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import RichTextEditor from '../RichTextEditor';

interface ExperienceEditorProps {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}

// 单个成就条目组件
const AchievementItem = memo(({ 
  achievement, 
  index, 
  onDelete, 
  onUpdate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: { 
  achievement: string,
  index: number, 
  onEdit?: (index: number) => void,
  onDelete: (index: number) => void,
  onUpdate: (index: number, text: string) => void,
  onMoveUp: (index: number) => void,
  onMoveDown: (index: number) => void,
  isFirst: boolean,
  isLast: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(achievement);

  // 当外部achievement变化时，更新text
  useEffect(() => {
    setText(achievement);
  }, [achievement]);

  // 使用useCallback避免不必要的重新渲染
  const handleSave = useCallback(() => {
    if (text.trim()) {
      onUpdate(index, text);
      setIsEditing(false);
    }
  }, [index, onUpdate, text]);

  if (isEditing) {
    return (
      <div className="flex items-start space-x-2 py-1">
        <div className="flex-grow">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#eb3d24] focus:ring-[#eb3d24] text-[#020202]"
            rows={2}
            autoFocus
          />
        </div>
        <div className="flex items-center space-x-1 mt-1">
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
            title="取消"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={handleSave}
            className="text-[#eb3d24] hover:text-[#d02e17] hover:bg-[#fce8e6] p-1 rounded-full transition-colors"
            title="保存"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-start space-x-2 py-1 group hover:bg-gray-50 rounded-md transition-colors duration-200 cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex-grow">
        <div className="text-sm text-[#020202]">
          {achievement}
        </div>
      </div>
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isFirst && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors"
            title="上移"
          >
            <FiArrowUp size={14} />
          </button>
        )}
        {!isLast && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors"
            title="下移"
          >
            <FiArrowDown size={14} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors"
          title="编辑"
        >
          <FiEdit2 size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition-colors"
          title="删除"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
});

AchievementItem.displayName = 'AchievementItem';

// 单个工作经验条目视图组件
const ExperienceItemView = memo(({ 
  experience, 
  index, 
  onEdit, 
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isExpanded, 
  onToggleExpand 
}: { 
  experience: ExperienceItem, 
  index: number, 
  onEdit: (index: number) => void, 
  onDelete: (index: number) => void,
  onMoveUp: (index: number) => void,
  onMoveDown: (index: number) => void,
  isFirst: boolean,
  isLast: boolean,
  isExpanded: boolean, 
  onToggleExpand: (index: number) => void 
}) => {
  return (
    <div 
      className="border border-gray-200 hover:border-[#eb3d24] rounded-md p-4 bg-[#fbfbfb] shadow-sm hover:shadow transition-all duration-200 cursor-pointer group"
      onClick={() => onToggleExpand(index)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {experience.company}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {experience.position}
              </p>
              {experience.location && (
                <p className="text-sm text-gray-500">{experience.location}</p>
              )}
            </div>
            <div className="flex space-x-2">
              {!isFirst && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(index);
                  }}
                  className="text-gray-400 hover:text-[#eb3d24] hover:bg-[#fce8e6] p-1 rounded-full transition-colors"
                  title="上移"
                >
                  <FiArrowUp size={14} />
                </button>
              )}
              {!isLast && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(index);
                  }}
                  className="text-gray-400 hover:text-[#eb3d24] hover:bg-[#fce8e6] p-1 rounded-full transition-colors"
                  title="下移"
                >
                  <FiArrowDown size={14} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(index);
                }}
                className="text-gray-400 hover:text-[#eb3d24] hover:bg-[#fce8e6] p-1 rounded-full transition-colors"
                title="编辑"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition-colors"
                title="删除"
              >
                <FiTrash2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(index);
                }}
                className="text-gray-400 hover:text-[#eb3d24] hover:bg-[#fce8e6] p-1 rounded-full transition-colors"
                title={isExpanded ? "收起" : "展开"}
              >
                {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-between mt-1">
            <div className="text-sm text-gray-500">
              {experience.startDate && (
                <span>
                  {experience.startDate}
                  {experience.endDate ? ` - ${experience.endDate}` : (experience.isCurrentPosition ? ' - Present' : '')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3">
          {experience.achievements && experience.achievements.length > 0 && (
            <div className="space-y-1 pl-2">
              {experience.achievements.map((achievement: string, i: number) => (
                <div key={i} className="flex items-start space-x-2">
                  <div className="w-1 h-1 mt-2 rounded-full bg-gray-600 flex-shrink-0"></div>
                  <div className="text-sm text-gray-800">{achievement}</div>
                </div>
              ))}
            </div>
          )}
          
          {experience.keywords && experience.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {experience.keywords.map((keyword: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ExperienceItemView.displayName = 'ExperienceItemView';

// 主编辑器组件
export default function ExperienceEditor({ experience, onChange }: ExperienceEditorProps) {
  // 状态定义
  const [newExperience, setNewExperience] = useState<ExperienceItem>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrentPosition: false,
    achievements: [],
    keywords: []
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [newAchievement, setNewAchievement] = useState("");
  const [expandedItems, setExpandedItems] = useState<{[key: number]: boolean}>({});

  // 处理经验条目上移
  const handleMoveExperienceUp = useCallback((index: number) => {
    if (index <= 0) return;
    
    const newExperiences = [...experience];
    const temp = newExperiences[index];
    newExperiences[index] = newExperiences[index - 1];
    newExperiences[index - 1] = temp;
    
    onChange(newExperiences);
  }, [experience, onChange]);

  // 处理经验条目下移
  const handleMoveExperienceDown = useCallback((index: number) => {
    if (index >= experience.length - 1) return;
    
    const newExperiences = [...experience];
    const temp = newExperiences[index];
    newExperiences[index] = newExperiences[index + 1];
    newExperiences[index + 1] = temp;
    
    onChange(newExperiences);
  }, [experience, onChange]);

  // 处理成就条目上移
  const handleMoveAchievementUp = useCallback((index: number) => {
    if (!editingExperience || index <= 0) return;
    
    const newAchievements = [...editingExperience.achievements];
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[index - 1];
    newAchievements[index - 1] = temp;
    
    const updatedExperience = {
      ...editingExperience,
      achievements: newAchievements
    };
    
    setEditingExperience(updatedExperience);
    
    // 同步更新主数据源
    if (editingExperienceIndex !== null) {
      const updatedExperiences = [...experience];
      updatedExperiences[editingExperienceIndex] = updatedExperience;
      onChange(updatedExperiences);
    }
  }, [editingExperience, editingExperienceIndex, experience, onChange]);

  // 处理成就条目下移
  const handleMoveAchievementDown = useCallback((index: number) => {
    if (!editingExperience || index >= editingExperience.achievements.length - 1) return;
    
    const newAchievements = [...editingExperience.achievements];
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[index + 1];
    newAchievements[index + 1] = temp;
    
    const updatedExperience = {
      ...editingExperience,
      achievements: newAchievements
    };
    
    setEditingExperience(updatedExperience);
    
    // 同步更新主数据源
    if (editingExperienceIndex !== null) {
      const updatedExperiences = [...experience];
      updatedExperiences[editingExperienceIndex] = updatedExperience;
      onChange(updatedExperiences);
    }
  }, [editingExperience, editingExperienceIndex, experience, onChange]);

  // 添加新的工作经验
  const handleAddExperience = useCallback(() => {
    if (newExperience.company.trim() && newExperience.position.trim()) {
      onChange([newExperience, ...experience]);
      setNewExperience({
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrentPosition: false,
        achievements: [],
        keywords: []
      });
      setIsAddingNew(false);
    }
  }, [newExperience, experience, onChange]);

  // 处理工作经验编辑
  const handleEditExperience = useCallback((index: number) => {
    setEditingExperienceIndex(index);
    setEditingExperience({...experience[index]});
    // 初始化所有条目为展开状态
    setExpandedItems(prev => ({...prev, [index]: true}));
  }, [experience]);

  // 处理删除工作经验
  const handleDeleteExperience = useCallback((index: number) => {
    const updatedExperience = [...experience];
    updatedExperience.splice(index, 1);
    onChange(updatedExperience);
  }, [experience, onChange]);

  // 处理保存编辑中的工作经验
  const handleSaveEditingExperience = useCallback(() => {
    if (editingExperienceIndex !== null && editingExperience) {
      const updatedExperience = [...experience];
      updatedExperience[editingExperienceIndex] = editingExperience;
      onChange(updatedExperience);
      setEditingExperienceIndex(null);
      setEditingExperience(null);
    }
  }, [editingExperienceIndex, editingExperience, experience, onChange]);

  // 处理取消编辑工作经验
  const handleCancelEditingExperience = useCallback(() => {
    setEditingExperienceIndex(null);
    setEditingExperience(null);
  }, []);

  // 处理添加成就
  const handleAddAchievement = useCallback(() => {
    if (newAchievement.trim() && editingExperience) {
      const updatedExperience = {
        ...editingExperience,
        achievements: [newAchievement, ...editingExperience.achievements]
      };
      
      setEditingExperience(updatedExperience);
      setNewAchievement('');
      
      // 同步更新主数据源
      if (editingExperienceIndex !== null) {
        const updatedExperiences = [...experience];
        updatedExperiences[editingExperienceIndex] = updatedExperience;
        onChange(updatedExperiences);
      }
    }
  }, [newAchievement, editingExperience, editingExperienceIndex, experience, onChange]);

  // 处理删除成就
  const handleDeleteAchievement = useCallback((index: number) => {
    if (editingExperience) {
      const updatedAchievements = [...editingExperience.achievements];
      updatedAchievements.splice(index, 1);
      
      const updatedExperience = {
        ...editingExperience,
        achievements: updatedAchievements
      };
      
      setEditingExperience(updatedExperience);
      
      // 同步更新主数据源
      if (editingExperienceIndex !== null) {
        const updatedExperiences = [...experience];
        updatedExperiences[editingExperienceIndex] = updatedExperience;
        onChange(updatedExperiences);
      }
    }
  }, [editingExperience, editingExperienceIndex, experience, onChange]);

  // 处理更新成就
  const handleUpdateAchievement = useCallback((index: number, text: string) => {
    if (editingExperience) {
      const updatedAchievements = [...editingExperience.achievements];
      updatedAchievements[index] = text;
      
      const updatedExperience = {
        ...editingExperience,
        achievements: updatedAchievements
      };
      
      setEditingExperience(updatedExperience);
      
      // 同步更新主数据源
      if (editingExperienceIndex !== null) {
        const updatedExperiences = [...experience];
        updatedExperiences[editingExperienceIndex] = updatedExperience;
        onChange(updatedExperiences);
      }
    }
  }, [editingExperience, editingExperienceIndex, experience, onChange]);

  // 处理关键词变化
  const handleKeywordsChange = useCallback((value: string) => {
    const keywords = value
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword !== '');
    
    if (editingExperience) {
      setEditingExperience({
        ...editingExperience,
        keywords
      });
    } else {
      setNewExperience(prev => ({
        ...prev,
        keywords
      }));
    }
  }, [editingExperience]);

  // 处理富文本编辑器中的成就更改
  const handleAchievementsChange = useCallback((value: string) => {
    const achievements = value
      .replace(/<[^>]*>/g, '')
      .split(/[•\n]/)
      .map(achievement => achievement.trim())
      .filter(achievement => achievement !== '');
    setNewExperience(prev => ({ ...prev, achievements }));
  }, []);

  // 切换展开/折叠状态
  const toggleExpanded = useCallback((index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  // 渲染单个成就条目组件
  const renderAchievementItem = (achievement: string, index: number) => {
    return (
      <AchievementItem
        achievement={achievement}
        index={index}
        onDelete={handleDeleteAchievement}
        onUpdate={handleUpdateAchievement}
        onMoveUp={handleMoveAchievementUp}
        onMoveDown={handleMoveAchievementDown}
        isFirst={index === 0}
        isLast={editingExperience ? index === editingExperience.achievements.length - 1 : false}
      />
    );
  };

  // 渲染单个工作经验条目
  const renderExperienceItem = (exp: ExperienceItem, index: number) => {
    const isExpanded = expandedItems[index] || false;
    
    return (
      <ExperienceItemView 
        experience={exp}
        index={index}
        onEdit={handleEditExperience}
        onDelete={handleDeleteExperience}
        onMoveUp={handleMoveExperienceUp}
        onMoveDown={handleMoveExperienceDown}
        isFirst={index === 0}
        isLast={index === experience.length - 1}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpanded}
      />
    );
  };

  // 渲染编辑中的工作经验
  const renderEditingExperience = () => {
    if (!editingExperience) return null;
    
    return (
      <div className="bg-[#fbfbfb] p-4 border border-gray-300 rounded-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                公司名称
              </label>
              <input
                type="text"
                value={editingExperience.company}
                onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Google"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                职位
              </label>
              <input
                type="text"
                value={editingExperience.position}
                onChange={(e) => setEditingExperience({ ...editingExperience, position: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Senior Software Engineer"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                地点
              </label>
              <input
                type="text"
                value={editingExperience.location || ''}
                onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Mountain View, CA"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                开始日期
              </label>
              <input
                type="month"
                value={editingExperience.startDate || ''}
                onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                结束日期
              </label>
              <div className="flex items-center">
                <input
                  type="month"
                  value={editingExperience.endDate || ''}
                  onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={editingExperience.isCurrentPosition}
                />
              </div>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={editingExperience.isCurrentPosition}
                    onChange={(e) => setEditingExperience({ 
                      ...editingExperience, 
                      isCurrentPosition: e.target.checked,
                      endDate: e.target.checked ? '' : editingExperience.endDate 
                    })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">当前职位</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">主要成就</label>
              
              <div className="border border-gray-300 rounded-md p-3 mb-3">
                <div className="space-y-2">
                  {editingExperience.achievements.map((achievement, index) => (
                    <div key={`achievement-${index}`} className="bg-[#fbfbfb]">
                      {renderAchievementItem(achievement, index)}
                    </div>
                  ))}
                </div>
                
                <div className="flex mt-3">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="添加新成就..."
                    className="flex-grow text-sm border border-gray-300 rounded-l-md p-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAchievement();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddAchievement}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-r-md"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                关键词
              </label>
              <p className="text-sm text-gray-500 mb-2">
                添加相关技能和技术（逗号分隔）
              </p>
              <input
                type="text"
                value={editingExperience.keywords?.join(', ') || ''}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="React, TypeScript, Node.js"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleCancelEditingExperience}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-[#fbfbfb] hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSaveEditingExperience}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            保存
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {editingExperienceIndex === -1 && !isAddingNew && (
        <div className="flex justify-between">
          <div>
            {/* 删除这个标题 */}
          </div>
          <div>
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#eb3d24] hover:bg-[#d02e17]"
            >
              <FiPlus className="mr-2 -ml-1 h-4 w-4" />
              Add Experience
            </button>
          </div>
        </div>
      )}
      
      {isAddingNew && (
        <div className="bg-[#fbfbfb] p-4 border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">添加新工作经验</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  公司名称
                </label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Google"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  职位
                </label>
                <input
                  type="text"
                  value={newExperience.position}
                  onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  地点
                </label>
                <input
                  type="text"
                  value={newExperience.location || ''}
                  onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Mountain View, CA"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  开始日期
                </label>
                <input
                  type="month"
                  value={newExperience.startDate || ''}
                  onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  结束日期
                </label>
                <div className="flex items-center">
                  <input
                    type="month"
                    value={newExperience.endDate || ''}
                    onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={newExperience.isCurrentPosition}
                  />
                </div>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={newExperience.isCurrentPosition}
                      onChange={(e) => setNewExperience({ 
                        ...newExperience, 
                        isCurrentPosition: e.target.checked,
                        endDate: e.target.checked ? '' : newExperience.endDate 
                      })}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">当前职位</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  主要成就
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  描述您在此职位上的主要成就和贡献
                </p>
                <RichTextEditor 
                  value=""
                  onChange={handleAchievementsChange}
                  placeholder="• 主导了产品的发布，增加了30%的用户增长
• 优化了工作流程，减少了20%的处理时间
• 管理了一个5人团队，超额完成季度目标"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  关键词
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  添加相关技能和技术（逗号分隔）
                </p>
                <input
                  type="text"
                  value={newExperience.keywords?.join(', ') || ''}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleAddExperience}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              添加经验
            </button>
          </div>
        </div>
      )}

      {editingExperienceIndex !== null && renderEditingExperience()}

      {editingExperienceIndex === null && (
        <div className="space-y-2">
          {experience.map((exp, index) => (
            <div key={`experience-${index}`} className="relative">
              {renderExperienceItem(exp, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 