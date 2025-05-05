'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaAlignLeft, FaAlignCenter, FaAlignRight, 
  FaFont, FaPalette, FaListUl, FaBorderAll, 
  FaCompressAlt, FaChevronDown, FaMinus, FaPlus,
  FaHeading, FaParagraph, FaRuler, FaLayerGroup,
  FaIndent, FaAlignJustify
} from 'react-icons/fa';
import { FormatOptions } from './ResumeFormatEditor';

interface ResumeFormatToolbarProps {
  formatOptions: FormatOptions;
  onChange: (options: FormatOptions) => void;
}

const ResumeFormatToolbar: React.FC<ResumeFormatToolbarProps> = ({
  formatOptions,
  onChange
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<'primary' | 'secondary'>('primary');
  const primaryColorPickerRef = useRef<HTMLDivElement>(null);
  const secondaryColorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (primaryColorPickerRef.current && !primaryColorPickerRef.current.contains(event.target as Node)) &&
        (secondaryColorPickerRef.current && !secondaryColorPickerRef.current.contains(event.target as Node))
      ) {
        setShowColorPicker(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 预设颜色选项 - 高级配色方案
  const presetColors = [
    '#202020', // 深灰色
    '#eb3d24', // 红色(主色)
    '#606c38', // 橄榄绿色
    '#e27a53', // 橙红色
    '#e2a648', // 琥珀金色
    '#394a66', // 海军蓝
    '#3b6187', // 深青蓝色
    '#726892', // 深紫色
    '#837c7c', // 暖灰色
    '#604949'  // 深棕色
  ];

  const colors = [
    '#333333', // 主色
    '#4a5568', // 深灰色
    '#718096', // 中灰色
    '#a0aec0', // 浅灰色
    '#2d3748', // 深蓝色
    '#2c5282', // 蓝色
    '#2f855a', // 绿色
    '#975a16', // 棕色
  ];

  const handleChange = (key: keyof FormatOptions, value: any) => {
    let updatedOptions = { ...formatOptions, [key]: value };

    if (key === 'pageMargins') {
      switch (value) {
        case 'normal':
          updatedOptions = { ...updatedOptions, marginLeft: '2.54cm', marginRight: '2.54cm', marginTop: '2.54cm', marginBottom: '2.54cm' };
          break;
        case 'narrow':
          updatedOptions = { ...updatedOptions, marginLeft: '1.27cm', marginRight: '1.27cm', marginTop: '1.27cm', marginBottom: '1.27cm' };
          break;
        case 'moderate':
          updatedOptions = { ...updatedOptions, marginLeft: '1.91cm', marginRight: '1.91cm', marginTop: '2.54cm', marginBottom: '2.54cm' };
          break;
      }
    }

    onChange(updatedOptions);
  };

  const toggleColorPicker = (type: 'primary' | 'secondary') => {
    if (showColorPicker && activeColorPicker === type) {
      setShowColorPicker(false);
    } else {
      setActiveColorPicker(type);
      setShowColorPicker(true);
    }
  };

  // 根据activeColorPicker获取正确的属性名
  const getColorPropertyKey = (type: 'primary' | 'secondary'): keyof FormatOptions => {
    return type === 'primary' ? 'primaryColor' : 'secondaryColor';
  };

  const handleColorChange = (color: string) => {
    const propertyKey = getColorPropertyKey(activeColorPicker);
    onChange({ ...formatOptions, [propertyKey]: color });
  };

  return (
    <div className="bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] mb-4">
      {/* Heading and Content Format Toolbar */}
      <div className="flex flex-wrap items-center p-2 gap-2 border-b">
        <div className="flex items-center text-sm font-medium text-gray-500 pr-2 border-r">
          <FaHeading className="mr-1" />
          <span>Heading</span>
        </div>

        {/* Font Family */}
        <div className="relative group">
          <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
            <FaFont className="mr-1" />
            <span className={`text-sm font-${formatOptions.fontFamily}`}>
              {formatOptions.fontFamily === 'sans' ? 'Sans' : 
               formatOptions.fontFamily === 'serif' ? 'Serif' : 'Mono'}
            </span>
            <FaChevronDown className="ml-1 text-xs" />
          </button>
          <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
            {(['sans', 'serif', 'mono'] as const).map((font) => (
              <button
                key={font}
                className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.fontFamily === font ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
                onClick={() => handleChange('fontFamily', font)}
              >
                <span className={`font-${font}`}>
                  {font === 'sans' ? 'Sans' : font === 'serif' ? 'Serif' : 'Mono'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="relative group">
          <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
            <span className="text-sm mr-1">
              {formatOptions.fontSize === 'small' ? 'A' : formatOptions.fontSize === 'medium' ? 'A' : 'A'}
              <span className="text-xs">{formatOptions.fontSize === 'small' ? '-' : formatOptions.fontSize === 'medium' ? '' : '+'}</span>
            </span>
            <FaChevronDown className="ml-1 text-xs" />
          </button>
          <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[100px]">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.fontSize === size ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
                onClick={() => handleChange('fontSize', size)}
              >
                <span className={size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'}>
                  {size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Heading Alignment */}
        <div className="flex items-center space-x-1">
          <button
            className={`p-1.5 rounded ${formatOptions.headingAlign === 'left' ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => handleChange('headingAlign', 'left')}
            title="Align Heading Left"
          >
            <FaAlignLeft size={14} />
          </button>
          <button
            className={`p-1.5 rounded ${formatOptions.headingAlign === 'center' ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => handleChange('headingAlign', 'center')}
            title="Center Heading"
          >
            <FaAlignCenter size={14} />
          </button>
          <button
            className={`p-1.5 rounded ${formatOptions.headingAlign === 'right' ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => handleChange('headingAlign', 'right')}
            title="Align Heading Right"
          >
            <FaAlignRight size={14} />
          </button>
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Primary Color */}
        <div className="flex items-center space-x-1 relative" ref={primaryColorPickerRef}>
          <button
            className="p-1.5 rounded hover:bg-gray-100 relative flex items-center"
            onClick={() => toggleColorPicker('primary')}
            title="Primary Color"
          >
            <FaPalette size={14} className="mr-1" />
            <div className="ml-1 w-3 h-3 rounded-full" style={{backgroundColor: formatOptions.primaryColor}}></div>
          </button>
          {showColorPicker && activeColorPicker === 'primary' && (
            <div className="absolute z-20 top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2">
              <div className="grid grid-cols-5 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border ${formatOptions.primaryColor === color ? 'ring-2 ring-offset-2 ring-[#eb3d24]' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="color"
                  value={formatOptions.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8"
                />
                <input
                  type="text"
                  value={formatOptions.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Secondary Color */}
        <div className="flex items-center space-x-1 relative" ref={secondaryColorPickerRef}>
          <button
            className="p-1.5 rounded hover:bg-gray-100 relative flex items-center"
            onClick={() => toggleColorPicker('secondary')}
            title="Secondary Color"
          >
            <FaPalette size={14} className="mr-1" />
            <div className="ml-1 w-3 h-3 rounded-full" style={{backgroundColor: formatOptions.secondaryColor}}></div>
          </button>
          {showColorPicker && activeColorPicker === 'secondary' && (
            <div className="absolute z-20 top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2">
              <div className="grid grid-cols-5 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border ${formatOptions.secondaryColor === color ? 'ring-2 ring-offset-2 ring-[#eb3d24]' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="color"
                  value={formatOptions.secondaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8"
                />
                <input
                  type="text"
                  value={formatOptions.secondaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Content Section */}
        <div className="flex items-center text-sm font-medium text-gray-500 pr-2 border-r">
          <FaParagraph className="mr-1" />
          <span>Content</span>
        </div>

        {/* Content Alignment */}
        <div className="flex items-center space-x-1">
          <button
            className={`p-1.5 rounded ${formatOptions.contentAlign === 'left' ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => handleChange('contentAlign', 'left')}
            title="Align Content Left"
          >
            <FaAlignLeft size={14} />
          </button>
          <button
            className={`p-1.5 rounded ${formatOptions.contentAlign === 'center' ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => handleChange('contentAlign', 'center')}
            title="Center Content"
          >
            <FaAlignCenter size={14} />
          </button>
          <button
            className={`p-1.5 rounded ${formatOptions.contentAlign === 'right' ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => handleChange('contentAlign', 'right')}
            title="Align Content Right"
          >
            <FaAlignRight size={14} />
          </button>
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Content Options */}
        <div className="flex items-center space-x-1">
          <button
            className={`p-1.5 rounded ${formatOptions.showBullets ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
            onClick={() => handleChange('showBullets', !formatOptions.showBullets)}
            title="Show Bullets"
          >
            <FaListUl size={14} />
          </button>
        </div>
      </div>

      {/* Spacing Controls Toolbar */}
      <div className="flex flex-wrap items-center p-2 gap-2">
        <div className="flex items-center text-sm font-medium text-gray-500 pr-2 border-r">
          <FaRuler className="mr-1" />
          <span>Spacing</span>
        </div>
        
        {/* Page Margins */}
        <div className="relative group">
          <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
            <FaIndent className="mr-1" />
            <span className="text-xs">Margins</span>
            <span className="ml-1 text-xs font-medium">
              {formatOptions.pageMargins === 'normal' ? 'Normal' : 
               formatOptions.pageMargins === 'narrow' ? 'Narrow' : 'Moderate'}
            </span>
            <FaChevronDown className="ml-1 text-xs" />
          </button>
          <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
            {(['normal', 'narrow', 'moderate'] as const).map((margin) => (
              <button
                key={margin}
                className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.pageMargins === margin ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
                onClick={() => handleChange('pageMargins', margin)}
              >
                {margin === 'normal' ? 'Normal' : 
                 margin === 'narrow' ? 'Narrow' : 
                 'Moderate'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Section Spacing */}
        <div className="relative group">
          <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
            <FaLayerGroup className="mr-1" />
            <span className="text-xs">Section</span>
            <span className="ml-1 text-xs font-medium">
              {formatOptions.sectionSpacing === 'small' ? '1' : 
               formatOptions.sectionSpacing === 'medium' ? '2' : '3'}
            </span>
            <FaChevronDown className="ml-1 text-xs" />
          </button>
          <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
            {(['small', 'medium', 'large'] as const).map((spacing) => (
              <button
                key={spacing}
                className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.sectionSpacing === spacing ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
                onClick={() => handleChange('sectionSpacing', spacing)}
              >
                {spacing === 'small' ? '1' : spacing === 'medium' ? '2' : '3'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Paragraph Spacing */}
        <div className="relative group">
          <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
            <FaParagraph className="mr-1" />
            <span className="text-xs">Paragraph</span>
            <span className="ml-1 text-xs font-medium">
              {formatOptions.paragraphSpacing === 'small' ? '1' : 
               formatOptions.paragraphSpacing === 'medium' ? '2' : '3'}
            </span>
            <FaChevronDown className="ml-1 text-xs" />
          </button>
          <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
            {(['small', 'medium', 'large'] as const).map((spacing) => (
              <button
                key={spacing}
                className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.paragraphSpacing === spacing ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
                onClick={() => handleChange('paragraphSpacing', spacing)}
              >
                {spacing === 'small' ? '1' : spacing === 'medium' ? '2' : '3'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 border-r mx-1"></div>

        {/* Line Spacing */}
        <div className="relative group">
          <button className="flex items-center px-3 py-1 rounded hover:bg-gray-100">
            <FaAlignJustify className="mr-1" />
            <span className="text-xs">Line</span>
            <span className="ml-1 text-xs font-medium">
              {formatOptions.lineSpacing === 'small' ? '1' : 
               formatOptions.lineSpacing === 'medium' ? '2' : '3'}
            </span>
            <FaChevronDown className="ml-1 text-xs" />
          </button>
          <div className="absolute z-10 hidden group-hover:block bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-1 min-w-[120px]">
            {(['small', 'medium', 'large'] as const).map((spacing) => (
              <button
                key={spacing}
                className={`w-full text-left px-3 py-1 rounded text-sm ${formatOptions.lineSpacing === spacing ? 'bg-[#ffeeec] text-[#eb3d24]' : 'hover:bg-gray-100'}`}
                onClick={() => handleChange('lineSpacing', spacing)}
              >
                {spacing === 'small' ? '1' : spacing === 'medium' ? '2' : '3'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeFormatToolbar; 