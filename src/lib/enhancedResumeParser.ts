'use client';

import pdfjsLib from './pdfjs-worker';
import { 
  Resume, 
  ParsedResume, 
  ExperienceItem, 
  EducationItem, 
  SkillItem, 
  SkillCategory,
  ProjectItem,
  CertificationItem
} from '../types/resume';

/**
 * 增强版简历解析器
 * 提供更强大的简历解析和数据提取功能
 */

/**
 * 解析PDF文件内容
 * @param file 上传的PDF文件
 * @returns 解析后的简历数据
 */
export async function parseResumeFromPdf(file: File): Promise<ParsedResume> {
  console.log("开始解析PDF简历:", file.name);
  
  try {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    
    console.log(`PDF文档加载成功，共${pdf.numPages}页`);
    
    let fullText = '';
    const textByPage: string[] = [];
    
    // 提取所有页面的文本
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => 'str' in item ? item.str : '')
        .join(' ');
      
      textByPage.push(pageText);
      fullText += pageText + '\n';
    }
    
    console.log("文本提取完成，开始分析结构");
    
    // 使用增强型算法分析简历结构
    return enhancedResumeExtraction(fullText, textByPage);
  } catch (error) {
    console.error("PDF解析失败:", error);
    throw new Error(`简历解析失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 增强型简历内容提取函数
 * 使用更复杂的算法识别简历各部分
 */
function enhancedResumeExtraction(fullText: string, textByPage: string[]): ParsedResume {
  console.log("开始增强型简历内容提取");
  
  // 分段和预处理文本
  const lines = preprocessText(fullText);
  
  // 识别各部分
  const contactInfo = extractContactInfo(fullText, lines);
  const summary = extractSummary(lines);
  const experience = extractExperience(lines, fullText);
  const education = extractEducation(lines);
  const skills = extractSkills(lines, fullText);
  const projects = extractProjects(lines);
  const certifications = extractCertifications(lines);
  const languages = extractLanguages(lines);
  
  // 构建结构化的简历数据
  const structured: Resume = {
    contactInfo,
    summary,
    experience,
    education,
    skills,
    projects: projects || [],
    certifications: certifications || [],
    languages: languages || []
  };
  
  return {
    structured,
    rawText: fullText
  };
}

/**
 * 文本预处理函数
 * 清理和标准化文本
 */
function preprocessText(text: string): string[] {
  // 移除多余的空格
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, '\n')
    .trim();
  
  // 按行分割
  const lines = cleanText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return lines;
}

/**
 * 提取联系信息
 */
function extractContactInfo(fullText: string, lines: string[]) {
  console.log("提取联系信息");
  
  // 通常联系信息在简历的顶部
  const topLines = lines.slice(0, Math.min(15, lines.length));
  const topText = topLines.join(' ');
  
  // 提取姓名 (通常是第一行，且没有特殊字符)
  let name = '';
  for (let i = 0; i < Math.min(5, topLines.length); i++) {
    const line = topLines[i];
    // 姓名行通常较短，不包含特殊字符，不包含@或常见的标题词
    if (line.length > 0 && line.length < 40 && 
        !line.includes('@') && 
        !line.includes(':') && 
        !/resume|cv|curriculum vitae|portfolio|profile/i.test(line) &&
        !/engineer|developer|designer|manager|director/i.test(line)) {
      name = line;
      break;
    }
  }
  
  // 提取电子邮件
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatches = fullText.match(emailRegex) || [];
  const email = emailMatches.length > 0 ? emailMatches[0] : '';
  
  // 提取电话号码
  const phoneRegex = /(?:\+?(\d{1,3})[ -.]?)?(\(?\d{3}\)?[ -.]?)?(\d{3}[ -.]?\d{4})/g;
  const phoneMatches = fullText.match(phoneRegex) || [];
  const phone = phoneMatches.length > 0 ? phoneMatches[0] : '';
  
  // 提取LinkedIn链接
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
  const linkedinMatches = fullText.match(linkedinRegex) || [];
  const linkedin = linkedinMatches.length > 0 ? `https://www.${linkedinMatches[0]}` : '';
  
  // 提取GitHub链接
  const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/gi;
  const githubMatches = fullText.match(githubRegex) || [];
  const github = githubMatches.length > 0 ? `https://www.${githubMatches[0]}` : '';
  
  // 提取个人网站
  const websiteRegex = /https?:\/\/(?!linkedin\.com|github\.com)[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi;
  const websiteMatches = fullText.match(websiteRegex) || [];
  const website = websiteMatches.length > 0 ? websiteMatches[0] : '';
  
  // 提取职位
  let title = '';
  const titleKeywords = [
    'software engineer', 'developer', 'programmer', 'web developer',
    'full stack', 'frontend', 'backend', 'data scientist', 'analyst',
    'project manager', 'product manager', 'designer', 'architect'
  ];
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    for (const keyword of titleKeywords) {
      if (line.includes(keyword) && line.length < 60) {
        title = lines[i];
        break;
      }
    }
    if (title) break;
  }
  
  // 提取位置
  const locationRegex = /[A-Z][a-zA-Z]+(?:[ ,]+[A-Z][a-zA-Z]+)*,[ ]*(?:[A-Z]{2}|[A-Z][a-zA-Z]+)(?:[ ,]+[0-9]{5}(?:-[0-9]{4})?)?/g;
  const locationMatches = fullText.match(locationRegex) || [];
  // 过滤掉可能的公司名称和其他非位置字符串
  const location = locationMatches.length > 0 ? locationMatches[0] : '';
  
  return {
    name,
    title,
    email,
    phone,
    location,
    website,
    linkedin,
    github
  };
}

/**
 * 提取简历摘要
 */
function extractSummary(lines: string[]): string {
  console.log("提取简历摘要");
  
  // 摘要通常在简历的顶部，联系信息下方
  // 先检测可能的摘要段落标题
  const summaryHeaders = [
    'summary', 'professional summary', 'profile', 'professional profile',
    'about me', 'career objective', 'objective', 'personal statement',
    'overview', 'career summary'
  ];
  
  // 查找摘要的开始
  let summaryStartIndex = -1;
  let summaryEndIndex = -1;
  
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].toLowerCase();
    
    // 检查此行是否包含摘要标题
    if (summaryHeaders.some(header => line.includes(header))) {
      summaryStartIndex = i;
      break;
    }
  }
  
  // 如果找到摘要标题
  if (summaryStartIndex !== -1) {
    // 寻找摘要的结束（通常是下一个大标题或空行）
    for (let i = summaryStartIndex + 1; i < Math.min(summaryStartIndex + 15, lines.length); i++) {
      const line = lines[i].toLowerCase();
      
      // 检查是否遇到了新的章节标题
      if (
        line.includes('experience') || 
        line.includes('education') || 
        line.includes('skills') || 
        line.includes('certifications') ||
        line.includes('projects') ||
        line.length < 3 // 可能是章节分隔的空行
      ) {
        summaryEndIndex = i;
        break;
      }
    }
    
    // 如果没有明确找到结束，设置一个合理的结束位置
    if (summaryEndIndex === -1) {
      summaryEndIndex = Math.min(summaryStartIndex + 10, lines.length);
    }
    
    // 提取摘要文本，跳过标题行
    const summaryLines = lines.slice(summaryStartIndex + 1, summaryEndIndex);
    return summaryLines.join(' ').trim();
  }
  
  // 如果找不到明确的摘要标题，尝试提取开头的几行作为摘要（跳过姓名和联系信息）
  for (let i = 5; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    // 排除可能是联系信息的行
    if (
      line.length > 20 && 
      !line.includes('@') && 
      !line.match(/^\d/) && 
      !line.includes('github.com') && 
      !line.includes('linkedin.com')
    ) {
      // 尝试提取接下来的几行作为摘要
      const potentialSummary = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
      if (potentialSummary.length > 50) {
        return potentialSummary;
      }
    }
  }
  
  // 如果找不到任何合适的摘要
  return '';
}

