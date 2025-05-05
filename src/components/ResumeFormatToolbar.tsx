import React from 'react';
import { FaFont, FaAlignLeft, FaAlignCenter, FaAlignRight, FaPalette, FaBorderAll, FaList, FaCompress, FaExpand, FaArrowsAltH, FaArrowsAltV, FaTextHeight } from 'react-icons/fa';
import { FormatOptions } from '@/types/format';
import ColorPicker from './common/ColorPicker';
import SpacingControl from './common/SpacingControl';

interface ResumeFormatToolbarProps {
  formatOptions: FormatOptions;
  onChange: (options: Partial<FormatOptions>) => void;
}

const ResumeFormatToolbar: React.FC<ResumeFormatToolbarProps> = ({
  formatOptions,
  onChange
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-white border-b">
      {/* 字体选择 */}
      <div className="relative group">
        <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
          <FaFont className="mr-1" />
          <span className="text-xs">Font</span>
          <span className="ml-1 text-xs font-medium">{formatOptions.fontFamily}</span>
        </button>
        <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
          {['sans', 'serif', 'mono'].map((font) => (
            <button
              key={font}
              className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.fontFamily === font ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
              onClick={() => onChange({ fontFamily: font as FormatOptions['fontFamily'] })}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* 字体大小 */}
      <div className="relative group">
        <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
          <span className="text-xs">Size</span>
          <span className="ml-1 text-xs font-medium">{formatOptions.fontSize}</span>
        </button>
        <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.fontSize === size ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
              onClick={() => onChange({ fontSize: size as FormatOptions['fontSize'] })}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 标题对齐 */}
      <div className="relative group">
        <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
          <FaAlignLeft className="mr-1" />
          <span className="text-xs">Heading</span>
        </button>
        <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
          {[
            { icon: <FaAlignLeft className="mr-2" />, value: 'left' },
            { icon: <FaAlignCenter className="mr-2" />, value: 'center' },
            { icon: <FaAlignRight className="mr-2" />, value: 'right' }
          ].map(({ icon, value }) => (
            <button
              key={value}
              className={`w-full flex items-center px-3 py-1 rounded text-sm ${formatOptions.headingAlign === value ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
              onClick={() => onChange({ headingAlign: value as FormatOptions['headingAlign'] })}
            >
              {icon}
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* 内容对齐 */}
      <div className="relative group">
        <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
          <FaAlignLeft className="mr-1" />
          <span className="text-xs">Content</span>
        </button>
        <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
          {[
            { icon: <FaAlignLeft className="mr-2" />, value: 'left' },
            { icon: <FaAlignCenter className="mr-2" />, value: 'center' },
            { icon: <FaAlignRight className="mr-2" />, value: 'right' }
          ].map(({ icon, value }) => (
            <button
              key={value}
              className={`w-full flex items-center px-3 py-1 rounded text-sm ${formatOptions.contentAlign === value ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
              onClick={() => onChange({ contentAlign: value as FormatOptions['contentAlign'] })}
            >
              {icon}
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色选择器 */}
      <ColorPicker
        color={formatOptions.primaryColor}
        onChange={(color) => onChange({ primaryColor: color })}
        title="Primary Color"
      />
      <ColorPicker
        color={formatOptions.secondaryColor}
        onChange={(color) => onChange({ secondaryColor: color })}
        title="Secondary Color"
      />

      {/* 间距控制 */}
      <SpacingControl
        value={formatOptions.sectionSpacing}
        onChange={(value) => onChange({ sectionSpacing: value })}
        icon={<FaArrowsAltV className="mr-1" />}
        label="Section"
      />
      <SpacingControl
        value={formatOptions.paragraphSpacing}
        onChange={(value) => onChange({ paragraphSpacing: value })}
        icon={<FaTextHeight className="mr-1" />}
        label="Paragraph"
      />
      <SpacingControl
        value={formatOptions.lineSpacing}
        onChange={(value) => onChange({ lineSpacing: value })}
        icon={<FaArrowsAltH className="mr-1" />}
        label="Line"
      />

      {/* 其他选项 */}
      <button
        className={`p-1.5 rounded ${formatOptions.showBorders ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
        onClick={() => onChange({ showBorders: !formatOptions.showBorders })}
        title="Show Borders"
      >
        <FaBorderAll size={14} />
      </button>
      <button
        className={`p-1.5 rounded ${formatOptions.showBullets ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
        onClick={() => onChange({ showBullets: !formatOptions.showBullets })}
        title="Show Bullets"
      >
        <FaList size={14} />
      </button>
      <button
        className={`p-1.5 rounded ${formatOptions.compactLayout ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
        onClick={() => onChange({ compactLayout: !formatOptions.compactLayout })}
        title="Compact Layout"
      >
        {formatOptions.compactLayout ? <FaCompress size={14} /> : <FaExpand size={14} />}
      </button>
    </div>
  );
};

export default ResumeFormatToolbar; 