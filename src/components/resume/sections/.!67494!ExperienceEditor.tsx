'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExperienceItem } from '@/types/resume';
import { FiPlus, FiBriefcase, FiTrash2, FiEdit, FiX, FiMoreHorizontal, FiMapPin } from 'react-icons/fi';
import AIContentGenerator from '../AIContentGenerator';

interface ExperienceEditorProps {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}

export default function ExperienceEditor({ experience, onChange }: ExperienceEditorProps) {
  const t = useTranslations('resume.editor.experience');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentItem, setCurrentItem] = useState<ExperienceItem>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrentPosition: false,
    achievements: ['']
  });
  const [activeAchievementIndex, setActiveAchievementIndex] = useState<number | null>(null);

  const handleAdd = () => {
    setIsAdding(true);
    setCurrentItem({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentPosition: false,
      achievements: ['']
    });
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentItem({ ...experience[index] });
  };

  const handleDelete = (index: number) => {
    const newExperience = [...experience];
    newExperience.splice(index, 1);
    onChange(newExperience);
  };

  const handleSave = () => {
    const newExperience = [...experience];
    