/**
 * 提取工作经验
 */
function extractExperience(lines: string[], fullText: string): ExperienceItem[] {
  console.log("提取工作经验");
  
  const experience: ExperienceItem[] = [];
  
  // 识别工作经验部分
  const experienceHeaders = [
    'experience', 'work experience', 'professional experience', 
    'employment history', 'work history', 'career history'
  ];
  
  // 找到经验部分的开始
  let experienceStartIndex = -1;
  let experienceEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (experienceHeaders.some(header => line.includes(header) && !line.includes('education'))) {
      experienceStartIndex = i;
      break;
    }
  }
  
  if (experienceStartIndex === -1) {
    console.log("未找到工作经验部分");
    return [];
  }
  
  // 寻找经验部分的结束（下一个主要章节）
  for (let i = experienceStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (
      line.includes('education') || 
      line.includes('skills') || 
      line.includes('certifications') ||
      line.includes('projects') ||
      (i > experienceStartIndex + 5 && line.length < 3) // 可能是章节分隔的空行
    ) {
      experienceEndIndex = i;
      break;
    }
  }
  
  // 如果没有明确找到结束，使用剩余文本
  if (experienceEndIndex === -1) {
    experienceEndIndex = lines.length;
  }
  
  // 提取经验部分的文本
  const experienceLines = lines.slice(experienceStartIndex + 1, experienceEndIndex);
  
  // 使用日期作为可能的工作经验分隔符
  const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(-|–|to)\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(\d{1,2}\/\d{4})\s*(-|–|to)\s*(\d{1,2}\/\d{4})|(\d{4})\s*(-|–|to)\s*(\d{4}|Present|present|Current|current)/gi;
  
  // 找到所有可能的工作经验条目
  let currentJobStartIndex = 0;
  
  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i];
    
    // 检查是否包含日期模式，这通常表示一个新的工作经验条目
    if (line.match(dateRegex) || 
        (i > 0 && line.length < 60 && !line.includes('•') && !line.includes('-') && line.split(' ').length < 10)) {
      
      // 如果已经有积累的行，处理之前的工作经验
      if (currentJobStartIndex < i) {
        const jobLines = experienceLines.slice(currentJobStartIndex, i);
        const jobItem = parseExperienceItem(jobLines);
        
        if (jobItem.company) {
          experience.push(jobItem);
        }
      }
      
      currentJobStartIndex = i;
    }
  }
  
  // 处理最后一个工作经验
  if (currentJobStartIndex < experienceLines.length) {
    const jobLines = experienceLines.slice(currentJobStartIndex);
    const jobItem = parseExperienceItem(jobLines);
    
    if (jobItem.company) {
      experience.push(jobItem);
    }
  }
  
  return experience;
}

