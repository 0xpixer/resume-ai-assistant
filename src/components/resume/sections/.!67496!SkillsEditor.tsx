'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SkillItem, SkillCategory } from '@/types/resume';
import { FiPlus, FiCode, FiTrash2, FiEdit, FiStar, FiFilter } from 'react-icons/fi';
import AIContentGenerator from '../AIContentGenerator';

interface SkillsEditorProps {
  skills: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
}

export default function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  const t = useTranslations('resume.editor.skills');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [targetJob, setTargetJob] = useState('');
  const [currentItem, setCurrentItem] = useState<SkillItem>({
    name: '',
    level: 3,
    category: 'technical',
    years: 0
  });
  const [filter, setFilter] = useState<SkillCategory | 'all'>('all');

  const categories: SkillCategory[] = ['technical', 'soft', 'language', 'tool', 'other'];

  const handleAdd = () => {
    setIsAdding(true);
    setCurrentItem({
      name: '',
      level: 3,
      category: 'technical',
      years: 0
    });
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentItem({ ...skills[index] });
  };

  const handleDelete = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    onChange(newSkills);
  };

  const handleSave = () => {
    const newSkills = [...skills];
    
    if (editIndex !== null) {
      newSkills[editIndex] = currentItem;
    } else {
      newSkills.push(currentItem);
    }
    
    onChange(newSkills);
    setEditIndex(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setIsAdding(false);
  };

  const handleInputChange = (field: keyof SkillItem, value: string | number | SkillCategory) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const handleAIGenerate = () => {
    setIsUsingAI(true);
  };

  const handleAIContentSave = (content: string) => {
