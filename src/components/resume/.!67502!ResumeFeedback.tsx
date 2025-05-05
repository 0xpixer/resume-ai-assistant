'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiLoader } from 'react-icons/fi';
import { ParsedResume, Resume } from '@/types/resume';

interface ResumeFeedbackProps {
  resumeData: {
    structured?: Resume;
    rawText?: string;
    name?: string;
    title?: string;
    summary?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
  };
}

interface FeedbackItem {
  type: 'success' | 'warning' | 'info';
  section: string;
  message: string;
  suggestion?: string;
}

export default function ResumeFeedback({ resumeData }: ResumeFeedbackProps) {
  const t = useTranslations('resume.feedback');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
