/**
 * pdf-parse 模块类型定义
 */
declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: {
      [key: string]: any;
    } | null;
    text: string;
    version: string;
  }

  interface PDFOptions {
    pagerender?: (pageData: {
      pageIndex: number;
      pageContent: any;
      parsePage?: boolean;
    }) => Promise<string>;
    max?: number;
    version?: string;
  }

  type PDFParse = (
    dataBuffer: Buffer | Uint8Array,
    options?: PDFOptions
  ) => Promise<PDFData>;

  const pdfParse: PDFParse;
  export default pdfParse;
}
