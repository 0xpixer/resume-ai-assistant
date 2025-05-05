'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { EducationItem } from '@/types/resume';
import { FiPlus, FiBook, FiTrash2, FiEdit, FiMapPin } from 'react-icons/fi';

interface EducationEditorProps {
  education: EducationItem[];
  onChange: (education: EducationItem[]) => void;
}

export default function EducationEditor({ education, onChange }: EducationEditorProps) {
  const t = useTranslations('resume.editor.education');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentItem, setCurrentItem] = useState<EducationItem>({
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    achievements: [],
    courses: []
  });

  const handleAdd = () => {
    setIsAdding(true);
    setCurrentItem({
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      achievements: [],
      courses: []
    });
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentItem({ ...education[index] });
  };

  const handleDelete = (index: number) => {
    const newEducation = [...education];
    newEducation.splice(index, 1);
    onChange(newEducation);
  };

  const handleSave = () => {
    const newEducation = [...education];
    
    if (editIndex !== null) {
      newEducation[editIndex] = currentItem;
    } else {
      newEducation.push(currentItem);
    }
    
    onChange(newEducation);
    setEditIndex(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setIsAdding(false);
  };

  const handleInputChange = (field: keyof EducationItem, value: string | string[]) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const handleArrayInputChange = (field: 'achievements' | 'courses', value: string) => {
