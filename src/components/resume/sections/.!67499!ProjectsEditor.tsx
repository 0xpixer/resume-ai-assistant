'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProjectItem } from '@/types/resume';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCalendar, FiLink } from 'react-icons/fi';

interface ProjectsEditorProps {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
}

export default function ProjectsEditor({ projects, onChange }: ProjectsEditorProps) {
  const t = useTranslations('resume.editor');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectItem>({
    name: '',
    description: '',
    role: '',
    url: '',
    startDate: '',
    endDate: '',
    technologies: [],
    achievements: []
  });
  const [newTechnology, setNewTechnology] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

