'use client';

import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  onDateChange: (startDate: string, endDate: string) => void;
  onCurrentChange: (current: boolean) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  isCurrent,
  onDateChange,
  onCurrentChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">工作时间</label>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="current-position"
            checked={isCurrent}
            onChange={(e) => onCurrentChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="current-position"
            className="text-sm text-gray-700"
          >
            当前在职
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isCurrent ? '预计结束' : '结束日期'}
          </label>
          <input
            type="month"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            disabled={isCurrent}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isCurrent ? 'bg-gray-100 text-gray-500' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker; 