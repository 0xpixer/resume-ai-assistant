'use client';

import React from 'react';

export interface FormatOptions {
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'small' | 'medium' | 'large';
  headingAlign: 'left' | 'center' | 'right';
  contentAlign: 'left' | 'center' | 'right';
  primaryColor: string;
  secondaryColor: string;
  showBorders: boolean;
  showBullets: boolean;
  compactLayout: boolean;
  pageMargins: 'normal' | 'narrow' | 'moderate';
  sectionSpacing: 'small' | 'medium' | 'large';
  paragraphSpacing: 'small' | 'medium' | 'large';
  lineSpacing: 'small' | 'medium' | 'large';
  marginLeft: string;
  marginRight: string;
  marginTop: string;
  marginBottom: string;
  template: 'classic' | 'modern' | 'minimal' | 'creative' | 'two-column' | 'minimal-elegant';
}

// 添加默认的格式选项
export const defaultFormatOptions: FormatOptions = {
  fontFamily: 'sans',
  fontSize: 'medium',
  headingAlign: 'left',
  contentAlign: 'left',
  primaryColor: '#333333',
  secondaryColor: '#333333',
  showBorders: false,
  showBullets: true,
  compactLayout: false,
  pageMargins: 'normal',
  sectionSpacing: 'medium',
  paragraphSpacing: 'medium',
  lineSpacing: 'medium',
  marginLeft: '2.54cm',
  marginRight: '2.54cm',
  marginTop: '2.54cm',
  marginBottom: '2.54cm',
  template: 'classic'
};

interface ResumeFormatEditorProps {
  formatOptions: FormatOptions;
  onChange: (options: FormatOptions) => void;
}

const ResumeFormatEditor: React.FC<ResumeFormatEditorProps> = ({
  formatOptions,
  onChange
}) => {
  const handleChange = (key: keyof FormatOptions, value: any) => {
    onChange({
      ...formatOptions,
      [key]: value
    });
  };

  return (
    <div className="space-y-6 p-4 border rounded-md">
      <div>
        <h3 className="font-medium mb-2">排版选项</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">字体</label>
            <div className="flex space-x-4">
              {(['sans', 'serif', 'mono'] as const).map((font) => (
                <label key={font} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="fontFamily"
                    value={font}
                    checked={formatOptions.fontFamily === font}
                    onChange={() => handleChange('fontFamily', font)}
                    className="form-radio"
                  />
                  <span className={`font-${font}`}>{font === 'sans' ? '无衬线' : font === 'serif' ? '衬线' : '等宽'}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block mb-2">字体大小</label>
            <div className="flex space-x-4">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <label key={size} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="fontSize"
                    value={size}
                    checked={formatOptions.fontSize === size}
                    onChange={() => handleChange('fontSize', size)}
                    className="form-radio"
                  />
                  <span className={`text-${size === 'small' ? 'sm' : size === 'medium' ? 'base' : 'lg'}`}>
                    {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block mb-2">标题对齐</label>
            <div className="flex space-x-4">
              {(['left', 'center', 'right'] as const).map((align) => (
                <label key={align} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="headingAlign"
                    value={align}
                    checked={formatOptions.headingAlign === align}
                    onChange={() => handleChange('headingAlign', align)}
                    className="form-radio"
                  />
                  <span>{align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block mb-2">内容对齐</label>
            <div className="flex space-x-4">
              {(['left', 'center', 'right'] as const).map((align) => (
                <label key={align} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="contentAlign"
                    value={align}
                    checked={formatOptions.contentAlign === align}
                    onChange={() => handleChange('contentAlign', align)}
                    className="form-radio"
                  />
                  <span>{align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">颜色选项</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="primary-color" className="block mb-2">主要颜色</label>
            <div className="flex items-center space-x-2">
              <input 
                id="primary-color"
                type="color" 
                value={formatOptions.primaryColor} 
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <input 
                type="text" 
                value={formatOptions.primaryColor} 
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-24 border rounded px-2 py-1"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="secondary-color" className="block mb-2">次要颜色</label>
            <div className="flex items-center space-x-2">
              <input 
                id="secondary-color"
                type="color" 
                value={formatOptions.secondaryColor} 
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <input 
                type="text" 
                value={formatOptions.secondaryColor} 
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-24 border rounded px-2 py-1"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">布局选项</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">模板</label>
            <div className="grid grid-cols-2 gap-4">
              {(['classic', 'modern', 'minimal', 'creative', 'two-column', 'minimal-elegant'] as const).map((tmpl) => (
                <label key={tmpl} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="template"
                    value={tmpl}
                    checked={formatOptions.template === tmpl}
                    onChange={() => handleChange('template', tmpl)}
                    className="form-radio text-primary"
                  />
                  <span className="text-sm">{tmpl === 'classic' ? '经典' : 
                         tmpl === 'modern' ? '现代' : 
                         tmpl === 'minimal' ? '简约' : 
                         tmpl === 'creative' ? '创意' : 
                         tmpl === 'minimal-elegant' ? '优雅' :
                         '双栏'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="show-borders">显示边框</label>
            <input 
              id="show-borders"
              type="checkbox"
              checked={formatOptions.showBorders} 
              onChange={(e) => handleChange('showBorders', e.target.checked)}
              className="form-checkbox"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="show-bullets">显示项目符号</label>
            <input 
              id="show-bullets"
              type="checkbox"
              checked={formatOptions.showBullets} 
              onChange={(e) => handleChange('showBullets', e.target.checked)}
              className="form-checkbox"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="compact-layout">紧凑布局</label>
            <input 
              id="compact-layout"
              type="checkbox"
              checked={formatOptions.compactLayout} 
              onChange={(e) => handleChange('compactLayout', e.target.checked)}
              className="form-checkbox"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeFormatEditor; 