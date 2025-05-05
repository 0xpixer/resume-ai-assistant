import React from 'react';
import { FormatOptions } from '@/types/resume';

export default function ResumeFormatToolbar({ formatOptions, onChange }: { 
  formatOptions: FormatOptions;
  onChange: (options: FormatOptions) => void;
}) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Heading Format */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Heading Style</span>
          <select
            value={formatOptions.headingFont}
            onChange={(e) => onChange({ ...formatOptions, headingFont: e.target.value })}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-[#eb3d24] focus:border-[#eb3d24]"
          >
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>

        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Font Size</span>
          <select
            value={formatOptions.fontSize}
            onChange={(e) => onChange({ ...formatOptions, fontSize: e.target.value })}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-[#eb3d24] focus:border-[#eb3d24]"
          >
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="small">Small</option>
          </select>
        </div>

        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Line Spacing</span>
          <select
            value={formatOptions.lineSpacing}
            onChange={(e) => onChange({ ...formatOptions, lineSpacing: e.target.value })}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-[#eb3d24] focus:border-[#eb3d24]"
          >
            <option value="normal">Normal</option>
            <option value="compact">Compact</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>
      </div>

      {/* Text Format */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Primary Color</span>
          <input
            type="color"
            value={formatOptions.primaryColor}
            onChange={(e) => onChange({ ...formatOptions, primaryColor: e.target.value })}
            className="w-8 h-8 border-0 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Secondary Color</span>
          <input
            type="color"
            value={formatOptions.secondaryColor}
            onChange={(e) => onChange({ ...formatOptions, secondaryColor: e.target.value })}
            className="w-8 h-8 border-0 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formatOptions.showBullets}
              onChange={(e) => onChange({ ...formatOptions, showBullets: e.target.checked })}
              className="mr-2 rounded text-[#eb3d24] focus:ring-[#eb3d24]"
            />
            <span className="text-sm">Show Bullets</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formatOptions.showBorders}
              onChange={(e) => onChange({ ...formatOptions, showBorders: e.target.checked })}
              className="mr-2 rounded text-[#eb3d24] focus:ring-[#eb3d24]"
            />
            <span className="text-sm">Show Borders</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formatOptions.compactLayout}
              onChange={(e) => onChange({ ...formatOptions, compactLayout: e.target.checked })}
              className="mr-2 rounded text-[#eb3d24] focus:ring-[#eb3d24]"
            />
            <span className="text-sm">Compact Layout</span>
          </label>
        </div>
      </div>
    </div>
  );
} 