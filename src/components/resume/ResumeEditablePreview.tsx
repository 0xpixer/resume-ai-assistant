'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Resume, ExperienceItem } from '@/types/resume';
import { FormatOptions } from './ResumeFormatEditor';
import { ResumeHeader } from './ResumeHeader';
import { ResumeBody } from './ResumeBody';
import { FaChevronLeft, FaChevronRight, FaPen, FaCheck, FaTimes, FaBold, FaItalic, FaUnderline, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight } from 'react-icons/fa';

export interface ResumeEditablePreviewProps {
  resume: Resume;
  template: string;
  formatOptions: FormatOptions;
  onUpdateResume: (updatedResume: Resume | ((prevResume: Resume) => Resume)) => void;
  scale?: number;
  fullWidth?: boolean;
}

interface MarginValues {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

export interface TemplateStyle {
  fontFamily: string;
  fontSize: string;
  headingAlign: string;
  contentAlign: string;
  primaryColor: string;
  secondaryColor: string;
  showBorders: boolean;
  showBullets: boolean;
  compactLayout: boolean;
  headerBg: string;
  headerText: string;
  headerBorder?: string;
  sectionTitleBg: string;
  sectionTitleText: string;
  sectionTitleBorder?: string;
  sectionTitleDecoration?: string;
  itemBorderColor: string;
  itemBorderStyle?: string;
  itemPadding: string;
  itemMargin: string;
  pageMargins: MarginValues;
  sectionSpacing: string;
  paragraphSpacing: string;
  lineHeight: string;
}

interface EditingField {
  section: string;
  index?: number;
  field: string;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch (error) {
    return dateString;
  }
};

const ResumeEditablePreview: React.FC<ResumeEditablePreviewProps> = ({ 
  resume, 
  template,
  formatOptions,
  onUpdateResume,
  scale = 0.8,
  fullWidth = false
}) => {
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const resumeContentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<EditingField | null>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const [isContentRendered, setIsContentRendered] = useState(false);
  const [pageHeights, setPageHeights] = useState<number[]>([]);

  // 根据模板和格式选项应用不同的样式
  const getTemplateStyles = (): TemplateStyle => {
    // 动态计算页边距
    const getMarginValue = (): MarginValues => {
      const top = formatOptions.marginTop || '2.54cm';
      const bottom = formatOptions.marginBottom || '2.54cm';
      const left = formatOptions.marginLeft || '2.54cm';
      const right = formatOptions.marginRight || '2.54cm';
      return {
        top,
        bottom,
        left,
        right
      };
    };

    // 动态计算章节间距
    const getSectionSpacingValue = () => {
      switch (formatOptions.sectionSpacing) {
        case 'small': return '1rem';
        case 'large': return '2.5rem';
        case 'medium':
        default: return '1.75rem';
      }
    };

    // 动态计算段落间距
    const getParagraphSpacingValue = () => {
      switch (formatOptions.paragraphSpacing) {
        case 'small': return '0.5rem';
        case 'large': return '1.5rem';
        case 'medium':
        default: return '1rem';
      }
    };

    // 动态计算行高
    const getLineHeightValue = () => {
      switch (formatOptions.lineSpacing) {
        case 'small': return '1.2';
        case 'large': return '1.8';
        case 'medium':
        default: return '1.5';
      }
    };

    const baseStyles = {
      fontFamily: formatOptions.fontFamily === 'sans' 
        ? 'ui-sans-serif, system-ui, sans-serif'
        : formatOptions.fontFamily === 'serif'
          ? 'ui-serif, Georgia, serif'
          : 'ui-monospace, monospace',
      fontSize: formatOptions.fontSize === 'small'
        ? '0.875rem'
        : formatOptions.fontSize === 'medium'
          ? '1rem'
          : '1.125rem',
      headingAlign: formatOptions.headingAlign,
      contentAlign: formatOptions.contentAlign,
      primaryColor: formatOptions.primaryColor,
      secondaryColor: formatOptions.secondaryColor,
      showBorders: formatOptions.showBorders,
      showBullets: formatOptions.showBullets,
      compactLayout: formatOptions.compactLayout,
      // 添加新的布局样式
      pageMargins: getMarginValue(),
      sectionSpacing: getSectionSpacingValue(),
      paragraphSpacing: getParagraphSpacingValue(),
      lineHeight: getLineHeightValue()
    };

    switch (template) {
      case 'modern':
        return {
          ...baseStyles,
          headerBg: formatOptions.primaryColor,
          headerText: '#ffffff',
          sectionTitleBg: 'transparent',
          sectionTitleText: formatOptions.primaryColor,
          itemBorderColor: formatOptions.showBorders ? formatOptions.secondaryColor : 'transparent',
          itemPadding: formatOptions.compactLayout ? '0.5rem' : '0.75rem',
          itemMargin: formatOptions.compactLayout ? '0.5rem 0' : '1rem 0',
        };
      
      case 'creative':
        return {
          ...baseStyles,
          headerBg: '#ffffff',
          headerText: formatOptions.primaryColor,
          sectionTitleBg: 'transparent',
          sectionTitleText: formatOptions.primaryColor,
          sectionTitleDecoration: `2px solid ${formatOptions.secondaryColor}`,
          itemBorderColor: formatOptions.showBorders ? formatOptions.secondaryColor : 'transparent',
          itemBorderStyle: '2px solid',
          itemPadding: formatOptions.compactLayout ? '0.5rem' : '0.75rem',
          itemMargin: formatOptions.compactLayout ? '0.5rem 0' : '1rem 0',
        };
        
      case 'minimal':
        return {
          ...baseStyles,
          headerBg: 'transparent',
          headerText: formatOptions.primaryColor,
          headerBorder: `1px solid ${formatOptions.secondaryColor}`,
          sectionTitleBg: 'transparent',
          sectionTitleText: 'inherit',
          sectionTitleBorder: `1px solid ${formatOptions.secondaryColor}`,
          itemBorderColor: formatOptions.showBorders ? '#e5e5e5' : 'transparent',
          itemBorderStyle: '1px solid',
          itemPadding: formatOptions.compactLayout ? '0.25rem' : '0.5rem',
          itemMargin: formatOptions.compactLayout ? '0.25rem 0' : '0.75rem 0',
        };
        
      case 'classic':
      default:
        return {
          ...baseStyles,
          headerBg: 'transparent',
          headerText: formatOptions.primaryColor,
          sectionTitleBg: formatOptions.primaryColor,
          sectionTitleText: '#ffffff',
          itemBorderColor: formatOptions.showBorders ? '#e5e5e5' : 'transparent',
          itemPadding: formatOptions.compactLayout ? '0.5rem' : '0.75rem',
          itemMargin: formatOptions.compactLayout ? '0.5rem 0' : '1rem 0',
        };
    }
  };

  const styles = getTemplateStyles();

  // 计算页面数量并实现分页显示
  useEffect(() => {
    if (!resumeContentRef.current) return;

    // A4标准尺寸设置 (96 DPI)
    const A4_WIDTH_PX = 794;  // A4宽度
    const A4_HEIGHT_PX = 1123; // A4高度
    
    // 获取边距
    const margins = styles.pageMargins;

    // 设置容器样式
    const container = resumeContentRef.current;
    container.style.setProperty('width', `${A4_WIDTH_PX}px`);
    container.style.setProperty('margin', '0 auto');
    container.style.setProperty('position', 'relative');
    container.style.setProperty('box-sizing', 'border-box');
    
    // 设置打印样式
    let printStyle = document.getElementById('resume-print-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'resume-print-style';
      document.head.appendChild(printStyle);
    }

    // 更新打印样式
    printStyle.textContent = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .resume-page {
          width: ${A4_WIDTH_PX}px !important;
          height: ${A4_HEIGHT_PX}px !important;
          min-height: ${A4_HEIGHT_PX}px !important;
          max-height: ${A4_HEIGHT_PX}px !important;
          margin: 0 !important;
          padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left} !important;
          box-sizing: border-box !important;
          box-shadow: none !important;
          page-break-after: always;
          page-break-inside: avoid;
          background-color: white;
        }
        .resume-page:last-child {
          page-break-after: avoid;
        }
        /* 避免段落和标题跨页 */
        p, h1, h2, h3, h4, h5, h6 {
          page-break-inside: avoid;
        }
        /* 避免表格跨页 */
        table {
          page-break-inside: avoid;
        }
        /* 确保打印时内容不被截断 */
        * {
          overflow: visible !important;
        }
        .resume-block {
          page-break-inside: avoid;
        }
        .resume-block.experience-item-block,
        .resume-block.education-item-block {
          page-break-inside: avoid;
        }
        .page-count,
        .pagination-controls {
          display: none !important;
        }
      }
    `;

    // 添加全局样式
    let globalStyle = document.getElementById('resume-global-style');
    if (!globalStyle) {
      globalStyle = document.createElement('style');
      globalStyle.id = 'resume-global-style';
      document.head.appendChild(globalStyle);
    }

    // 更新全局样式
    globalStyle.textContent = `
      .resume-page {
        width: ${A4_WIDTH_PX}px;
        height: ${A4_HEIGHT_PX}px;
        max-height: ${A4_HEIGHT_PX}px;
        margin: 0 auto;
        padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
        position: relative;
        box-sizing: border-box;
        background-color: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        overflow: auto;
      }
      /* 避免段落和标题跨页 */
      .resume-page p,
      .resume-page h1,
      .resume-page h2,
      .resume-page h3,
      .resume-page h4,
      .resume-page h5,
      .resume-page h6,
      .resume-block {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      /* 避免表格和图片跨页 */
      .resume-page table,
      .resume-page img {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      /* 内容块样式 */
      .resume-block {
        break-inside: avoid;
        page-break-inside: avoid;
        margin-bottom: 1rem;
        position: relative;
      }
      
      /* 分页控制样式 */
      .pagination-controls {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1rem 0;
        user-select: none;
      }
      
      .pagination-controls button {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        margin: 0 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      .pagination-controls button:hover:not(:disabled) {
        background-color: #e0e0e0;
      }
      
      .pagination-controls button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .pagination-controls .page-info {
        padding: 0 1rem;
        font-size: 0.9rem;
      }
      
      /* 打印模式下的特殊样式 */
      @media print {
        .resume-preview-wrapper {
          transform: scale(1) !important;
        }
        .resume-page {
          box-shadow: none !important;
          margin: 0 !important;
          min-height: 0 !important;
        }
        .pagination-controls {
          display: none !important;
        }
      }
    `;
    
    // 内容已经渲染，可以进行进一步操作
    setIsContentRendered(true);
    
    // 尝试获取内容高度并计算页数
    setTimeout(() => {
      if (resumeContentRef.current && pageRef.current) {
        const resumeContent = pageRef.current;
        const contentHeight = resumeContent.scrollHeight;
        const availableHeight = A4_HEIGHT_PX - (parseFloat(margins.top) + parseFloat(margins.bottom));
        const pageCount = Math.ceil(contentHeight / availableHeight);
        setTotalPages(pageCount);
        
        // 计算每页的高度
        const heights = [];
        for (let i = 0; i < pageCount; i++) {
          heights.push(i < pageCount - 1 ? availableHeight : contentHeight - (availableHeight * (pageCount - 1)));
        }
        setPageHeights(heights);
        
        // 添加页码
        const pageCountElement = document.createElement('div');
        pageCountElement.className = 'page-count';
        pageCountElement.textContent = `${currentPage} / ${pageCount}`;
        pageCountElement.style.position = 'absolute';
        pageCountElement.style.bottom = '10px';
        pageCountElement.style.right = '10px';
        pageCountElement.style.fontSize = '10px';
        pageCountElement.style.color = '#888';
        resumeContent.appendChild(pageCountElement);
      }
    }, 500);
    
  }, [resume, template, formatOptions, scale, styles, currentPage]);

  // 上一页
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 下一页
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 计算当前页的内容偏移
  const getPageContentStyles = () => {
    if (pageHeights.length === 0) return {};
    
    const A4_HEIGHT_PX = 1123; // A4高度
    const margins = styles.pageMargins;
    const availableHeight = A4_HEIGHT_PX - (parseFloat(margins.top) + parseFloat(margins.bottom));
    
    let translateY = 0;
    if (currentPage > 1) {
      // 需要向上偏移(当前页-1) * A4高度
      translateY = -((currentPage - 1) * availableHeight);
    }
    
    return {
      transform: `translateY(${translateY}px)`,
      transition: 'transform 0.3s ease-in-out',
    };
  };

  // 开始编辑
  const startEditing = (section: string, field: string, index?: number) => {
    setEditing({ section, field, index });
  };

  // 结束编辑
  const endEditing = () => {
    setEditing(null);
  };

  // 获取正在编辑字段的值
  const getEditingValue = (): string => {
    if (!editing) return '';
    
    if (editing.section === 'contactInfo') {
      const value = resume.contactInfo[editing.field as keyof typeof resume.contactInfo];
      return value ? String(value) : '';
    } else if (editing.section === 'summary') {
      return resume.summary || '';
    } else if (editing.section === 'experience' && editing.index !== undefined) {
      const exp = resume.experience[editing.index];
      if (editing.field === 'achievements') {
        return Array.isArray(exp.achievements) ? exp.achievements.join('\n') : '';
      }
      const value = exp[editing.field as keyof typeof exp];
      return value ? String(value) : '';
    } else if (editing.section === 'education' && editing.index !== undefined) {
      const edu = resume.education[editing.index];
      const value = edu[editing.field as keyof typeof edu];
      return value ? String(value) : '';
    } else if (editing.section === 'skills' && editing.index !== undefined) {
      const skill = resume.skills[editing.index];
      const value = skill[editing.field as keyof typeof skill];
      return value ? String(value) : '';
    }
    return '';
  };

  // 完成编辑并保存
  const finishEditing = () => {
    if (!editInputRef.current) return;
    saveEdit(editInputRef.current.value);
  };

  // 可编辑文本域组件
  const EditableField = ({
    value,
    section,
    field,
    index,
    multiline = false,
    className = "",
    style = {}
  }: {
    value: string;
    section: string;
    field: string;
    index?: number;
    multiline?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }) => {
    const isEditing = editing?.section === section && 
                      editing?.field === field && 
                      editing?.index === index;
    
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
    
    // 初始化编辑区域
    useEffect(() => {
      if (isEditing) {
        if (multiline && contentEditableRef.current) {
          contentEditableRef.current.focus();
          selectAllContent(contentEditableRef.current);
          setShowToolbar(true);
          updateToolbarPosition();
        } else if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      } else {
        setShowToolbar(false);
      }
    }, [isEditing, multiline]);

    // 处理选择文本变化
    const handleSelectionChange = () => {
      if (isEditing && multiline) {
        updateToolbarPosition();
      }
    };
    
    // 更新工具栏位置
    const updateToolbarPosition = () => {
      if (!contentEditableRef.current || !toolbarRef.current) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
      
      // 计算工具栏相对于编辑区域的位置
        const editorRect = contentEditableRef.current.getBoundingClientRect();
        
        setToolbarPosition({
        top: Math.max(rect.top - editorRect.top - toolbarRef.current.offsetHeight - 10, 0),
        left: Math.max(
          Math.min(
            rect.left - editorRect.left + rect.width / 2 - toolbarRef.current.offsetWidth / 2,
            editorRect.width - toolbarRef.current.offsetWidth
          ),
          0
        )
      });
    };
    
    // 选择所有内容
    const selectAllContent = (element: HTMLElement) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
    };
    
    // 设置文本格式
    const formatText = (command: string, value: string = '') => {
            document.execCommand(command, false, value);
      if (contentEditableRef.current) {
        contentEditableRef.current.focus();
      }
      updateToolbarPosition();
    };
    
    // 完成本地编辑并保存
    const localFinishEditing = () => {
      if (!isEditing) return;
      
      let newValue = "";
      
      if (multiline && contentEditableRef.current) {
        newValue = contentEditableRef.current.innerHTML;
      } else if (inputRef.current) {
        newValue = inputRef.current.value;
      }
      
      saveEdit(newValue);
    };
    
    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
      // 处理Tab键
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
      
      // 按下Esc键取消编辑
      if (e.key === 'Escape') {
        endEditing();
      }
      
      // 按下Ctrl+Enter或Cmd+Enter保存编辑
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        localFinishEditing();
      }
    };
    
    if (isEditing) {
      if (multiline) {
      return (
          <div className={`relative ${className}`}>
              <div
                ref={contentEditableRef}
              contentEditable="true"
              dangerouslySetInnerHTML={{ __html: value }}
              onBlur={localFinishEditing}
                onKeyDown={handleKeyDown}
              onInput={handleSelectionChange}
              onSelect={handleSelectionChange}
              className="p-1 border border-blue-500 rounded focus:outline-none min-h-[50px]"
              style={style}
            ></div>
            </div>
        );
      } else {
        return (
            <input
              ref={inputRef}
              type="text"
              defaultValue={value}
              className="w-full p-1 border border-blue-400 rounded text-sm"
              style={{...style, backgroundColor: 'white', color: 'black'}}
              onKeyDown={handleKeyDown}
            />
        );
      }
    }
    
    return (
      <div className={`group relative ${className}`} style={style}>
        <div dangerouslySetInnerHTML={{ __html: value }} />
        <button
          onClick={() => startEditing(section, field, index)}
          className="absolute -top-2 -right-2 bg-blue-100 text-blue-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ zIndex: 50 }}
          type="button"
        >
          <FaPen size={10} />
        </button>
      </div>
    );
  };

  // 保存编辑并更新简历
  const saveEdit = (newValue: string) => {
    if (!editing) return;

    const updatedResume = { ...resume };
    
    // 获取纯文本内容（用于某些不需要保留格式的字段）
    const plainText = document.createElement('div');
    plainText.innerHTML = newValue;
    const textContent = plainText.textContent || plainText.innerText || newValue;
    
    // 根据不同部分和字段进行相应的更新
    if (editing.section === 'contactInfo') {
      updatedResume.contactInfo = {
        ...updatedResume.contactInfo,
        [editing.field]: textContent // 联系信息使用纯文本
      };
    } else if (editing.section === 'summary') {
      updatedResume.summary = newValue; // 摘要可以包含HTML格式
    } else if (editing.section === 'experience' && editing.index !== undefined) {
      const updatedExperiences = [...updatedResume.experience];
      
      // 特殊处理achievements字段，将文本转换为数组
      if (editing.field === 'achievements') {
        // 分割HTML并转换为纯文本数组（保留列表结构）
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newValue;
        
        // 检查是否包含列表元素
        const listItems = tempDiv.querySelectorAll('li');
        if (listItems.length > 0) {
          // 如果包含列表，则提取列表项内容
          const achievements = Array.from(listItems).map(item => 
            item.textContent || item.innerText || ''
          ).filter(text => text.trim() !== '');
          
          updatedExperiences[editing.index] = {
            ...updatedExperiences[editing.index],
            achievements
          };
        } else {
          // 否则按行分割
          const achievements = textContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
          
          updatedExperiences[editing.index] = {
            ...updatedExperiences[editing.index],
            achievements
          };
        }
      } else {
        updatedExperiences[editing.index] = {
          ...updatedExperiences[editing.index],
          [editing.field]: textContent // 其他字段使用纯文本
        };
      }
      
      updatedResume.experience = updatedExperiences;
    } else if (editing.section === 'education' && editing.index !== undefined) {
      const updatedEducation = [...updatedResume.education];
      updatedEducation[editing.index] = {
        ...updatedEducation[editing.index],
        [editing.field]: textContent // 教育信息使用纯文本
      };
      updatedResume.education = updatedEducation;
    } else if (editing.section === 'skills' && editing.index !== undefined) {
      const updatedSkills = [...updatedResume.skills];
      if (editing.field === 'name') {
        updatedSkills[editing.index] = {
          ...updatedSkills[editing.index],
          name: textContent // 技能名称使用纯文本
        };
      }
      updatedResume.skills = updatedSkills;
    } else if (editing.section === 'projects' && editing.index !== undefined && updatedResume.projects) {
      const updatedProjects = [...updatedResume.projects];
      
      if (editing.field === 'description') {
        // 项目描述可以包含HTML格式
        updatedProjects[editing.index] = {
          ...updatedProjects[editing.index],
          description: newValue
        };
      } else {
        updatedProjects[editing.index] = {
          ...updatedProjects[editing.index],
          [editing.field]: textContent
        };
      }
      
      updatedResume.projects = updatedProjects;
    }

    onUpdateResume(updatedResume);
    endEditing();
  };

  const getContainerSizeClasses = () => {
    // Implement the logic to determine container size classes based on fullWidth
    return fullWidth ? 'w-full' : 'w-auto';
  };

  const getContentClasses = () => {
    // Implement the logic to determine content classes based on fullWidth
    return fullWidth ? 'w-full' : 'w-auto';
  };

  const getFontClass = () => {
    switch (formatOptions.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getFontSizeClass = () => {
    switch (formatOptions.fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      case 'medium':
      default:
        return 'text-base';
    }
  };

  const baseStyles = {
    ...styles,
    width: '794px',
    height: '1123px',
    maxHeight: '1123px',
    padding: styles.pageMargins,
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    lineHeight: styles.lineHeight,
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    position: 'relative' as 'relative',
    boxSizing: 'border-box' as 'border-box'
  };

  const dynamicStyles = {
    // Implement dynamic styles based on fullWidth
  };

  const sectionStyles = {
    // Implement section styles based on fullWidth
  };

  const paragraphStyles = {
    // Implement paragraph styles based on fullWidth
  };

  const lineStyles = {
    // Implement line styles based on fullWidth
  };

  // 渲染函数
  return (
    <div 
      className="resume-preview-wrapper"
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      <div
        ref={resumeContentRef}
        className="resume-content"
        style={{ 
          '--primary-color': styles.primaryColor,
          '--secondary-color': styles.secondaryColor,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          margin: '0 auto'
        } as React.CSSProperties}
      >
        <div className="resume-page">
          <div 
            ref={pageRef}
            className="resume-page-content"
            style={getPageContentStyles()}
          >
            <div className="resume-block header-block">
              <ResumeHeader 
                resume={resume} 
                styles={styles} 
                onUpdateResume={onUpdateResume} 
                editing={editing} 
                setEditing={setEditing} 
              />
            </div>
            
            <ResumeBody 
              resume={resume} 
              styles={styles} 
              onUpdateResume={onUpdateResume} 
              editing={editing} 
              setEditing={setEditing} 
            />
          </div>
        </div>
        
        {/* 分页控制按钮 */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage === 1}
              title="上一页"
            >
              <FaChevronLeft style={{ marginRight: '0.25rem' }} /> 上一页
            </button>
            <div className="page-info">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              title="下一页"
            >
              下一页 <FaChevronRight style={{ marginLeft: '0.25rem' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeEditablePreview; 