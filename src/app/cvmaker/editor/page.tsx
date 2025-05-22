'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ResumeEditor from '@/components/resume/ResumeEditor';
import { Resume } from '@/types/resume';
import { generateResumePdf } from '@/lib/pdfGenerator';
import { FiSave, FiDownload, FiArrowLeft } from 'react-icons/fi';
import CollapsibleResumeEditor from '@/components/resume/CollapsibleResumeEditor';
import EnhancedResumePreview from '@/components/resume/EnhancedResumePreview';
import ResumeFormatEditor, { FormatOptions, defaultFormatOptions } from '@/components/resume/ResumeFormatEditor';

// 初始简历数据
const initialResume: Resume = {
  contactInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: []
};

// 使用useSearchParams的组件
function ResumeEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  
  const [resume, setResume] = useState<Resume>(initialResume);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'minimal' | 'creative'>('classic');
  const [formatOptions, setFormatOptions] = useState<FormatOptions>(defaultFormatOptions);
  
  // 获取简历数据
  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/resumes/${resumeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch resume');
        }
        
        const data = await response.json();
        
        if (data.success && data.resume) {
          setResume(data.resume);
          setResumeName(data.resume.name || '');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResume();
  }, [resumeId]);
  
  // 更新简历
  const handleUpdateResume = (updatedResume: Resume) => {
    setResume(updatedResume);
  };
  
  // 保存简历
  const handleSaveResume = async () => {
    if (!resumeName.trim()) {
      setError('Please enter a resume name');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      // 确保简历对象包含所有必要的字段
      const resumeToSave = {
        ...resume,
        contactInfo: {
          ...resume.contactInfo,
          // 确保所有必要的字段都有值
          name: resume.contactInfo.name || '',
          title: resume.contactInfo.title || '',
          email: resume.contactInfo.email || '',
          phone: resume.contactInfo.phone || '',
          location: resume.contactInfo.location || '',
          linkedin: resume.contactInfo.linkedin || '',
          github: resume.contactInfo.github || '',
          website: resume.contactInfo.website || ''
        },
        summary: resume.summary || '',
        experience: resume.experience || [],
        education: resume.education || [],
        skills: resume.skills || []
      };
      
      const method = resumeId ? 'PUT' : 'POST';
      const url = resumeId ? `/api/resumes/${resumeId}` : '/api/resumes';
      
      console.log(`Saving resume to ${url} with method ${method}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: resumeName,
          resume: resumeToSave,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${resumeId ? 'update' : 'save'} resume`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSaveSuccess(true);
        
        // 如果是新建的简历，重定向到编辑页面
        if (!resumeId && data.resume && data.resume.id) {
          router.push(`/resume/editor?id=${data.resume.id}`);
        }
        
        // 3秒后隐藏成功消息
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setError(`Failed to save resume: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Generate PDF
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      await generateResumePdf({
        name: resume.contactInfo.name,
        title: resume.contactInfo.title || '',
        email: resume.contactInfo.email,
        phone: resume.contactInfo.phone,
        summary: resume.summary,
        skills: resume.skills.map(skill => skill.name),
        experience: [],
        education: [],
        structured: resume
      }, {
        template: selectedTemplate,
        filename: `resume-${resume.contactInfo.name || 'untitled'}.pdf`,
        formatOptions: {
          fontFamily: 'sans',
          fontSize: 'medium',
          headingAlign: 'left',
          contentAlign: 'left',
          primaryColor: '#2563eb',
          secondaryColor: '#6b7280',
          showBorders: true,
          showBullets: true,
          compactLayout: false
        }
      });
      
      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again later.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/resumes')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={20} />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {resumeId ? 'Edit Resume' : 'Create New Resume'}
              </h1>
              <p className="text-gray-600 mt-1">
                Edit your resume content and save or download
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="Resume Name"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              onClick={handleSaveResume}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Resume
                </>
              )}
            </button>
            
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <>
                  <span className="mr-2">Generating...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>
                  <FiDownload className="mr-2" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
            Resume saved successfully!
          </div>
        )}
        
        {isLoading ? (
          <div className="bg-[#fbfbfb] rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resume...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-[#fbfbfb] rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Resume</h2>
              <ResumeEditor
                resume={resume}
                onUpdate={handleUpdateResume}
              />
            </div>
            
            <div className="bg-[#fbfbfb] rounded-lg shadow p-6 lg:col-span-3">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
              <div className="border border-gray-200 rounded-md p-4">
                <EnhancedResumePreview 
                  resume={resume} 
                  template={selectedTemplate} 
                  formatOptions={formatOptions} 
                  scale={0.8}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 包裹在Suspense中的导出组件
export default function ResumeEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResumeEditorContent />
    </Suspense>
  );
} 