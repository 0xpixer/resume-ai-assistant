import React, { useState, useEffect } from 'react';

const resumeTips = [
  "Keep your resume concise and focused on relevant experience",
  "Use action verbs to describe your achievements",
  "Quantify your accomplishments with numbers and metrics",
  "Tailor your resume to the specific job you're applying for",
  "Proofread carefully for grammar and spelling errors",
  "Include keywords from the job description",
  "Use a clean, professional font and consistent formatting",
  "Highlight your most recent and relevant experience first",
  "Include specific technical skills and certifications",
  "Make sure your contact information is up to date"
];

interface LoadingOverlayProps {
  isLoading: boolean;
  currentStep: string;
  progress: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, currentStep, progress }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  
  // Simulate a completely continuous progress animation
  useEffect(() => {
    if (isLoading) {
      // Reset progress when loading starts
      setSimulatedProgress(0);
      
      // Set up a smooth continuous animation
      const progressInterval = setInterval(() => {
        setSimulatedProgress(prev => {
          // Calculate next progress value
          let nextProgress;
          
          if (prev < 20) {
            // Initial phase - move quickly to 20%
            nextProgress = prev + 0.5;
          } else if (prev < 50) {
            // Middle phase - slow down a bit
            nextProgress = prev + 0.2;
          } else if (prev < 80) {
            // Later phase - slow down more
            nextProgress = prev + 0.1;
          } else if (prev < 95) {
            // Final approach - very slow
            nextProgress = prev + 0.05;
          } else {
            // Hold at 95% until completion
            nextProgress = 95;
          }
          
          // Force to 100% if actual progress is 100 or loading is done
          if (progress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          
          return nextProgress;
        });
      }, 50);
      
      return () => clearInterval(progressInterval);
    } else {
      // If not loading, reset progress
      setSimulatedProgress(0);
    }
  }, [isLoading, progress]);
  
  // Update display progress with smooth animation
  useEffect(() => {
    // If loading is done or progress reaches 100%, immediately set to 100%
    if (!isLoading || progress >= 100) {
      setDisplayProgress(100);
      return;
    }
    
    // Set display progress to the simulated progress
    setDisplayProgress(simulatedProgress);
  }, [isLoading, simulatedProgress, progress]);
  
  // When progress reaches 100%, give a short delay then finalize
  useEffect(() => {
    if (displayProgress >= 100) {
      const finalizeTimeout = setTimeout(() => {
        // This delay ensures the 100% state is visible to the user
      }, 200);
      return () => clearTimeout(finalizeTimeout);
    }
  }, [displayProgress]);

  // Rotate tips every 3 seconds
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % resumeTips.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isLoading) return null;
  
  // Update step label based on progress
  const displayStep = (() => {
    if (displayProgress < 20) return "Uploading Resume";
    if (displayProgress < 40) return "Extracting Text";
    if (displayProgress < 60) return "Analyzing Content";
    if (displayProgress < 80) return "Processing Data";
    if (displayProgress < 95) return "Finalizing Results";
    return "Complete";
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur glass background */}
      <div className="absolute inset-0 backdrop-blur-sm bg-[#171717]/30"></div>
      
      {/* Content container */}
      <div className="relative bg-[#fbfbfb] p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-6">
          <div 
            className="h-full bg-gradient-to-r from-[#eb3d24] to-[#d02e17] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${displayProgress}%` }}
          ></div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center justify-center">
            <div className="text-[#eb3d24] text-3xl font-bold">{Math.round(displayProgress)}%</div>
          </div>
          <div className="flex-1">
            <div className="text-[#171717] font-medium">{displayStep}</div>
            <div className="text-[#171717]/70 text-sm">Processing your resume...</div>
          </div>
        </div>

        {/* Tips carousel */}
        <div className="text-center">
          <div className="min-h-[3rem] flex items-center justify-center">
            <p className="text-[#171717] text-sm transition-opacity duration-300">
              {resumeTips[currentTipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 