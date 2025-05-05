'use client';

import { useState, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { CertificationItem } from '@/types/resume';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCalendar } from 'react-icons/fi';

interface CertificationsEditorProps {
  certifications: CertificationItem[];
  onChange: (certifications: CertificationItem[]) => void;
}

export default function CertificationsEditor({ certifications, onChange }: CertificationsEditorProps) {
  const t = useTranslations('resume.editor');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentCert, setCurrentCert] = useState<CertificationItem>({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    url: '',
    description: ''
  });

