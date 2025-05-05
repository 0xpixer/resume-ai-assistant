import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface SpacingControlProps {
  value: 'small' | 'medium' | 'large';
  onChange: (value: 'small' | 'medium' | 'large') => void;
  icon: React.ReactNode;
  label: string;
}

const SpacingControl: React.FC<SpacingControlProps> = ({
  value,
  onChange,
  icon,
  label
}) => {
  return (
    <div className="relative group">
      <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
        {icon}
        <span className="text-xs">{label}</span>
        <span className="ml-1 text-xs font-medium">
          {value === 'small' ? '1' : value === 'medium' ? '2' : '3'}
        </span>
        <FaChevronDown className="ml-1 text-xs" />
      </button>
      <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
        {(['small', 'medium', 'large'] as const).map((spacing) => (
          <button
            key={spacing}
            className={`w-full text-left px-3 py-1 rounded text-sm ${value === spacing ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => onChange(spacing)}
          >
            {spacing === 'small' ? '1' : spacing === 'medium' ? '2' : '3'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpacingControl; 