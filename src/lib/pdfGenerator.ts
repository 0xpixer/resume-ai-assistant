'use client';

import { ParsedResume } from '@/types/resume';
import { FormatOptions } from '@/components/resume/ResumeFormatEditor';

// 支持的简历模板类型
export type ResumeTemplate = 'classic' | 'modern' | 'minimal' | 'creative' | 'two-column' | 'minimal-elegant';

interface GeneratePdfOptions {
  template: ResumeTemplate;
  filename?: string;
  formatOptions?: FormatOptions;
}

/**
 * 根据当前页面DOM生成PDF文件，保持样式一致
 * 使用 html2canvas 和 jsPDF 的组合来生成更可靠的 PDF
 */
export async function generateResumePdf(resumeData: ParsedResume, options: GeneratePdfOptions): Promise<void> {
  // 客户端环境检测
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    console.error('PDF生成只能在浏览器环境中执行');
    throw new Error('PDF generation can only be executed in a browser environment');
  }

  // 动态导入依赖
  const [jsPDFModule, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);

  try {
    // @ts-ignore - 创建jsPDF实例
    const { jsPDF } = jsPDFModule;
    const html2canvas = html2canvasModule.default;
    
    console.log('Starting PDF generation process');
    
    // 查找简历内容元素 - 查找 EnhancedResumePreview
    const enhancedPreview = document.getElementById('enhanced-resume-preview');
    if (!enhancedPreview) {
      console.error('找不到 EnhancedResumePreview 元素');
      throw new Error('找不到简历预览组件。请确保简历已正确加载。');
    }
    
    console.log('Found EnhancedResumePreview element', enhancedPreview);
    
    // 查找分页控制信息
    const totalPagesInfo = enhancedPreview.querySelector('.pagination-controls div:nth-child(2)');
    let totalPages = 1;
    
    if (totalPagesInfo) {
      // 尝试从 "Page X of Y" 文本中提取总页数
      const pagesMatch = totalPagesInfo.textContent?.match(/of\s+(\d+)/i);
      if (pagesMatch && pagesMatch[1]) {
        totalPages = parseInt(pagesMatch[1], 10);
      }
    }
    
    console.log(`检测到简历共有 ${totalPages} 页`);
    
    // 查找分页按钮
    const prevButton = enhancedPreview.querySelector('.pagination-controls button:first-child');
    const nextButton = enhancedPreview.querySelector('.pagination-controls button:last-child');
    
    // 创建 PDF 文档
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // 如果有多页，我们需要逐页捕获内容并添加到PDF中
    if (totalPages > 1 && nextButton) {
      // 回到第一页
      await goToFirstPage(enhancedPreview);
      
      // 逐页捕获内容并添加到PDF
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`处理第 ${pageNum} 页`);
        
        // 等待页面渲染
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 捕获当前页
        const currentPage = enhancedPreview.querySelector('.resume-page');
        if (!currentPage) {
          console.warn(`未找到第 ${pageNum} 页内容，跳过`);
          continue;
        }
        
        // 为当前页创建临时样式克隆，以便捕获
        const pageClone = await preparePageForCapture(currentPage, options.formatOptions);
        
        try {
          // 使用 html2canvas 捕获当前页内容
          console.log(`开始捕获第 ${pageNum} 页画布`);
          const canvas = await html2canvas(pageClone, {
            scale: 2, // 提高清晰度
            useCORS: true, // 允许跨域图片
            logging: false, // 仅在调试时启用
            backgroundColor: '#ffffff',
            allowTaint: true,
            foreignObjectRendering: false,
          });
          
          // 检查 canvas 是否成功创建
          if (!canvas || canvas.width === 0 || canvas.height === 0) {
            console.error(`第 ${pageNum} 页捕获失败 - 画布为空`);
            continue;
          }
          
          console.log(`第 ${pageNum} 页画布成功捕获: ${canvas.width}x${canvas.height}`);
          
          // 如果不是第一页，添加新页面
          if (pageNum > 1) {
            doc.addPage();
          }
          
          // 将页面添加到PDF
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const imgWidth = 210; // A4 宽度 (mm)
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          
          // 清理临时克隆
          if (pageClone.parentNode) {
            pageClone.parentNode.removeChild(pageClone);
          }
        } catch (error) {
          console.error(`捕获第 ${pageNum} 页时出错:`, error);
        }
        
        // 如果有下一页，点击下一页按钮
        if (pageNum < totalPages && nextButton instanceof HTMLElement) {
          nextButton.click();
          // 给页面切换一点时间
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // 回到第一页，恢复原始状态
      await goToFirstPage(enhancedPreview);
    } else {
      // 单页情况 - 直接捕获当前页
      const resumePage = enhancedPreview.querySelector('.resume-page');
      
      if (!resumePage) {
        throw new Error('找不到简历页面内容');
      }
      
      // 准备页面进行捕获
      const pageClone = await preparePageForCapture(resumePage, options.formatOptions);
      
      // 使用 html2canvas 捕获页面内容
      console.log('开始捕获单页画布');
      const canvas = await html2canvas(pageClone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: false,
      });
      
      // 检查 canvas 是否成功创建
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.error('捕获简历内容失败 - 画布为空');
        throw new Error('Failed to capture resume content - empty canvas');
      }
      
      console.log('画布成功捕获', canvas.width, canvas.height);
      
      // 添加到PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = 210; // A4 宽度 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // 清理临时克隆
      if (pageClone.parentNode) {
        pageClone.parentNode.removeChild(pageClone);
      }
    }
    
    // 添加元数据
    if (resumeData.name) {
      doc.setProperties({
        title: `Resume - ${resumeData.name}`,
        subject: 'Professional Resume',
        author: resumeData.name,
        keywords: 'resume, cv, job application',
        creator: 'Resume AI Assistant'
      });
    }
    
    // 保存 PDF
    console.log('PDF 创建成功，准备下载');
    doc.save(options.filename || 'resume.pdf');
  } catch (error) {
    console.error('生成PDF时发生错误:', error);
    throw error;
  }
}

