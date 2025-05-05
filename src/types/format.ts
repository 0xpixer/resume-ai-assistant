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