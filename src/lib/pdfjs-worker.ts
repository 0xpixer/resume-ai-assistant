'use client';

import { GlobalWorkerOptions, version } from 'pdfjs-dist';

// 确保 worker 只在客户端环境中设置
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  // 设置 worker 路径
  GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
}

// 重新导出以便在解析器中使用
import * as pdfjsLib from 'pdfjs-dist';
export default pdfjsLib; 