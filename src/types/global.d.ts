declare module 'pdfjs-dist' {
  // PDF.js 类型
  export function getDocument(options: {
    data: ArrayBuffer;
    canvasFactory?: any;
    standardFontDataUrl?: string;
  }): { promise: PDFDocumentProxy };
  
  export const version: string;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  
  export interface PDFPageProxy {
    getTextContent(): Promise<PDFTextContent>;
  }
  
  export interface PDFTextContent {
    items: PDFTextItem[];
  }
  
  export interface PDFTextItem {
    str: string;
  }
} 