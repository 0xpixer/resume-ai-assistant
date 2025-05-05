'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

interface LanguageItem {
  name: string;
  proficiency?: string;
}

interface LanguagesEditorProps {
  languages: LanguageItem[];
  onChange: (languages: LanguageItem[]) => void;
}

export default function LanguagesEditor({ languages, onChange }: LanguagesEditorProps) {
  const t = useTranslations('resume.editor');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageItem>({
    name: '',
    proficiency: 'Intermediate'
  });