/**
 * 解析单个工作经验条目
 */
function parseExperienceItem(lines: string[]): ExperienceItem {
  // 默认空对象
  const item: ExperienceItem = {
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrentPosition: false,
    achievements: []
  };
  
  if (lines.length === 0) {
    return item;
  }
  
  // 第一行通常包含公司名称，职位，有时也有日期
  const firstLine = lines[0];
  
  // 提取日期
  const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(-|–|to)\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(\d{1,2}\/\d{4})\s*(-|–|to)\s*(\d{1,2}\/\d{4})|(\d{4})\s*(-|–|to)\s*(\d{4}|Present|present|Current|current)/gi;
  const dateMatch = firstLine.match(dateRegex);
  
  if (dateMatch) {
    const dateParts = dateMatch[0].split(/(-|–|to)/i);
    item.startDate = dateParts[0].trim();
    item.endDate = dateParts[2] ? dateParts[2].trim() : '';
    
    // 检查是否为当前职位
    if (item.endDate.toLowerCase().includes('present') || item.endDate.toLowerCase().includes('current')) {
      item.isCurrentPosition = true;
    }
  }
  
  // 尝试提取公司名称和职位
  // 假设格式可能是 "公司名 - 职位" 或 "职位 at 公司名"
  const companyPositionLine = firstLine.replace(dateRegex, '').trim();
  
  if (companyPositionLine.includes(' - ')) {
    const parts = companyPositionLine.split(' - ');
    item.company = parts[0].trim();
    item.position = parts[1].trim();
  } else if (companyPositionLine.includes(' at ')) {
    const parts = companyPositionLine.split(' at ');
    item.position = parts[0].trim();
    item.company = parts[1].trim();
  } else {
    // 如果没有明确的分隔符，假设第一行是公司名
    item.company = companyPositionLine;
    
    // 尝试从第二行获取职位（如果存在）
    if (lines.length > 1) {
      item.position = lines[1].trim();
    }
  }
  
  // 提取工作地点
  const locationRegex = /[A-Z][a-zA-Z]+(?:[ ,]+[A-Z][a-zA-Z]+)*,[ ]*(?:[A-Z]{2}|[A-Z][a-zA-Z]+)/;
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const locationMatch = lines[i].match(locationRegex);
    if (locationMatch) {
      item.location = locationMatch[0];
      break;
    }
  }
  
  // 提取成就和工作描述（通常是项目符号或短段落）
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过可能是职位或位置的短行
    if (i <= 2 && line.length < 30) {
      continue;
    }
    
    // 查找项目符号或描述性文本
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 30) {
      // 清理项目符号
      const achievement = line.replace(/^[•\-\*]\s*/, '').trim();
      if (achievement && achievement.length > 10) {
        item.achievements.push(achievement);
      }
    }
  }
  
  return item;
}

/**
 * 提取教育背景
 */
function extractEducation(lines: string[]): EducationItem[] {
  console.log("提取教育背景");
  
  const education: EducationItem[] = [];
  
  // 识别教育部分
  const educationHeaders = [
    'education', 'academic background', 'educational background', 
    'academic history', 'educational history', 'academic qualifications'
  ];
  
  // 找到教育部分的开始
  let educationStartIndex = -1;
  let educationEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (educationHeaders.some(header => line.includes(header))) {
      educationStartIndex = i;
      break;
    }
  }
  
  if (educationStartIndex === -1) {
    console.log("未找到教育背景部分");
    return [];
  }
  
  // 寻找教育部分的结束（下一个主要章节）
  for (let i = educationStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (
      line.includes('experience') && !line.includes('education') || 
      line.includes('skills') || 
      line.includes('certifications') ||
      line.includes('projects') ||
      (i > educationStartIndex + 5 && line.length < 3) // 可能是章节分隔的空行
    ) {
      educationEndIndex = i;
      break;
    }
  }
  
  // 如果没有明确找到结束，使用剩余文本
  if (educationEndIndex === -1) {
    educationEndIndex = lines.length;
  }
  
  // 提取教育部分的文本
  const educationLines = lines.slice(educationStartIndex + 1, educationEndIndex);
  
  // 使用日期和学位作为可能的教育经历分隔符
  const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(-|–|to)\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(\d{1,2}\/\d{4})\s*(-|–|to)\s*(\d{1,2}\/\d{4})|(\d{4})\s*(-|–|to)\s*(\d{4}|Present|present|Current|current)|graduated:?\s+\d{4}/gi;
  const degreeRegex = /bachelor|master|phd|doctorate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|m\.b\.a\.|b\.eng/i;
  
  // 找到所有可能的教育经历条目
  let currentEduStartIndex = 0;
  
  for (let i = 0; i < educationLines.length; i++) {
    const line = educationLines[i];
    
    // 检查是否包含日期或学位模式，这通常表示一个新的教育经历条目
    if (line.match(dateRegex) || line.match(degreeRegex) || 
        (i > 0 && line.length < 60 && line.split(' ').length < 10 && 
         (line.includes('University') || line.includes('College') || line.includes('School')))) {
      
      // 如果已经有积累的行，处理之前的教育经历
      if (currentEduStartIndex < i) {
        const eduLines = educationLines.slice(currentEduStartIndex, i);
        const eduItem = parseEducationItem(eduLines);
        
        if (eduItem.institution) {
          education.push(eduItem);
        }
      }
      
      currentEduStartIndex = i;
    }
  }
  
  // 处理最后一个教育经历
  if (currentEduStartIndex < educationLines.length) {
    const eduLines = educationLines.slice(currentEduStartIndex);
    const eduItem = parseEducationItem(eduLines);
    
    if (eduItem.institution) {
      education.push(eduItem);
    }
  }
  
  return education;
}

