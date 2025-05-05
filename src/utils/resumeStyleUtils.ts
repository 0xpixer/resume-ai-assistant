import { FormatOptions } from '@/types/format';

export class ResumeStyleUtils {
  static getFontSize(formatOptions?: FormatOptions): string {
    if (!formatOptions) return '1rem';
    switch (formatOptions.fontSize) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      case 'medium':
      default: return '1rem';
    }
  }

  static getLineSpacing(formatOptions?: FormatOptions): string {
    if (!formatOptions) return '1.5';
    switch (formatOptions.lineSpacing) {
      case 'small': return '1.3';
      case 'large': return '1.8';
      case 'medium':
      default: return '1.5';
    }
  }

  static getParagraphSpacing(formatOptions?: FormatOptions): string {
    if (!formatOptions) return '1rem';
    switch (formatOptions.paragraphSpacing) {
      case 'small': return '0.5rem';
      case 'large': return '1.5rem';
      case 'medium':
      default: return '1rem';
    }
  }

  static getSectionSpacing(formatOptions?: FormatOptions): string {
    if (!formatOptions) return '1.5rem';
    switch (formatOptions.sectionSpacing) {
      case 'small': return '1rem';
      case 'large': return '2rem';
      case 'medium':
      default: return '1.5rem';
    }
  }

  static getHeadingAlignClass(formatOptions?: FormatOptions): string {
    if (!formatOptions) return 'text-left';
    switch (formatOptions.headingAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left':
      default: return 'text-left';
    }
  }

  static getContentAlignClass(formatOptions?: FormatOptions): string {
    if (!formatOptions) return 'text-left';
    switch (formatOptions.contentAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left':
      default: return 'text-left';
    }
  }

  static getSpacingClass(formatOptions?: FormatOptions): string {
    if (!formatOptions || !formatOptions.compactLayout) {
      return 'mb-5';
    }
    return 'mb-3';
  }

  static getBorderClass(formatOptions?: FormatOptions): string {
    if (!formatOptions || formatOptions.showBorders) {
      return 'border-b-2';
    }
    return '';
  }
} 