'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import EnhancedResumeUpload from '@/components/resume/EnhancedResumeUpload';
import ResumeFeedback from '@/components/resume/ResumeFeedback';
import TemplateSelector from '@/components/resume/TemplateSelector';
import ResumeEditor from '@/components/resume/ResumeEditor';
import ResumeFormatEditor, { FormatOptions, defaultFormatOptions } from '@/components/resume/ResumeFormatEditor';
import ResumeFormatToolbar from '@/components/resume/ResumeFormatToolbar';
import EnhancedResumePreview from '@/components/resume/EnhancedResumePreview';
import CollapsibleResumeEditor from '@/components/resume/CollapsibleResumeEditor';
import Navbar from '@/components/layout/Navbar';
import { ParsedResume, Resume } from '@/types/resume';
import { useRouter, useSearchParams } from 'next/navigation';
import LinkedInImportModal from '@/components/modals/LinkedInImportModal';
import ATSChecker from '@/components/resume/ATSChecker';
import StepProgress from '@/components/common/StepProgress';
import { NavbarContext } from '@/context/NavbarContext';
import ResumeFeedbackWithSubscription from '@/components/resume/ResumeFeedbackWithSubscription';
import ATSCheckerWithSubscription from '@/components/resume/ATSCheckerWithSubscription';
import PageContainer from '@/components/layout/PageContainer';
import { FaCloudUploadAlt, FaPencilAlt, FaMagic } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { FiUpload, FiFileText, FiSave } from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';
import RawTextViewer from '@/components/common/RawTextViewer';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { getAvailableTemplates } from '@/components/resume/templates';

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