/**
 * 解析单个教育经历条目
 */
function parseEducationItem(lines: string[]): EducationItem {
  // 默认空对象
  const item: EducationItem = {
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    achievements: []
  };
  
  if (lines.length === 0) {
    return item;
  }
  
  // 第一行通常包含学校名称，有时也有日期
  const firstLine = lines[0];
  
  // 提取学校名称 (通常包含 University, College, School 等词)
  const institutionRegex = /([A-Z][a-zA-Z ]+(?:University|College|School|Institute|Academy))/;
  const institutionMatch = firstLine.match(institutionRegex);
  
  if (institutionMatch) {
    item.institution = institutionMatch[0].trim();
  } else {
    // 如果没有找到明确的学校名称，使用第一行
    item.institution = firstLine.trim();
  }
  
  // 提取日期
  const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(-|–|to)\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(\d{1,2}\/\d{4})\s*(-|–|to)\s*(\d{1,2}\/\d{4})|(\d{4})\s*(-|–|to)\s*(\d{4}|Present|present|Current|current)|graduated:?\s+(\d{4})/gi;
  
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const dateMatch = lines[i].match(dateRegex);
    if (dateMatch) {
      // 处理 "Graduated: 2020" 格式
      if (dateMatch[0].toLowerCase().includes('graduated')) {
        const yearMatch = dateMatch[0].match(/\d{4}/);
        if (yearMatch) {
          item.endDate = yearMatch[0];
        }
      } else {
        // 处理标准日期范围
        const dateParts = dateMatch[0].split(/(-|–|to)/i);
        item.startDate = dateParts[0].trim();
        item.endDate = dateParts[2] ? dateParts[2].trim() : '';
      }
      break;
    }
  }
  
  // 提取学位和专业
  const degreeRegex = /(Bachelor|Master|PhD|Doctorate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Eng)[\.']?(\s+of\s+|\s+in\s+)?(([A-Z][a-zA-Z ]+))?/i;
  
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const degreeMatch = lines[i].match(degreeRegex);
    if (degreeMatch) {
      item.degree = degreeMatch[1].trim();
      if (degreeMatch[4]) {
        item.field = degreeMatch[4].trim();
      }
      break;
    }
  }
  
  // 如果没有找到学位，尝试从所有行中查找
  if (!item.degree) {
    const allText = lines.join(' ');
    const commonDegrees = [
      'Bachelor of Science', 'Bachelor of Arts', 'Master of Science',
      'Master of Arts', 'PhD', 'Doctorate', 'MBA', 'BSc', 'BA', 'MSc', 'MA'
    ];
    
    for (const degree of commonDegrees) {
      if (allText.includes(degree)) {
        item.degree = degree;
        
        // 尝试提取专业领域 (通常跟在学位后面)
        const degreeIndex = allText.indexOf(degree);
        const afterDegree = allText.substring(degreeIndex + degree.length).trim();
        
        if (afterDegree.startsWith('in ')) {
          const field = afterDegree.substring(3).split(/[,.]|\s{2,}/)[0];
          if (field.length < 50) {
            item.field = field;
          }
        }
        
        break;
      }
    }
  }
  
  // 提取GPA
  const gpaRegex = /GPA:?\s*([\d.]+)(?:\/[\d.]+)?/i;
  for (let i = 0; i < lines.length; i++) {
    const gpaMatch = lines[i].match(gpaRegex);
    if (gpaMatch) {
      item.gpa = gpaMatch[1];
      break;
    }
  }
  
  // 提取成就和荣誉
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过包含日期、学位等信息的行
    if (line.match(dateRegex) || line.match(degreeRegex) || line.match(gpaRegex)) {
      continue;
    }
    
    // 查找项目符号或描述性文本
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      // 清理项目符号
      const achievement = line.replace(/^[•\-\*]\s*/, '').trim();
      if (achievement && achievement.length > 5) {
        item.achievements?.push(achievement);
      }
    }
  }
  
  return item;
}

/**
 * 提取技能
 */
