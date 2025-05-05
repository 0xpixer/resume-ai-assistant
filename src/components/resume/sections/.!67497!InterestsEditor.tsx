'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FiPlus, FiX } from 'react-icons/fi';

interface InterestsEditorProps {
  interests: string[];
  onChange: (interests: string[]) => void;
}

export default function InterestsEditor({ interests, onChange }: InterestsEditorProps) {
  const t = useTranslations('resume.editor');
  const [newInterest, setNewInterest] = useState('');

