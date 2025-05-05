'use client';

import React from 'react';
import { FiCheck } from 'react-icons/fi';

interface FeaturesListProps {
  features: string[];
}

const FeaturesList: React.FC<FeaturesListProps> = ({ features }) => {
  return (
    <div className="mb-6">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start mb-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
            <FiCheck className="text-green-600" size={12} />
          </div>
          <span className="text-[#020202]">{feature}</span>
        </div>
      ))}
    </div>
  );
};

export default FeaturesList; 