function extractSkills(lines: string[], fullText: string): SkillItem[] {
  console.log("提取技能");
  
  // 技能关键词库 - 按类别分组
  const skillKeywords = {
    technical: [
      'JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js',
      'Express', 'Next.js', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET',
      'C++', 'Rust', 'Go', 'Ruby', 'Rails', 'PHP', 'Laravel', 'Swift', 'Kotlin',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'GraphQL',
      'REST API', 'Firebase', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
      'CI/CD', 'Git', 'GitHub', 'GitLab', 'Webpack', 'Babel', 'ESLint', 'Jest', 'Mocha',
      'Selenium', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
      'Data Science', 'Machine Learning', 'Artificial Intelligence', 'NLP',
      'Computer Vision', 'Blockchain', 'Smart Contracts', 'Solidity', 'Ethereum'
    ],
    soft: [
      'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
      'Time Management', 'Project Management', 'Organizational', 'Adaptability',
      'Creativity', 'Analytical', 'Interpersonal', 'Presentation', 'Negotiation',
      'Conflict Resolution', 'Decision Making', 'Customer Service', 'Mentoring'
    ],
    language: [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
      'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali', 'Urdu'
    ],
    tool: [
      'Microsoft Office', 'Word', 'Excel', 'PowerPoint', 'Outlook', 'Google Workspace',
      'Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Sketch', 'Adobe XD',
      'Final Cut Pro', 'Premiere Pro', 'After Effects', 'Audition', 'Blender',
      'AutoCAD', 'Revit', 'MATLAB', 'Tableau', 'Power BI', 'Looker', 'Jira',
      'Confluence', 'Trello', 'Asana', 'Notion', 'Slack', 'Teams'
    ]
  };
  
  // 识别技能部分
  const skillsHeaders = [
    'skills', 'technical skills', 'core skills', 'key skills',
    'competencies', 'proficiencies', 'expertise', 'qualifications'
  ];
  
  // 找到技能部分的开始
  let skillsStartIndex = -1;
  let skillsEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (skillsHeaders.some(header => line.includes(header))) {
      skillsStartIndex = i;
      break;
    }
  }
  
  if (skillsStartIndex === -1) {
    console.log("未找到明确的技能部分，尝试从全文识别技能");
    return extractSkillsFromFullText(fullText);
  }
  
  // 寻找技能部分的结束（下一个主要章节）
  for (let i = skillsStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (
      line.includes('experience') && !line.includes('skills') || 
      line.includes('education') && !line.includes('skills') || 
      line.includes('certifications') ||
      line.includes('projects') ||
      line.includes('languages') && !line.includes('programming') ||
      (i > skillsStartIndex + 5 && line.length < 3) // 可能是章节分隔的空行
    ) {
      skillsEndIndex = i;
      break;
    }
  }
  
  // 如果没有明确找到结束，使用剩余文本
  if (skillsEndIndex === -1) {
    skillsEndIndex = lines.length;
  }
  
  // 提取技能部分的文本
  const skillsLines = lines.slice(skillsStartIndex + 1, skillsEndIndex);
  
  // 分析技能文本
  return parseSkillsFromLines(skillsLines, skillKeywords);
}

/**
 * 从特定的技能部分解析技能
 */
function parseSkillsFromLines(lines: string[], skillKeywords: Record<string, string[]>): SkillItem[] {
  const skills: SkillItem[] = [];
  const processedSkills = new Set<string>(); // 避免重复
  
  // 检查技能分组
  let currentCategory: SkillCategory = 'technical';
  
  for (const line of lines) {
    // 检查是否是类别标题
    if (/technical|programming|development/i.test(line) && line.length < 30) {
      currentCategory = 'technical';
      continue;
    } else if (/soft|interpersonal/i.test(line) && line.length < 30) {
      currentCategory = 'soft';
      continue;
    } else if (/language|spoken/i.test(line) && !line.includes('programming') && line.length < 30) {
      currentCategory = 'language';
      continue;
    } else if (/tool|software|platform/i.test(line) && line.length < 30) {
      currentCategory = 'tool';
      continue;
    }
    
    // 提取此行中的技能
    const cleanedLine = line.replace(/^[•\-\*]\s*/, '').trim();
    
    // 如果是项目符号列表或短的技能条目
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length < 50) {
      // 分割可能的逗号分隔列表
      const potentialSkills = cleanedLine.split(/[,|;]/);
      
      for (const potentialSkill of potentialSkills) {
        const skill = potentialSkill.trim();
        
        // 跳过过短的技能名称
        if (skill.length < 2) continue;
        
        // 确定技能类别和添加技能
        addSkillWithCategory(skill, currentCategory, skills, processedSkills, skillKeywords);
      }
    } else if (cleanedLine.length > 0) {
      // 对于较长的文本，尝试识别其中的技能关键词
      for (const category in skillKeywords) {
        for (const keyword of skillKeywords[category as keyof typeof skillKeywords]) {
          if (cleanedLine.toLowerCase().includes(keyword.toLowerCase())) {
            addSkillWithCategory(keyword, category as SkillCategory, skills, processedSkills, skillKeywords);
          }
        }
      }
    }
  }
  
  return skills;
}

/**
 * 从全文中提取技能
 */
