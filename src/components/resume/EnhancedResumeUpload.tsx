'use client';

import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import RawTextViewer from '@/components/common/RawTextViewer';
import LoadingOverlay from '@/components/common/LoadingOverlay';

// 样式常量
const uploadArea = {
  border: '2px dashed #cbd5e0',
  borderRadius: '0.5rem',
  padding: '2rem',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
};

const dragActiveStyle = {
  ...uploadArea,
  borderColor: '#4299e1',
  backgroundColor: '#ebf8ff',
};

export default function EnhancedResumeUpload({ onResumeData }: { onResumeData?: (data: any) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>('');
  const [debugMode, setDebugMode] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  // 处理文件选择
  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  // 处理文件验证和设置
  const handleFile = (file: File) => {
    // 重置错误状态
    setUploadError(null);
    setUploadSuccess(false);
    
    console.log('Checking file type:', file.type);
    
    // 检查文件类型（更宽松的检查，接受任何包含pdf的MIME类型）
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      console.error('Unsupported file type:', file.type);
      setUploadError('Only PDF files are supported');
      return;
    }
    
    // 检查文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size);
      setUploadError('File size cannot exceed 10MB');
      return;
    }

    console.log('Selected file:', file.name, file.size, file.type);
    
    // 设置选中的文件
    setSelectedFile(file);
    
    // 直接调用文件上传，将文件作为参数传递
    uploadFile(file);
  };

  // 上传文件到服务器
  const uploadFile = async (file?: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setRawText('');
    setParsedData(null);
    setUploadProgress(0);
    setCurrentStep('Uploading Resume');

    const fileToUpload = file || selectedFile;

    try {
      if (!fileToUpload) {
        const errorMsg = 'No file selected';
        console.error(errorMsg);
        setUploadError(errorMsg);
        setIsUploading(false);
        return;
      }
      
      if (!fileToUpload.type.includes('pdf') && !fileToUpload.name.toLowerCase().endsWith('.pdf')) {
        const errorMsg = 'Please upload a PDF file';
        console.error(errorMsg, fileToUpload.type);
        setUploadError(errorMsg);
        setIsUploading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('file', fileToUpload);

      setUploadProgress(20);
      setCurrentStep('Extracting Text');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      try {
        const response = await fetch('/api/resume/openai-parse', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        setUploadProgress(40);
        setCurrentStep('Analyzing Content');

        if (!response.ok) {
          console.error('API response error:', response.status, response.statusText);
          setUploadError(`Server error: ${response.status} ${response.statusText}`);
          setIsUploading(false);
          return;
        }
        
        const responseText = await response.text();
        
        setUploadProgress(60);
        setCurrentStep('Processing Data');

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          setUploadError('Server returned invalid JSON data');
          setIsUploading(false);
          return;
        }
        
        setUploadProgress(80);
        setCurrentStep('Finalizing Results');

        if (data.error) {
          console.error('API returned error:', data.error, data.details || '');
          setUploadError(data.error + (data.details ? `: ${data.details}` : ''));
          setIsUploading(false);
          
          if (data.rawText) {
            setRawText(data.rawText);
          }
          
          if (data.structured) {
            setParsedData(data);
            if (typeof onResumeData === 'function') {
              onResumeData(data);
            }
          }
          return;
        }
        
        if (data.warning) {
          console.warn('API warning:', data.warning);
          setUploadError(data.warning);
        }
        
        if (data.rawText) {
          setRawText(data.rawText);
        } else {
          setRawText('Server did not return raw text');
        }

        if (!data.structured) {
          console.error('Missing structured data in API response');
          setUploadError('Server failed to extract resume data structure');
          setIsUploading(false);
          return;
        }

        setParsedData(data);
        setUploadSuccess(true);
        setUploadError(null);
        setUploadProgress(100);
        setCurrentStep('Complete');
        
        if (typeof onResumeData === 'function') {
          onResumeData(data);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Fetch error:', fetchError);
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            setUploadError('Request timed out. The server took too long to respond.');
          } else {
            setUploadError(`Failed to connect to server: ${fetchError.message}`);
          }
        } else {
          setUploadError('Failed to connect to server: Unknown error');
        }
        setIsUploading(false);
        return;
      }
    } catch (error) {
      console.error('Error during upload:', error);
      setUploadError('Error during upload: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  // Render parsed results area
  const renderSuccessMessage = () => {
    if (!uploadSuccess) return null;
    
    return (
      <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
        <h3 className="font-semibold">Resume parsing successful!</h3>
        <p>File has been successfully uploaded and parsed.</p>
        <div className="mt-2">
          <button
            onClick={() => {
              setUploadSuccess(false);
              setSelectedFile(null);
              setDragActive(false);
            }}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Upload another file
          </button>
        </div>
      </div>
    );
  };

  // 在组件底部添加调试区域
  const renderDebugInfo = () => {
    if (!debugMode) return null;
    
    return (
      <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm">Debug Information</h3>
          <button 
            onClick={() => setDebugMode(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        {rawText ? (
          <div>
            <p className="text-xs text-gray-500 mb-1">Original text ({rawText.length} characters):</p>
            <pre className="text-xs bg-[#fbfbfb] p-2 rounded border overflow-auto max-h-40">
              {rawText.substring(0, 1000)}
              {rawText.length > 1000 ? "..." : ""}
            </pre>
          </div>
        ) : (
          <p className="text-xs text-gray-500">No original text</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <LoadingOverlay 
        isLoading={isUploading} 
        currentStep={currentStep} 
        progress={uploadProgress} 
      />

      {!uploadSuccess && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Upload Your Resume</h2>
            <button
              type="button"
              onClick={() => setDebugMode(!debugMode)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>
        </>
      )}

      <div className="my-6">
        <h2 className="text-xl font-bold mb-4">Smart Resume Recognition</h2>
        <p className="mb-4 text-gray-600">
          Upload your resume PDF file, and our AI will automatically recognize and extract key information, including work experience, education background, skills, and more.
        </p>
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelection}
          style={dragActive ? dragActiveStyle : uploadArea}
        >
          {!selectedFile && !isUploading && !uploadSuccess ? (
            <div>
              <div className="text-4xl mb-2">📄</div>
              <p className="text-lg font-medium mb-2">Drag and drop resume file or click to upload</p>
              <p className="text-sm text-gray-500">Supports PDF files (max 10MB)</p>
            </div>
          ) : selectedFile && !isUploading && !uploadSuccess ? (
            <div>
              <div className="text-4xl mb-2">📋</div>
              <p className="text-lg font-medium mb-2">Selected: {selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to upload
              </p>
            </div>
          ) : isUploading ? (
            <div>
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-lg font-medium mb-2">Processing...</p>
              <p className="text-sm text-gray-500">
                Parsing resume data, this may take a few seconds
              </p>
            </div>
          ) : uploadSuccess ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <FiCheckCircle className="text-green-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Resume Uploaded Successfully</h3>
              <p className="text-gray-600 mb-4">Your resume has been processed and the data has been extracted</p>
              
              {debugMode && <RawTextViewer text={rawText} onClear={() => setRawText('')} />}
            </div>
          ) : null}
          
          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Upload Failed</p>
              <p className="text-sm">{uploadError}</p>
              <p className="text-xs mt-2">
                Please ensure the file is a valid PDF, under 10MB, and has clear, readable content.
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileInputChange}
        />
        
        {renderSuccessMessage()}
        
        {debugMode && renderDebugInfo()}
        
        <div className="mt-6 text-sm text-gray-500">
          <p>👉 Tip: Uploading clearer, well-formatted resume files improves recognition accuracy</p>
          <p>👉 Parsed data can be edited and supplemented in the form</p>
        </div>
      </div>
    </div>
  );
} 