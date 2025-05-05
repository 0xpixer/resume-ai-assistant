'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ResumeTable from '@/components/resumes/ResumeTable';
import { Resume, ResumeWithMetadata } from '@/types/resume';
import { NavbarContext } from '@/context/NavbarContext';
import PageContainer from '@/components/layout/PageContainer';

export default function MyResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isNavExpanded } = useContext(NavbarContext);
  
  // Fetch resumes from API or local storage
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setIsLoading(true);
        
        // Fetch resumes from the API
        const response = await fetch('/api/resumes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.resumes)) {
          setResumes(data.resumes);
        } else {
          throw new Error('Invalid response format');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching resumes:', err);
        setError('Failed to load resumes. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchResumes();
  }, []);
  
  // Delete resume handler
  const handleDeleteResume = async (id: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }
      
      // Update local state
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== id));
    } catch (err) {
      console.error('Error deleting resume:', err);
      setError('Failed to delete resume. Please try again later.');
    }
  };
  
  // Edit resume handler
  const handleEditResume = (id: string) => {
    console.log(`Editing resume with ID: ${id}`);
    router.push(`/resume/create?id=${id}`);
  };
  
  // Click resume handler
  const handleResumeClick = (id: string) => {
    console.log(`Clicked on resume with ID: ${id}`);
    router.push(`/resume/create?id=${id}`);
  };
  
  // Duplicate resume handler
  const handleDuplicateResume = async (id: string) => {
    try {
      const resumeToDuplicate = resumes.find(resume => resume.id === id);
      if (!resumeToDuplicate) return;
      
      // Create a new resume based on the selected one
      const newResume: ResumeWithMetadata = {
        ...resumeToDuplicate,
        id: `${Date.now()}`, // Generate a new ID
        name: `${resumeToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      
      // Update the state with the new resume
      setResumes(prevResumes => [...prevResumes, newResume]);
    } catch (err) {
      console.error('Error duplicating resume:', err);
      setError('Failed to duplicate resume. Please try again later.');
    }
  };
  
  // Add/edit tag handler
  const handleUpdateTags = async (id: string, tags: string[]) => {
    try {
      const response = await fetch('/api/resumes/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: id,
          tags,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tags');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setResumes(prevResumes => 
          prevResumes.map(resume => 
            resume.id === id ? { ...resume, tags } : resume
          )
        );
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error updating tags:', err);
      setError('Failed to update tags. Please try again later.');
    }
  };
  
  return (
    <PageContainer>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-[#020202]">My Resumes</h1>
          <p className="text-[#020202] mt-2">
            Manage all your resume versions and customize them for different job applications.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb3d24] mx-auto"></div>
              <p className="mt-4 text-[#020202]">Loading resumes...</p>
            </div>
          ) : resumes.length > 0 ? (
            <ResumeTable 
              resumes={resumes} 
              onDelete={handleDeleteResume}
              onEdit={handleEditResume}
              onDuplicate={handleDuplicateResume}
              onUpdateTags={handleUpdateTags}
              onResumeClick={handleResumeClick}
            />
          ) : (
            <div className="p-6 text-center">
              <p className="text-[#020202] mb-4">You don't have any resumes yet.</p>
              <button
                onClick={() => router.push('/resume/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb3d24]"
              >
                Create Your First Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
} 