function extractSkillsFromFullText(fullText: string): SkillItem[] {
  const skills: SkillItem[] = [];
  const processedSkills = new Set<string>(); // 避免重复
  
  // 技能关键词库
  const skillKeywords = {
    technical: [
      'JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js',
      'Express', 'Next.js', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET',
      'C++', 'Rust', 'Go', 'Ruby', 'Rails', 'PHP', 'Laravel', 'Swift', 'Kotlin',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'GraphQL',
      'REST API', 'Firebase', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
      'CI/CD', 'Git', 'GitHub', 'GitLab', 'Webpack', 'Babel', 'ESLint', 'Jest', 'Mocha',
      'Selenium', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
      'Data Science', 'Machine Learning', 'Artificial Intelligence', 'NLP',
      'Computer Vision', 'Blockchain', 'Smart Contracts', 'Solidity', 'Ethereum'
    ],
    soft: [
      'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
      'Time Management', 'Project Management', 'Organizational', 'Adaptability',
      'Creativity', 'Analytical', 'Interpersonal', 'Presentation', 'Negotiation',
      'Conflict Resolution', 'Decision Making', 'Customer Service', 'Mentoring'
    ],
    language: [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
      'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali', 'Urdu'
    ],
    tool: [
      'Microsoft Office', 'Word', 'Excel', 'PowerPoint', 'Outlook', 'Google Workspace',
      'Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Sketch', 'Adobe XD',
      'Final Cut Pro', 'Premiere Pro', 'After Effects', 'Audition', 'Blender',
      'AutoCAD', 'Revit', 'MATLAB', 'Tableau', 'Power BI', 'Looker', 'Jira',
      'Confluence', 'Trello', 'Asana', 'Notion', 'Slack', 'Teams'
    ]
  };
  
  // 搜索全文中的技能关键词
  for (const category in skillKeywords) {
    for (const keyword of skillKeywords[category as keyof typeof skillKeywords]) {
      if (fullText.toLowerCase().includes(keyword.toLowerCase())) {
        addSkillWithCategory(keyword, category as SkillCategory, skills, processedSkills, skillKeywords);
      }
    }
  }
  
  return skills;
}

/**
 * 添加技能并确定类别
 */
function addSkillWithCategory(
  skill: string, 
  defaultCategory: SkillCategory, 
  skills: SkillItem[], 
  processedSkills: Set<string>,
  skillKeywords: Record<string, string[]>
) {
  // 规范化技能名称并检查是否已处理
  const normalizedSkill = skill.trim();
  if (normalizedSkill.length < 2 || processedSkills.has(normalizedSkill.toLowerCase())) {
    return;
  }
  
  // 尝试确定更准确的类别（如果默认类别不匹配）
  let category = defaultCategory;
  let exactMatch = false;
  
  // 检查技能是否在任何类别的关键词列表中
  for (const cat in skillKeywords) {
    if (skillKeywords[cat as keyof typeof skillKeywords].some(
      keyword => keyword.toLowerCase() === normalizedSkill.toLowerCase()
    )) {
      category = cat as SkillCategory;
      exactMatch = true;
      break;
    }
  }
  
  // 如果没有精确匹配，但我们有基于上下文的默认类别，继续使用它
  
  // 添加技能
  skills.push({
    name: normalizedSkill,
    category,
    level: 3 // 默认水平，难以从文本中准确判断
  });
  
  // 标记为已处理
  processedSkills.add(normalizedSkill.toLowerCase());
}

/**
 * 提取项目经历
 */
function extractProjects(lines: string[]): ProjectItem[] {
  console.log("提取项目经历");
  
  const projects: ProjectItem[] = [];
  
  // 识别项目部分
  const projectHeaders = [
    'projects', 'project experience', 'selected projects', 
    'key projects', 'personal projects', 'academic projects'
  ];
  
  // 找到项目部分的开始
  let projectsStartIndex = -1;
  let projectsEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (projectHeaders.some(header => line.includes(header))) {
      projectsStartIndex = i;
      break;
    }
  }
  
  if (projectsStartIndex === -1) {
    console.log("未找到项目经历部分");
    return [];
  }
  
  // 寻找项目部分的结束（下一个主要章节）
  for (let i = projectsStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (
      line.includes('experience') && !line.includes('project') || 
      line.includes('education') && !line.includes('project') || 
      line.includes('certifications') ||
      line.includes('skills') && !line.includes('project') ||
      line.includes('languages') && !line.includes('programming') ||
      (i > projectsStartIndex + 5 && line.length < 3) // 可能是章节分隔的空行
    ) {
      projectsEndIndex = i;
      break;
    }
  }
  
  // 如果没有明确找到结束，使用剩余文本
  if (projectsEndIndex === -1) {
    projectsEndIndex = lines.length;
  }
  
  // 提取项目部分的文本
  const projectLines = lines.slice(projectsStartIndex + 1, projectsEndIndex);
  
  // 分析项目文本，识别各个项目条目
  let currentProjectStartIndex = 0;
  
  for (let i = 0; i < projectLines.length; i++) {
    const line = projectLines[i];
    
    // 项目标题通常是短行，有时包含日期
    if (i > 0 && (
      line.length < 50 && 
      line.split(' ').length < 10 && 
      line.match(/[A-Z]/) && // 包含大写字母
      !line.startsWith('•') && 
      !line.startsWith('-') && 
      !line.startsWith('*')
    )) {
      // 处理之前积累的项目
      if (currentProjectStartIndex < i) {
        const projectText = projectLines.slice(currentProjectStartIndex, i);
        const project = parseProjectItem(projectText);
        
        if (project.name) {
          projects.push(project);
        }
      }
      
      currentProjectStartIndex = i;
    }
  }
  
  // 处理最后一个项目
  if (currentProjectStartIndex < projectLines.length) {
    const projectText = projectLines.slice(currentProjectStartIndex);
    const project = parseProjectItem(projectText);
    
    if (project.name) {
      projects.push(project);
    }
  }
  
  return projects;
}

