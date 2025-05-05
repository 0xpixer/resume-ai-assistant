/**
 * 简历数据类型定义文件
 * 包含所有与简历相关的类型声明
 */

/**
 * 联系信息
 */
export interface ContactInfo {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

/**
 * 工作经验项
 */
export interface ExperienceItem {
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrentPosition?: boolean;
  achievements: string[];
  keywords?: string[];
}

/**
 * 教育经历项
 */
export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  achievements?: string[];
  courses?: string[];
}

/**
 * 技能类别
 */
export type SkillCategory = 'technical' | 'soft' | 'language' | 'tool' | 'other';

/**
 * 技能项
 */
export interface SkillItem {
  name: string;
  level?: number; // 1-5 表示熟练度
  category: SkillCategory;
  years?: number; // 使用年限
}

/**
 * 证书和资格
 */
export interface CertificationItem {
  name: string;
  issuer?: string;
  date?: string;
  expiryDate?: string;
  url?: string;
  description?: string;
}

/**
 * 项目经历
 */
export interface ProjectItem {
  name: string;
  description?: string;
  role?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  achievements?: string[];
}

/**
 * Resume Analysis Metrics
 */
export interface ResumeMetrics {
  characters: number;
  words: number;
  sections: number;
  bulletPoints: number;
  actionVerbs: number;
  keywords: string[];
  suggestedKeywords?: string[];
  spelling: boolean;
  grammar: boolean;
  formatting: boolean;
}

/**
 * 语言能力项
 */
export interface LanguageItem {
  name: string;
  proficiency: string; // 如: "Native", "Fluent", "Intermediate", "Basic"
}

/**
 * 简历完整数据结构
 */
export interface Resume {
  // 基本信息
  contactInfo: ContactInfo;
  
  // 目标职位
  targetTitles?: string[];
  
  // 专业摘要
  summary?: string;
  
  // 工作经验
  experience: ExperienceItem[];
  
  // 教育背景
  education: EducationItem[];
  
  // 技能（分类）
  skills: SkillItem[];
  
  // 证书和资格
  certifications?: CertificationItem[];
  
  // 项目经历
  projects?: ProjectItem[];
  
  // 语言能力
  languages?: LanguageItem[];
  
  // 兴趣爱好
  interests?: string[];
  
  // 引用/推荐
  references?: {
    name: string;
    relationship: string;
    company?: string;
    contact?: string;
    statement?: string;
  }[];
  
  // 原始文本
  rawText?: string;
  
  // 分析指标
  metrics?: ResumeMetrics;
  
  // 反馈数据
  feedback?: {
    categories: {
      name: string;
      issues: {
        issue: string;
        fix: string;
      }[];
    }[];
  };
}

/**
 * 解析后的简历数据
 * 兼容旧版API，同时支持新的详细结构
 */
export interface ParsedResume {
  // 基础字段 (兼容旧版API)
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  languages?: string[];
  certifications?: string[];
  rawText?: string;
  
  // 新的结构化数据
  structured?: Resume;
}

/**
 * 简历模板类型
 */
export interface ResumeTemplate {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  isPremium: boolean;
  category: 'professional' | 'creative' | 'simple' | 'modern' | 'premium';
}

/**
 * Resume Analysis Results
 */
export interface ResumeAnalysis {
  score: number; // 总体得分 0-100
  metrics: ResumeMetrics;
  suggestions: {
    category: string;
    text: string;
    importance: 'high' | 'medium' | 'low';
  }[];
  matchScore?: number; // 与目标职位的匹配度
}

/**
 * 内容生成请求类型
 */
export interface ContentGenerationRequest {
  type: 'summary' | 'experience' | 'achievement' | 'analysis' | 'skills' | 'full';
  data: any; // 根据type不同，传递不同的数据
  targetJob?: string;
  jobDescription?: string;
  tone?: 'professional' | 'conversational' | 'enthusiastic';
  length?: 'concise' | 'standard' | 'detailed';
}

/**
 * 内容生成响应类型
 */
export interface ContentGenerationResponse {
  content: string;
  alternatives?: string[];
  keywordsUsed?: string[];
  analysis?: {
    actionVerbs: number;
    metrics: number;
    bullets: number;
    readability: number;
  };
}

// 扩展简历类型，包含额外的元数据
export interface ResumeWithMetadata extends Resume {
  id: string;
  name: string;
  score?: number;
  matchedJob?: string;
  match?: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  feedback?: {
    categories: {
      name: string;
      issues: {
        issue: string;
        fix: string;
      }[];
    }[];
  };
}

export interface FormatOptions {
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing: 'small' | 'medium' | 'large';
  paragraphSpacing: 'small' | 'medium' | 'large';
  showBorders: boolean;
  compactLayout: boolean;
  pageMargins: 'normal' | 'narrow' | 'moderate';
  headingAlign: 'left' | 'center' | 'right';
  contentAlign: 'left' | 'center' | 'right';
  marginLeft: string;
  marginRight: string;
  marginTop: string;
  marginBottom: string;
  template: TemplateType;
  primaryColor: string;
  secondaryColor: string;
  showBullets: boolean;
  sectionSpacing: 'small' | 'medium' | 'large';
}

export type TemplateType = 'classic' | 'modern' | 'minimal' | 'creative' | 'two-column' | 'minimal-elegant' | 'elegant-spaced'; 