// 在文件顶部的useEffect之前添加生成默认简历名称的函数
const generateDefaultResumeName = (resume: Resume): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${month}/${day}`;
  const name = resume.contactInfo.name || 'Resume';
  return `${name} ${dateStr} v1`;
};

// 默认格式选项, 重命名为 initialFormatOptions
const initialFormatOptions: FormatOptions = {
  fontFamily: 'sans',
  fontSize: 'medium',
  headingAlign: 'left',
  contentAlign: 'left',
  primaryColor: '#eb3d24',
  secondaryColor: '#606c38',
  showBorders: false,
  showBullets: true,
  compactLayout: false,
  pageMargins: 'normal',
  sectionSpacing: 'medium',
  paragraphSpacing: 'medium',
  lineSpacing: 'medium',
  marginLeft: '2.54cm',
  marginRight: '2.54cm',
  marginTop: '2.54cm',
  marginBottom: '2.54cm',
  template: 'classic'
};

// 紧凑的模板选择器组件
const CompactTemplateSelector = ({ selectedTemplate, onSelectTemplate }: { selectedTemplate: string, onSelectTemplate: (template: string) => void }) => {
  const templates = getAvailableTemplates();
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scrollDown = () => {
    if (containerRef.current) {
      const newPosition = scrollPosition + 200;
      containerRef.current.scrollTop = newPosition;
      setScrollPosition(newPosition);
    }
  };
  
  return (
    <div className="relative">
      <div ref={containerRef} className="grid grid-cols-2 gap-2 overflow-y-auto pb-8">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`cursor-pointer rounded border p-1 ${selectedTemplate === template.id ? 'border-[#eb3d24] ring-2 ring-[#eb3d24]/20' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="aspect-[3/4] bg-gray-100 mb-1 flex items-center justify-center text-xs text-gray-500">
              {/* 这里可以放模板缩略图 */}
              {template.id}
            </div>
            <div className="text-center text-xs truncate">{template.name}</div>
          </div>
        ))}
      </div>
      
      <button 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
        onClick={scrollDown}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default function CreateResumePage() {
  // Simple translation function instead of next-intl
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'createResume': 'Create Resume',
      'uploadResume': 'Upload Resume',
      'uploadResumeDescription': 'Upload your resume PDF file, we will automatically extract information',
      'createWithoutUpload': 'Create from Scratch',
      'importFromLinkedIn': 'Import from LinkedIn',
      'importFromLinkedInDescription': 'Import your LinkedIn profile',
      'editResume': 'Edit Resume Content',
      'editResumeDescription': 'Edit your personal information and resume content',
      'selectTemplate': 'Select Template',
      'selectTemplateDescription': 'Choose a template that suits you',
      'preview': 'Preview',
      'finalizeResume': 'Finalize Resume',
      'finalizeResumeDescription': 'Preview and download your resume',
      'downloadOptions': 'Download Options',
      'downloadDescription': 'Download your resume in PDF format',
      'generating': 'Generating...',
      'downloadPDF': 'Download PDF',
      'shareResume': 'Share Resume',
      'copyLink': 'Copy Link',
      'emailResume': 'Send via Email',
      'back': 'Back',
      'continue': 'Continue',
      'rawExtractedText': 'Raw Extracted Text',
      'noTextExtracted': 'No text extracted',
      'hideRawText': 'Hide Raw Text',
      'showRawText': 'Show Raw Text',
      'formatOptions': 'Format Options',
      'pdfGeneratedTitle': 'PDF Generated Successfully',
      'pdfGeneratedMessage': 'Your resume has been successfully generated',
      'errorTitle': 'Failed to Generate PDF',
      'pdfGenerationError': 'An error occurred while generating the PDF, please try again later',
      'previewAndDownload': 'Preview and Download',
      'saveResumeError': 'Failed to Save Resume'
    };
    return translations[key] || key;
  };
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  const { isNavExpanded } = useContext(NavbarContext);
  
  // 状态
  const [currentStep, setCurrentStep] = useState(1);
  const [resume, setResume] = useState<Resume>(initialResume);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [rawText, setRawText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [showRawText, setShowRawText] = useState(false);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>(initialFormatOptions);
  const [resumeName, setResumeName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  
  // 定义步骤名称
  const stepTitles = ['Edit Resume', 'ATS Check', 'Choose Template'];
  
  // 在useEffect中添加默认简历名称设置
  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) {
        // 如果没有resumeId，设置默认简历名称
        setResumeName(generateDefaultResumeName(resume));
        return;
      }
      
      try {
        setIsUploading(true);
        const response = await fetch(`/api/resumes/${resumeId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch resume: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 添加调试信息
        console.log('Fetched resume data:', data);
        console.log('Has feedback data:', data.resume && data.resume.feedback ? 'Yes' : 'No');
        
        if (data.success && data.resume) {
          setResume(data.resume);
          setResumeName(data.resume.name || generateDefaultResumeName(data.resume));
          // 如果是从列表页面点击进来的，直接跳到编辑步骤
          setCurrentStep(2);
        } else {
          throw new Error('Invalid response format: missing resume data');
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        // 使用更友好的错误提示
        const errorMessage = err instanceof Error ? err.message : 'Failed to load resume. Please try again later.';
        alert(errorMessage);
        // 如果获取失败，重定向到简历列表页面
        router.push('/resumes');
      } finally {
        setIsUploading(false);
      }
    };
    
    fetchResume();
  }, [resumeId, router]);
  
  // 处理模板选择
  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
  };
  
  // 处理简历上传
  const handleResumeUpload = (parsedData: any, rawText: string) => {
    // 更新简历数据
    const resumeData: Resume = parsedData.structured || {
      contactInfo: {
        name: parsedData.name || '',
        title: parsedData.title || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        location: '',
        linkedin: '',
        github: '',
        website: ''
      },
      summary: parsedData.summary || '',
      experience: parsedData.experience || [],
      education: parsedData.education || [],
      skills: parsedData.skills ? parsedData.skills.map((skill: string) => ({ name: skill })) : [],
      projects: [],
      certifications: [],
      languages: []
    };
    
    setResume(resumeData);
    setParsedResume(parsedData);
    setRawText(rawText);
    
    // 进入编辑步骤
    setCurrentStep(2);
  };
  
  // 处理简历更新 - 更新类型签名使其兼容 ResumeEditablePreview 组件
  const handleResumeUpdate = (updatedResume: Resume | ((prevResume: Resume) => Resume)) => {
    if (typeof updatedResume === 'function') {
      setResume(prev => updatedResume(prev));
    } else {
      setResume(updatedResume);
    }
  };
  
  // 处理保存反馈信息
  const handleFeedbackSaved = (feedback: any) => {
    setResumeFeedback(feedback);
    
    // 将反馈信息添加到简历数据中
    if (feedback) {
      const updatedResume = {
        ...resume,
        feedback
      };
      setResume(updatedResume);
    }
  };

  // 上一步
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 生成PDF
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      // 创建一个ParsedResume对象，包含structured属性
      const parsedResume: ParsedResume = {
        name: resume.contactInfo.name,
        title: resume.contactInfo.title || '',
        email: resume.contactInfo.email,
        phone: resume.contactInfo.phone,
        summary: resume.summary,
        skills: resume.skills.map(skill => skill.name), // 将SkillItem[]转换为string[]
        experience: [], // 会使用structured数据，这里可以为空
        education: [], // 会使用structured数据，这里可以为空
        structured: resume // 保存完整的结构化Resume对象
      };

      // 动态导入PDF生成函数，避免服务器端加载
      const { generateResumePdf } = await import('@/lib/pdfGenerator');
      
      await generateResumePdf(parsedResume, {
        template: selectedTemplate as 'classic' | 'modern' | 'minimal' | 'creative',
        filename: `resume-${resume.contactInfo.name || 'untitled'}.pdf`,
        formatOptions: formatOptions
      });
      
      // 使用直接导入的toast函数
      if (typeof window !== 'undefined') {
        alert(t('pdfGeneratedMessage'));
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (typeof window !== 'undefined') {
        alert(t('pdfGenerationError'));
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 切换显示原始文本
  const toggleRawText = () => {
    setShowRawText(!showRawText);
  };
  
  // 处理文件上传点击的函数
  const handleUploadClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.style.display = 'none';
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
          alert('Please upload a PDF file');
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          alert('File size cannot exceed 10MB');
          return;
        }
        
        // Reset any previous errors
        setUploadError(null);
        
        // Start loading overlay without complex progress tracking
        setUploadProgress(0);
        setUploadStep("Processing Resume");
        setIsUploading(true);
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          // Extract text from resume
          const response = await fetch('/api/resume/openai-parse', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to extract resume');
          }
          
          const responseText = await response.text();
          let extractedData;
          try {
            extractedData = JSON.parse(responseText);
          } catch (parseError) {
            throw new Error('Server returned invalid data format');
          }
          
          if (extractedData.error) {
            throw new Error(extractedData.error);
          }
          
          // Try to get feedback, but continue if it fails
          let feedbackData = null;
          try {
            const feedbackRes = await fetch('/api/resume/feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                resumeText: extractedData.rawText || extractedData.text,
                resumeData: extractedData.structured || extractedData
              }),
            });
            
            if (feedbackRes.ok) {
              feedbackData = await feedbackRes.json();
            }
          } catch (error) {
            console.error('Error getting feedback:', error);
            // Non-critical error, continue
          }
          
          // Signal completion
          setUploadProgress(100);
          
          // Process the data
          handleResumeUpload(extractedData, extractedData.rawText || '');
          
          // If we have feedback data, update it
          if (feedbackData) {
            setTimeout(() => {
              setResumeFeedback(feedbackData);
            }, 500);
          }
          
          // Short delay before hiding the loading screen to ensure 100% is shown
          setTimeout(() => {
            setIsUploading(false);
          }, 500);
        } catch (error) {
          console.error('Error uploading resume:', error);
          setIsUploading(false);
          setUploadError(error instanceof Error ? error.message : 'Unknown error');
          alert(`Failed to upload resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleLinkedInImport = (resumeData: ParsedResume) => {
    console.log('从LinkedIn导入的数据:', resumeData);
    handleResumeUpload(resumeData, resumeData.rawText || '');
  };

  // 保存简历
  const saveResume = async () => {
    if (!resumeName.trim()) {
      alert('Please enter a resume name');
      return;
    }
    
    try {
      setIsGeneratingPDF(true);
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
        skills: resume.skills || [],
        // 保存 feedback 数据（如果有）
        feedback: resume.feedback || undefined
      };
      
      const method = resumeId ? 'PUT' : 'POST';
      const url = resumeId ? `/api/resumes/${resumeId}` : '/api/resumes';
      
      console.log('Saving resume to:', url);
      console.log('Resume data:', JSON.stringify(resumeToSave).substring(0, 200) + '...');
      
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
      
      // 获取响应内容
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);
      
      let data;
      try {
        // 尝试解析JSON响应
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Server response is not valid JSON: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to save resume: ${response.status} ${response.statusText}`);
      }
      
      if (data.success) {
        setSaveSuccess(true);
        
        // 如果保存成功，跳转到简历列表页面
        setTimeout(() => {
          router.push('/resumes');
        }, 1000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert(t('saveResumeError') + ': ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 调整AI优化按钮的样式
  const aiButtonClass = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#eb3d24] text-white hover:bg-[#d02e17] transition-colors";

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <LoadingOverlay 
        isLoading={isUploading} 
        currentStep={uploadStep} 
        progress={uploadProgress}
      />
      <Navbar />
      <div className={`flex-1 transition-all duration-300 ${
        isNavExpanded ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'
      }`}>
        <div className="container mx-auto px-4 py-6 h-full">
          {/* 步骤指示器 - 只在第2步及以后显示 */}
          {currentStep >= 2 && (
            <div className="mb-4">
              <StepProgress 
                steps={stepTitles} 
                currentStep={
                  currentStep === 2 ? 1 :
                  currentStep === 3 ? 2 :
                  currentStep === 4 ? 3 : 1
                }
                onPrevious={handlePrevious}
                onNext={() => {
                  if (currentStep < 4) {
                    setCurrentStep(currentStep + 1);
                  } else if (currentStep === 4) {
                    generatePDF();
                  }
                }}
                nextButtonText={currentStep === 4 ? t('downloadPDF') : t('continue')}
                isNextDisabled={isGeneratingPDF}
              />
            </div>
          )}
          
          {/* 步骤1: 选择创建简历的方式 */}
          {currentStep === 1 && (
            <div className="w-full mx-auto h-full flex flex-col">
              <div className="flex flex-col items-center mb-4">
                <h2 className="text-xl font-semibold mb-2 text-[#020202]">Start Creating Your Resume</h2>
                <p className="text-[#020202] text-sm">Choose one of the following methods to create your professional resume</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                {/* 选项1: 上传简历 */}
                <div
                  id="uploadOption"
                  className="relative bg-[#fbfbfb] shadow-[1px_0_5px_rgba(0,0,0,0.05)] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-[1px_0_5px_rgba(0,0,0,0.08)] border border-gray-200"
                  onClick={handleUploadClick}
                >
                  <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-3">
                    <FiUpload className="text-[#eb3d24] w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-[#020202]">Upload Resume</h3>
                  <p className="text-[#020202] text-center text-sm mb-4">
                    Upload an existing resume for AI processing
                  </p>
                  <button className="text-sm bg-[#eb3d24] text-white px-4 py-2 rounded-md hover:bg-[#d02e17] transition-colors">
                    Select File
                  </button>
                  <p className="text-xs text-[#020202] mt-2">Supported format: PDF (Max: 10MB)</p>
                </div>
                
                {/* 选项2: 使用LinkedIn导入 */}
                <div
                  className="bg-[#fbfbfb] shadow-[1px_0_5px_rgba(0,0,0,0.05)] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-[1px_0_5px_rgba(0,0,0,0.08)] border border-gray-200"
                  onClick={() => setIsLinkedInModalOpen(true)}
                >
                  <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-3">
                    <FaLinkedin className="text-[#eb3d24] w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-[#020202]">Import LinkedIn</h3>
                  <p className="text-[#020202] text-center text-sm mb-4">
                    Generate your resume from LinkedIn profile data
                  </p>
                  <button className="text-sm bg-[#eb3d24] text-white px-4 py-2 rounded-md hover:bg-[#d02e17] transition-colors">
                    Import Profile
                  </button>
                  <p className="text-xs text-[#020202] mt-2">Quick and accurate conversion</p>
                </div>

                {/* 选项3: 从头开始创建 */}
                <div
                  className="bg-[#fbfbfb] shadow-[1px_0_5px_rgba(0,0,0,0.05)] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-[1px_0_5px_rgba(0,0,0,0.08)] border border-gray-200"
                  onClick={() => setCurrentStep(2)}
                >
                  <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-3">
                    <FiFileText className="text-[#eb3d24] w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-[#020202]">Start from Scratch</h3>
                  <p className="text-[#020202] text-center text-sm mb-4">
                    Create a new resume with guided assistance
                  </p>
                  <button className="text-sm bg-[#eb3d24] text-white px-4 py-2 rounded-md hover:bg-[#d02e17] transition-colors">
                    Create New
                  </button>
                  <p className="text-xs text-[#020202] mt-2">Fully customizable template</p>
                </div>
              </div>
            </div>
          )}

          {/* 步骤2: 编辑简历内容 + 简历基本评估 */}
          {currentStep === 2 && (
            <div className="w-full mx-auto h-full flex flex-col overflow-hidden">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-md font-semibold text-[#020202]">{t('editResume')}</h2>
                  <p className="text-[#020202] text-xs">{t('editResumeDescription')}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={resumeName}
                      onChange={(e) => setResumeName(e.target.value)}
                      placeholder="Enter resume name"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] focus:ring-[#eb3d24] focus:border-[#eb3d24] text-sm text-[#020202]"
                    />
                  </div>
                  
                  <button
                    onClick={saveResume}
                    disabled={isGeneratingPDF}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-1 focus:ring-[#eb3d24] disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <span className="mr-2">Saving</span>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-4 w-4" />
                        Save Resume
                      </>
                    )}
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-4 text-sm">
                  Resume saved successfully!
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
                <div className="lg:col-span-2 overflow-auto">
                  <CollapsibleResumeEditor
                    resume={resume}
                    onUpdate={handleResumeUpdate}
                  />
                </div>
                
                <div className="overflow-auto bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-4">
                  <h3 className="font-semibold text-sm mb-3 text-[#020202]">Resume Feedback</h3>
                  <ResumeFeedbackWithSubscription
                    resumeData={resume}
                    targetJob=""
                    onFeedbackSaved={handleFeedbackSaved}
                  />
                  
                  {rawText && (
                    <div className="mt-4">
                      <button
                        onClick={toggleRawText}
                        className="text-sm text-[#eb3d24] hover:text-[#d02e17]"
                      >
                        {showRawText ? t('hideRawText') : t('showRawText')}
                      </button>
                      
                      {showRawText && (
                        <RawTextViewer text={rawText} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 步骤3: 编辑简历内容 + ATS检查 */}
          {currentStep === 3 && (
            <div className="w-full mx-auto h-full flex flex-col overflow-hidden">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-md font-semibold text-[#020202]">Job Matching</h2>
                  <p className="text-[#020202] text-xs">Compare your resume with job descriptions</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={resumeName}
                      onChange={(e) => setResumeName(e.target.value)}
                      placeholder="Enter resume name"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] focus:ring-[#eb3d24] focus:border-[#eb3d24] text-sm text-[#020202]"
                    />
                  </div>
                  
                  <button
                    onClick={saveResume}
                    disabled={isGeneratingPDF}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-1 focus:ring-[#eb3d24] disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <span className="mr-2">Saving</span>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-4 w-4" />
                        Save Resume
                      </>
                    )}
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-4 text-sm">
                  Resume saved successfully!
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
                <div className="lg:col-span-2 overflow-auto">
                  <CollapsibleResumeEditor
                    resume={resume}
                    onUpdate={handleResumeUpdate}
                  />
                </div>
                
                <div className="overflow-auto bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-4">
                  <h3 className="font-semibold text-sm mb-3 text-[#020202]">ATS Checker</h3>
                  <ATSCheckerWithSubscription resume={resume} />
                  
                  {rawText && (
                    <div className="mt-4">
                      <button
                        onClick={toggleRawText}
                        className="text-sm text-[#eb3d24] hover:text-[#d02e17]"
                      >
                        {showRawText ? t('hideRawText') : t('showRawText')}
                      </button>
                      
                      {showRawText && (
                        <RawTextViewer text={rawText} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 步骤4: 选择模板和预览下载 (原来的步骤3) */}
          {currentStep === 4 && (
            <div className="h-full flex flex-col overflow-hidden">
              {/* 顶部保存区域 */}
              <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-2 mb-0 sm:mb-0">
                    <h2 className="text-md font-semibold text-[#020202]">{t('selectTemplate')}</h2>
                    <p className="text-[#020202] text-sm hidden sm:inline">Choose a template that suits your style</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={resumeName}
                      onChange={(e) => setResumeName(e.target.value)}
                      placeholder="Enter resume name"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] focus:ring-[#eb3d24] focus:border-[#eb3d24] text-sm w-40 text-[#020202]"
                    />
                    
                    <button
                      onClick={saveResume}
                      disabled={isGeneratingPDF}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-1 focus:ring-[#eb3d24] disabled:opacity-50"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <span className="mr-2">Saving</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-1 focus:ring-[#eb3d24] disabled:opacity-50"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <span className="mr-2">Generating</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </>
                      ) : (
                        t('downloadPDF')
                      )}
                    </button>
                  </div>
                </div>
                
                {saveSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mt-3 text-sm">
                    Resume saved successfully!
                  </div>
                )}
              </div>
              
              {/* 模板选择和预览区域 - 修改后的布局 */}
              <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
                {/* 左侧：模板选择 */}
                <div className="lg:w-1/4 bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-4 overflow-auto">
                  <h3 className="font-medium text-sm mb-3">Template Gallery</h3>
                  <CompactTemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={handleTemplateSelect}
                  />
                </div>
                
                {/* 右侧：预览区域（包含悬浮工具栏） */}
                <div className="lg:w-3/4 bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-4 flex-grow relative overflow-y-auto">
                  <div className="flex flex-col items-center">
                    {/* 工具栏 - 正常显示，不再固定 */}
                    <div className="w-[794px] bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-4 mb-4">
                      <ResumeFormatToolbar formatOptions={formatOptions} onChange={setFormatOptions} />
                    </div>
                    
                    {/* 预览内容 - 移除额外的margin-top */}
                    <div className="w-[794px]">
                      <EnhancedResumePreview 
                        resume={resume} 
                        template={selectedTemplate}
                        formatOptions={formatOptions}
                        onUpdateResume={handleResumeUpdate}
                        scale={1.0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LinkedIn导入模态框 */}
      <LinkedInImportModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
        onImport={handleLinkedInImport}
      />
    </div>
  );
} 