/**
 * 解析单个项目条目
 */
function parseProjectItem(lines: string[]): ProjectItem {
  if (lines.length === 0) {
    return { name: '', description: '' };
  }
  
  // 项目名称通常是第一行
  const name = lines[0].trim();
  
  // 尝试提取日期
  const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*(-|–|to)\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(\d{1,2}\/\d{4})\s*(-|–|to)\s*(\d{1,2}\/\d{4})|(\d{4})\s*(-|–|to)\s*(\d{4}|Present|present|Current|current)/i;
  let startDate = '';
  let endDate = '';
  
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const dateMatch = lines[i].match(dateRegex);
    if (dateMatch) {
      const dateParts = dateMatch[0].split(/(-|–|to)/i);
      startDate = dateParts[0].trim();
      endDate = dateParts[2] ? dateParts[2].trim() : '';
      break;
    }
  }
  
  // 提取URL（如果有）
  const urlRegex = /https?:\/\/[^\s)]+/;
  let url = '';
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const urlMatch = lines[i].match(urlRegex);
    if (urlMatch) {
      url = urlMatch[0];
      break;
    }
  }
  
  // 提取技术栈
  const technologies: string[] = [];
  const techKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
    'Express', 'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase',
    'HTML', 'CSS', 'Sass', 'Less', 'Bootstrap', 'Tailwind',
    'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET',
    'PHP', 'Laravel', 'WordPress', 'Ruby', 'Rails', 'Go', 'Rust'
  ];
  
  const techRegex = new RegExp(`(${techKeywords.join('|')})`, 'gi');
  const allText = lines.join(' ');
  const techMatches = allText.match(techRegex) || [];
  
  // 去重并添加到技术列表
  new Set(techMatches.map(t => t.trim())).forEach(tech => {
    technologies.push(tech);
  });
  
  // 提取描述和成就
  const achievements: string[] = [];
  let description = '';
  
  // 跳过第一行（项目名称）
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过日期行
    if (line.match(dateRegex)) continue;
    
    // 提取项目点
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      const achievement = line.replace(/^[•\-\*]\s*/, '').trim();
      if (achievement.length > 10) {
        achievements.push(achievement);
      }
    } 
    // 如果是第一个非项目符号的文本行，可能是项目描述
    else if (description === '' && line.length > 20) {
      description = line;
    }
  }
  
  // 如果还没有描述，但有成就，使用第一个成就作为描述
  if (description === '' && achievements.length > 0) {
    description = achievements[0];
    achievements.shift(); // 从成就列表中移除
  }
  
  return {
    name,
    description,
    startDate,
    endDate,
    url,
    technologies,
    achievements
  };
}

/**
 * 提取证书
 */
function extractCertifications(lines: string[]): CertificationItem[] {
  console.log("提取证书");
  
  const certifications: CertificationItem[] = [];
  
  // 识别证书部分
  const certificationHeaders = [
    'certifications', 'certificates', 'professional certifications',
    'credentials', 'qualifications', 'licenses'
  ];
  
  // 找到证书部分的开始
  let certStartIndex = -1;
  let certEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (certificationHeaders.some(header => line.includes(header))) {
      certStartIndex = i;
      break;
    }
  }
  
  if (certStartIndex === -1) {
    console.log("未找到证书部分");
    return [];
  }
  
  // 寻找证书部分的结束（下一个主要章节）
  for (let i = certStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (
      line.includes('experience') && !line.includes('certification') || 
      line.includes('education') && !line.includes('certification') || 
      line.includes('projects') ||
      line.includes('skills') && !line.includes('certification') ||
      line.includes('languages') && !line.includes('programming') ||
      (i > certStartIndex + 5 && line.length < 3) // 可能是章节分隔的空行
    ) {
      certEndIndex = i;
      break;
    }
  }
  
  // 如果没有明确找到结束，使用剩余文本
  if (certEndIndex === -1) {
    certEndIndex = lines.length;
  }
  
  // 提取证书部分的文本
  const certLines = lines.slice(certStartIndex + 1, certEndIndex);
  
  // 分析证书文本
  for (let i = 0; i < certLines.length; i++) {
    const line = certLines[i].trim();
    
    // 跳过空行或太短的行
    if (line.length < 5) continue;
    
    // 证书行通常是一条完整的文本，或以项目符号开头
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 10) {
      // 清理项目符号
      const cleanedLine = line.replace(/^[•\-\*]\s*/, '').trim();
      
      // 解析证书信息
      const cert = parseCertificationLine(cleanedLine);
      if (cert.name) {
        certifications.push(cert);
      }
    }
  }
  
  return certifications;
}

/**
 * 解析单行证书信息
 */
