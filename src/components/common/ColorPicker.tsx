import React from 'react';
import { FaPalette } from 'react-icons/fa';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  title?: string;
}

const defaultPresetColors = [
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

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  presetColors = defaultPresetColors,
  title = 'Color'
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex items-center space-x-1 relative" ref={pickerRef}>
      <button
        className="p-1.5 rounded hover:bg-gray-100 relative flex items-center"
        onClick={() => setShowPicker(!showPicker)}
        title={title}
      >
        <FaPalette size={14} className="mr-1" />
        <div className="ml-1 w-3 h-3 rounded-full" style={{backgroundColor: color}}></div>
      </button>
      {showPicker && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2">
          <div className="grid grid-cols-5 gap-1">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className={`w-6 h-6 rounded-full border ${color === presetColor ? 'ring-2 ring-offset-2 ring-[#eb3d24]' : ''}`}
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor);
                  setShowPicker(false);
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker; 