// 辅助函数：导航到第一页
async function goToFirstPage(enhancedPreview: HTMLElement) {
  const prevButton = enhancedPreview.querySelector('.pagination-controls button:first-child');
  const currentPageInfo = enhancedPreview.querySelector('.pagination-controls div:nth-child(2)');
  
  // 如果当前不在第一页，就不断点击"上一页"按钮直到回到第一页
  if (currentPageInfo && currentPageInfo.textContent && prevButton instanceof HTMLElement) {
    // 最多尝试10次，避免无限循环
    for (let i = 0; i < 10; i++) {
      if (currentPageInfo.textContent.includes('Page 1 of')) {
        break;
      }
      prevButton.click();
      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// 辅助函数：为捕获做准备
async function preparePageForCapture(page: Element, formatOptions?: FormatOptions): Promise<HTMLElement> {
  // 创建页面的克隆
  const pageClone = page.cloneNode(true) as HTMLElement;
  
  // 创建一个临时容器
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '794px'; // A4宽度
  tempContainer.style.backgroundColor = 'white';
  tempContainer.style.zIndex = '-9999';
  
  // 清理页码和控制元素
  const pageNumber = pageClone.querySelector('.page-number');
  if (pageNumber && pageNumber.parentNode) {
    pageNumber.parentNode.removeChild(pageNumber);
  }
  
  // 移除分页控制元素
  const paginationControls = pageClone.querySelector('.pagination-controls');
  if (paginationControls && paginationControls.parentNode) {
    paginationControls.parentNode.removeChild(paginationControls);
  }
  
  // 设置页面基本样式
  pageClone.style.width = '794px';
  pageClone.style.height = '1123px';
  pageClone.style.boxSizing = 'border-box';
  pageClone.style.backgroundColor = 'white';
  pageClone.style.color = '#000000';
  pageClone.style.transform = 'none';
  pageClone.style.position = 'relative';
  pageClone.style.display = 'block';
  pageClone.style.visibility = 'visible';
  pageClone.style.overflow = 'visible';
  pageClone.style.scale = '1';
  
  // 应用格式选项(如果有)
  if (formatOptions) {
    // 应用主题色
    if (formatOptions.primaryColor) {
      pageClone.style.setProperty('--primary-color', formatOptions.primaryColor);
      tempContainer.style.setProperty('--primary-color', formatOptions.primaryColor);
    }
    
    if (formatOptions.secondaryColor) {
      pageClone.style.setProperty('--secondary-color', formatOptions.secondaryColor);
      tempContainer.style.setProperty('--secondary-color', formatOptions.secondaryColor);
    }
    
    // 应用字体和大小
    if (formatOptions.fontFamily) {
      const fontFamilyValue = formatOptions.fontFamily === 'serif' 
        ? 'Georgia, Times New Roman, serif' 
        : formatOptions.fontFamily === 'mono' 
          ? 'Menlo, Monaco, monospace' 
          : 'Arial, Helvetica, sans-serif';
      
      pageClone.style.fontFamily = fontFamilyValue;
    }
    
    // 应用边距设置
    let top = '2.54cm';
    let bottom = '2.54cm';
    let left = '2.54cm';
    let right = '2.54cm';
    
    // 根据页面边距设置应用预设值
    if (formatOptions.pageMargins === 'normal') {
      top = bottom = left = right = '2.54cm';
    } else if (formatOptions.pageMargins === 'narrow') {
      top = bottom = left = right = '1.27cm';
    } else if (formatOptions.pageMargins === 'moderate') {
      top = bottom = '2.54cm';
      left = right = '1.91cm';
    }
    
    // 应用自定义边距（如果有）
    if (formatOptions.marginTop) top = formatOptions.marginTop;
    if (formatOptions.marginBottom) bottom = formatOptions.marginBottom;
    if (formatOptions.marginLeft) left = formatOptions.marginLeft;
    if (formatOptions.marginRight) right = formatOptions.marginRight;
    
    // 设置边距
    pageClone.style.padding = `${top} ${right} ${bottom} ${left}`;
    
    // 应用行距和段落间距
    let lineHeight = '1.5';
    if (formatOptions.lineSpacing === 'small') lineHeight = '1.3';
    if (formatOptions.lineSpacing === 'large') lineHeight = '1.8';
    
    // 设置行距
    pageClone.style.lineHeight = lineHeight;
    
    // 应用段落和区块间距 - 这些需要应用到所有内容块
    const sectionSpacing = formatOptions.sectionSpacing === 'small' ? '1rem' : 
                           formatOptions.sectionSpacing === 'large' ? '2rem' : '1.5rem';
    
    const paragraphSpacing = formatOptions.paragraphSpacing === 'small' ? '0.5rem' : 
                             formatOptions.paragraphSpacing === 'large' ? '1rem' : '0.75rem';
    
    // 应用到标题和块元素
    const sectionTitles = pageClone.querySelectorAll('.section-title, h2');
    sectionTitles.forEach(title => {
      (title as HTMLElement).style.marginTop = sectionSpacing;
    });
    
    // 应用到段落和列表项
    const paragraphs = pageClone.querySelectorAll('p, li');
    paragraphs.forEach(p => {
      (p as HTMLElement).style.marginBottom = paragraphSpacing;
    });
    
    // 应用字体大小
    let fontSize = '16px';
    if (formatOptions.fontSize === 'small') fontSize = '14px';
    if (formatOptions.fontSize === 'large') fontSize = '18px';
    
    pageClone.style.fontSize = fontSize;
    
    // 应用文本对齐设置
    const headingAlign = formatOptions.headingAlign || 'left';
    const contentAlign = formatOptions.contentAlign || 'left';
    
    const headings = pageClone.querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title');
    headings.forEach(heading => {
      (heading as HTMLElement).style.textAlign = headingAlign;
    });
    
    const contentElements = pageClone.querySelectorAll('p, li, div:not(.section-title)');
    contentElements.forEach(element => {
      // 避免修改已有特定对齐方式的元素
      if (!(element as HTMLElement).style.textAlign) {
        (element as HTMLElement).style.textAlign = contentAlign;
      }
    });
    
    // 显示/隐藏边框
    if (formatOptions.showBorders === false) {
      const borderedElements = pageClone.querySelectorAll('[style*="border"]');
      borderedElements.forEach(el => {
        (el as HTMLElement).style.border = 'none';
      });
    }
    
    // 显示/隐藏项目符号
    const listItems = pageClone.querySelectorAll('li');
    listItems.forEach(item => {
      if (formatOptions.showBullets === false) {
        (item.parentElement as HTMLElement).style.listStyleType = 'none';
      } else {
        (item.parentElement as HTMLElement).style.listStyleType = 'disc';
      }
    });
  } else {
    // 如果没有格式选项，设置默认边距
    pageClone.style.padding = '2.54cm';
    pageClone.style.margin = '0';
  }
  
  // 添加到容器
  tempContainer.appendChild(pageClone);
  document.body.appendChild(tempContainer);
  
  // 等待一帧确保DOM更新
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return pageClone;
} 