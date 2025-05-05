import React from 'react';

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavButtons?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  onPrevious,
  onNext,
  showNavButtons = true,
  nextButtonText = "Continue",
  prevButtonText = "Back",
  isNextDisabled = false,
  isPrevDisabled = false
}) => {
  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        {showNavButtons && (
          <button
            onClick={onPrevious}
            disabled={isPrevDisabled || !onPrevious}
            className={`px-4 py-2 rounded text-sm font-medium ${
              isPrevDisabled || !onPrevious
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-[#020202] hover:bg-gray-300'
            }`}
          >
            {prevButtonText}
          </button>
        )}

        {/* Steps Indicator */}
        <div className="flex items-center justify-center flex-1 mx-4">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    index + 1 < currentStep 
                      ? 'bg-[#eb3d24] border-[#eb3d24] text-white' 
                      : index + 1 === currentStep
                        ? 'bg-[#fbfbfb] border-[#eb3d24] text-[#eb3d24]' 
                        : 'bg-[#fbfbfb] border-gray-300 text-[#020202]'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <div className={`absolute -bottom-6 w-max text-xs font-medium ${
                  index + 1 === currentStep ? 'text-[#eb3d24]' : 'text-[#020202]'
                }`}>
                  {step}
                </div>
              </div>
              
              {/* Connector Line (except after last step) */}
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-2 max-w-[100px] ${
                    index + 1 < currentStep ? 'bg-[#eb3d24]' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        {showNavButtons && (
          <button
            onClick={onNext}
            disabled={isNextDisabled || !onNext}
            className={`px-4 py-2 rounded text-sm font-medium ${
              isNextDisabled || !onNext
                ? 'bg-[#f09085] text-white cursor-not-allowed'
                : 'bg-[#eb3d24] text-white hover:bg-[#d02e17]'
            }`}
          >
            {nextButtonText}
          </button>
        )}
      </div>
      <div className="h-6"></div> {/* Space for step labels */}
    </div>
  );
};

export default StepProgress; 