function parseCertificationLine(line: string): CertificationItem {
  // 默认空对象
  const item: CertificationItem = {
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    url: '',
    description: ''
  };
  
  if (!line) return item;
  
  // 尝试分离名称和颁发机构
  // 常见格式: "证书名 - 颁发机构" 或 "证书名, 颁发机构"
  if (line.includes(' - ')) {
    const parts = line.split(' - ');
    item.name = parts[0].trim();
    if (parts[1]) {
      item.issuer = parts[1].split(',')[0].trim();
    }
  } else if (line.includes(', ')) {
    const parts = line.split(', ');
    item.name = parts[0].trim();
    if (parts[1]) {
      item.issuer = parts[1].trim();
    }
  } else {
    // 无法分离，使用整行作为名称
    item.name = line;
  }
  
  // 提取日期
  const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}/i;
  const dateMatch = line.match(dateRegex);
  if (dateMatch) {
    item.date = dateMatch[0];
  }
  
  // 提取URL
  const urlRegex = /https?:\/\/[^\s)]+/;
  const urlMatch = line.match(urlRegex);
  if (urlMatch) {
    item.url = urlMatch[0];
  }
  
  return item;
}

/**
 * 提取语言能力
 */
function extractLanguages(lines: string[]): any[] {
  console.log("提取语言能力");
  
  const languages: any[] = [];
  
  // 识别语言部分
  const languageHeaders = [
    'languages', 'language skills', 'language proficiency', 
    'spoken languages', 'foreign languages'
  ];
  
  // 找到语言部分的开始
  let langStartIndex = -1;
  let langEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (languageHeaders.some(header => line.includes(header)) && !line.includes('programming')) {
      langStartIndex = i;
      break;
    }
  }
  
  if (langStartIndex === -1) {
    console.log("未找到语言能力部分");
    return [];
  }
  
  // 寻找语言部分的结束（下一个主要章节）
  for (let i = langStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (
      line.includes('experience') && !line.includes('language') || 
      line.includes('education') && !line.includes('language') || 
      line.includes('projects') ||
      line.includes('skills') && !line.includes('language') ||
      line.includes('certifications') ||
      (i > langStartIndex + 5 && line.length < 3) // 可能是章节分隔的空行
    ) {
      langEndIndex = i;
      break;
    }
  }
  
  // 如果没有明确找到结束，使用剩余文本
  if (langEndIndex === -1) {
    langEndIndex = lines.length;
  }
  
  // 提取语言部分的文本
  const langLines = lines.slice(langStartIndex + 1, langEndIndex);
  
  // 分析语言文本
  for (let i = 0; i < langLines.length; i++) {
    const line = langLines[i].trim();
    
    // 跳过空行或太短的行
    if (line.length < 3) continue;
    
    // 语言行通常是一条完整的文本，或以项目符号开头
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 3) {
      // 清理项目符号
      const cleanedLine = line.replace(/^[•\-\*]\s*/, '').trim();
      
      // 解析语言信息
      const lang = parseLanguageLine(cleanedLine);
      if (lang.name) {
        languages.push(lang);
      }
    }
  }
  
  // 如果没有找到语言部分，尝试从整个文本中识别常见语言
  if (languages.length === 0) {
    const commonLanguages = [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
      'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
    ];
    
    const allText = lines.join(' ');
    
    for (const lang of commonLanguages) {
      if (new RegExp(`\\b${lang}\\b`, 'i').test(allText)) {
        languages.push({ name: lang, proficiency: 'Conversational' });
      }
    }
  }
  
  return languages;
}

/**
 * 解析单行语言信息
 */
function parseLanguageLine(line: string): { name: string, proficiency: string } {
  // 默认空对象
  const item = {
    name: '',
    proficiency: ''
  };
  
  if (!line) return item;
  
  // 常见语言熟练度级别
  const proficiencyLevels = [
    'native', 'fluent', 'proficient', 'advanced', 'intermediate', 'conversational', 'basic', 'beginner',
    'c2', 'c1', 'b2', 'b1', 'a2', 'a1'
  ];
  
  // 尝试分离语言名称和熟练度
  // 常见格式: "English (Native)" 或 "English - Fluent" 或 "English: Fluent"
  let parts: string[] = [];
  
  if (line.includes(' - ')) {
    parts = line.split(' - ');
  } else if (line.includes(': ')) {
    parts = line.split(': ');
  } else if (line.includes('(') && line.includes(')')) {
    parts = [line.split('(')[0], line.split('(')[1].replace(')', '')];
  } else {
    // 检查常见的语言和熟练度模式
    for (const level of proficiencyLevels) {
      if (line.toLowerCase().includes(level)) {
        const regex = new RegExp(`(.*?)${level}`, 'i');
        const match = line.match(regex);
        if (match) {
          parts = [match[1], level];
          break;
        }
      }
    }
  }
  
  // 设置语言名称和熟练度
  if (parts.length >= 2) {
    item.name = parts[0].trim();
    item.proficiency = parts[1].trim();
  } else {
    // 无法分离，仅设置语言名称
    item.name = line.trim();
    
    // 尝试推测是否为母语
    if (line.toLowerCase().includes('native') || 
        line.toLowerCase().includes('mother tongue') || 
        line.toLowerCase().includes('first language')) {
      item.proficiency = 'Native';
    } else {
      item.proficiency = 'Conversational'; // 默认级别
    }
  }
  
  return item;
} 