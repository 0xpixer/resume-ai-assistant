import React, { useState, useEffect, useRef } from 'react';
import { Resume } from '@/types/resume';
import { FormatOptions } from '@/types/resume';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getTemplateComponent } from './templates';

interface EnhancedResumePreviewProps {
  resume: Resume;
  formatOptions: FormatOptions;
  template: string;
  scale?: number;
  onUpdateResume?: (updatedResume: Resume | ((prevResume: Resume) => Resume)) => void;
}

const EnhancedResumePreview: React.FC<EnhancedResumePreviewProps> = ({
  resume,
  formatOptions,
  template,
  scale = 1,
  onUpdateResume
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      const observer = new ResizeObserver(() => {
        if (previewRef.current) {
          const pages = Math.ceil(
            previewRef.current.scrollHeight / (previewRef.current.clientHeight * scale)
          );
          setTotalPages(pages);
        }
      });

      observer.observe(previewRef.current);
      return () => observer.disconnect();
    }
  }, [scale]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const TemplateComponent = getTemplateComponent(template);

  if (!TemplateComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Template not found
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={previewRef}
        className="w-full h-full overflow-auto"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
        }}
      >
        <TemplateComponent resume={resume} formatOptions={formatOptions} />
      </div>

      {totalPages > 1 && (
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedResumePreview; 