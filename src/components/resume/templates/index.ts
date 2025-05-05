import { ComponentType } from 'react';
import { Resume, FormatOptions } from '@/types/resume';
import dynamic from 'next/dynamic';

export interface ResumeTemplateProps {
  resume: Resume;
  formatOptions: FormatOptions;
}

// Dynamic imports for all templates
export const ElegantSpacedTemplate = dynamic(() => import('./ElegantSpacedTemplate'));
export const ClassicTemplate = dynamic(() => import('./ClassicTemplate'));
export const ModernTemplate = dynamic(() => import('./ModernTemplate'));
export const CreativeTemplate = dynamic(() => import('./CreativeTemplate'));
export const MinimalTemplate = dynamic(() => import('./MinimalTemplate'));
export const TwoColumnTemplate = dynamic(() => import('./TwoColumnTemplate'));
export const MinimalElegantTemplate = dynamic(() => import('./MinimalElegantTemplate'));

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  preview: string;
  component: ComponentType<ResumeTemplateProps>;
  defaultStyles?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: string;
    fontFamily?: string;
    headingAlign?: 'left' | 'center' | 'right';
    contentAlign?: 'left' | 'center' | 'right';
    lineSpacing?: 'small' | 'medium' | 'large';
    showBorders?: boolean;
    compactLayout?: boolean;
  };
}

// Available templates configuration
export const availableTemplates: TemplateConfig[] = [
  {
    id: 'elegant-spaced',
    name: 'Elegant Spaced',
    description: 'A clean and elegant template with generous spacing',
    preview: '/templates/elegant-spaced.png',
    component: ElegantSpacedTemplate,
    defaultStyles: {
      primaryColor: '#333333',
      secondaryColor: '#666666',
      fontSize: 'medium',
      fontFamily: 'sans',
      headingAlign: 'left' as const,
      contentAlign: 'left' as const,
      lineSpacing: 'medium' as const,
      showBorders: false,
      compactLayout: false
    }
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    description: 'A minimalist template with elegant typography',
    preview: '/templates/minimal-elegant.png',
    component: MinimalElegantTemplate,
    defaultStyles: {
      primaryColor: '#eb3d24',
      secondaryColor: '#666666',
      fontSize: 'medium',
      fontFamily: 'sans',
      headingAlign: 'left' as const,
      contentAlign: 'left' as const,
      lineSpacing: 'medium' as const,
      showBorders: false,
      compactLayout: false
    }
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional and professional template',
    preview: '/templates/classic.png',
    component: ClassicTemplate,
    defaultStyles: {
      primaryColor: '#0c3b5f',
      secondaryColor: '#4a6072',
      fontSize: 'medium',
      fontFamily: 'sans',
      headingAlign: 'left' as const,
      contentAlign: 'left' as const,
      lineSpacing: 'medium' as const,
      showBorders: true,
      compactLayout: false
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'A contemporary and stylish template',
    preview: '/templates/modern.png',
    component: ModernTemplate,
    defaultStyles: {
      primaryColor: '#2563eb',
      secondaryColor: '#475569',
      fontSize: 'medium',
      fontFamily: 'sans',
      headingAlign: 'left' as const,
      contentAlign: 'left' as const,
      lineSpacing: 'medium' as const,
      showBorders: false,
      compactLayout: false
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A simple and clean template',
    preview: '/templates/minimal.png',
    component: MinimalTemplate,
    defaultStyles: {
      primaryColor: '#333333',
      secondaryColor: '#777777',
      fontSize: 'medium',
      fontFamily: 'sans',
      headingAlign: 'left' as const,
      contentAlign: 'left' as const,
      lineSpacing: 'medium' as const,
      showBorders: false,
      compactLayout: false
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'A unique and eye-catching template',
    preview: '/templates/creative.png',
    component: CreativeTemplate,
    defaultStyles: {
      primaryColor: '#7C3AED',
      secondaryColor: '#8B5CF6',
      fontSize: 'medium',
      fontFamily: 'sans',
      headingAlign: 'left' as const,
      contentAlign: 'left' as const,
      lineSpacing: 'medium' as const,
      showBorders: false,
      compactLayout: false
    }
  },
  {
    id: 'two-column',
    name: 'Two Column',
    description: 'A balanced two-column layout',
    preview: '/templates/two-column.png',
    component: TwoColumnTemplate,
    defaultStyles: {
      primaryColor: '#eb3d24',
      secondaryColor: '#333333',
      fontSize: 'medium',
      fontFamily: 'sans',
      headingAlign: 'left' as const,
      contentAlign: 'left' as const,
      lineSpacing: 'medium' as const,
      showBorders: false,
      compactLayout: false
    }
  }
];

// Get template component by ID
export const getTemplateComponent = (templateId: string): ComponentType<ResumeTemplateProps> | null => {
  const template = availableTemplates.find(t => t.id === templateId);
  return template?.component || null;
};

// Get template config by ID
export const getTemplateConfig = (templateId: string): TemplateConfig | null => {
  return availableTemplates.find(t => t.id === templateId) || null;
};

// Get all available templates
export const getAvailableTemplates = () => {
  return availableTemplates.map(({ id, name, description, preview }) => ({
    id,
    name,
    description,
    preview
  }));
}; 