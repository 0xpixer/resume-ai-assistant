'use client';

// 导入带有工作线程配置的PDF.js
import pdfjsLib from './pdfjs-worker';
import mammoth from 'mammoth';
import { ParsedResume, Resume, ExperienceItem, EducationItem, SkillItem, SkillCategory, ProjectItem, CertificationItem } from '../types/resume';

interface LanguageItem {
  name: string;
  proficiency: string;
}

/**
 * 解析PDF文件 - 使用浏览器兼容的 PDF.js
 */
export async function parsePdfResume(file: File): Promise<ParsedResume> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  
  let fullText = '';
  
  // 提取所有页面的文本
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
      .map((item: any) => 'str' in item ? item.str : '')
        .join(' ');
    
    fullText += pageText + '\n';
  }
  
  return extractResumeData(fullText);
}

/**
 * 简单解析Word文档 
 * 注意：浏览器中直接解析Word文档很复杂，
 * 这是一个模拟实现，实际应用可能需要上传到服务器处理
 */
export async function parseWordResume(file: File): Promise<ParsedResume> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = result.value;
  
  return extractResumeData(text);
}

function extractResumeData(text: string): ParsedResume {
  // Split text into lines and filter out empty lines
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  console.log("Extracting resume data, total lines:", lines.length);
  if (lines.length < 3) {
    console.warn("Resume text too short, may not parse correctly");
  }
  
  // Extract basic information
  const { name, title, email, phone, location } = extractBasicInfo(lines, text);
  
  // Extract summary
  const summary = extractSummary(lines);
  
  // Extract work experience
  const experience = extractExperience(lines);
  
  // Extract education
  const education = extractEducation(lines);
  
  // Extract skills
  const skills = extractSkills(lines);
  
  // Extract projects
  const projects = extractProjects(lines);
  
  // Extract certifications
  const certifications = extractCertifications(lines);
  
  // Extract languages
  const languages = extractLanguages(lines);
  
  // Extract interests
  const interests = extractInterests(lines);
  
  // Build structured resume data
  const structured: Resume = {
    contactInfo: {
      name,
      title,
      email,
      phone,
      location
    },
    summary,
    experience,
    education,
    skills: skills.map(skill => ({ 
      name: skill,
      category: detectSkillCategory(skill),
      level: 3
    })),
    projects,
    certifications,
    languages,
    interests
  };
  
  console.log("Extracted structured data:", JSON.stringify({
    contactInfo: structured.contactInfo,
    summary: structured.summary ? "has content" : "empty",
    experience: structured.experience.length,
    education: structured.education.length,
    skills: structured.skills.length,
    projects: structured.projects?.length || 0,
    certifications: structured.certifications?.length || 0
  }, null, 2));
  
  return {
    name,
    title,
    email,
    phone,
    summary,
    experience: experience.map(exp => `${exp.company} - ${exp.position}`),
    education: education.map(edu => `${edu.institution} - ${edu.degree}`),
    skills,
    structured
  };
}

function extractBasicInfo(lines: string[], fullText: string): {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
} {
  // 提取姓名（通常是第一行或者在"姓名："后面）
  let name = '';
  const nameMatch = lines.find(line => 
    line.toLowerCase().includes('姓名:') || 
    line.toLowerCase().includes('name:') || 
    (line.length < 40 && !line.includes('@') && !line.match(/^\d/))
  );
  
  if (nameMatch) {
    // 如果找到包含"姓名:"的行，提取冒号后面的内容
    if (nameMatch.includes(':')) {
      name = nameMatch.split(':')[1].trim();
    } else {
      // 否则假设这一行就是姓名
      // 只取第一个和第二个单词作为姓名，避免包含位置等信息
      const parts = nameMatch.split(/\s+/);
      if (parts.length >= 2) {
        name = `${parts[0]} ${parts[1]}`.trim();
      } else {
        name = parts[0].trim();
      }
    }
  } else if (lines.length > 0) {
    // 如果没有找到符合条件的行，假设第一行是姓名
    const parts = lines[0].split(/\s+/);
    if (parts.length >= 2) {
      name = `${parts[0]} ${parts[1]}`.trim();
    } else {
      name = parts[0].trim();
    }
  }
  
  // 提取电子邮件
  let email = '';
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatch = fullText.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    email = emailMatch[0].replace(/\s+/g, ''); // 移除空格
  }
  
  // 提取电话号码
  let phone = '';
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?(\d{1,4}[-.\s]?){1,4}/g;
  const phoneMatches = fullText.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    // 找出最可能是电话号码的匹配（通常更长的那个）
    phone = phoneMatches.reduce((longest, current) => {
      const cleanCurrent = current.replace(/\s+/g, '');
      const cleanLongest = longest.replace(/\s+/g, '');
      return cleanCurrent.length > cleanLongest.length ? current : longest;
    }, '');
  }
  
  // 提取职位
  let title = '';
  const titleLines = lines.filter(line => 
    !line.includes('@') && 
    !line.match(/^\d/) && 
    line !== name &&
    !line.includes(phone)
  );
  
  // 检查是否有职位相关的关键词
  const titleKeywords = ['developer', 'engineer', 'manager', 'designer', 'specialist', 'analyst', 'consultant', 
                        'director', 'lead', 'head', 'architect', 'administrator', 'coordinator'];
  
  for (const line of titleLines) {
    if (titleKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      title = line.trim();
      break;
    }
  }
  
  // 如果没有找到职位，尝试使用第二行作为职位
  if (!title && lines.length > 1 && name !== lines[1]) {
    title = lines[1].trim();
  }
  
  // 提取位置信息
  let location = '';
  const locationRegex = /([A-Za-z\s]+),\s*([A-Za-z\s]+)/;
  
  for (const line of lines) {
    const locationMatch = line.match(locationRegex);
    if (locationMatch && !line.includes('@') && !line.includes(name)) {
      location = locationMatch[0].trim();
      break;
    }
  }
  
  // 如果没有找到位置，检查是否有城市名或州/省名
  if (!location) {
    const locationKeywords = ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 
                            'VIC', 'NSW', 'QLD', 'WA', 'SA', 'NT', 'ACT', 'TAS'];
    
    for (const line of lines) {
      for (const keyword of locationKeywords) {
        if (line.includes(keyword) && !line.includes(name)) {
          // 提取包含关键词的部分
          const parts = line.split(/[\s,;]+/);
          const keywordIndex = parts.findIndex(part => part.includes(keyword));
          if (keywordIndex >= 0) {
            // 尝试提取城市+州/省的组合
            const start = Math.max(0, keywordIndex - 1);
            const end = Math.min(parts.length, keywordIndex + 2);
            location = parts.slice(start, end).join(' ').trim();
            break;
          }
        }
      }
      if (location) break;
    }
  }
  
  return {
    name,
    title,
    email,
    phone,
    location
  };
}

function extractSummary(lines: string[]): string {
  let summary = '';
  const summaryIndex = findSectionIndex(lines, ['Summary', 'SUMMARY', 'Profile', 'PROFILE', 'Professional Summary']);
  if (summaryIndex !== -1) {
    const nextSectionIndex = findNextSectionIndex(lines, summaryIndex);
    const summarySection = lines.slice(summaryIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
    summary = summarySection.join(' ');
  }
  return summary;
}

function extractExperience(lines: string[]): ExperienceItem[] {
  const experience: ExperienceItem[] = [];
  const experienceIndex = findSectionIndex(lines, ['Experience', 'EXPERIENCE', 'Employment', 'EMPLOYMENT', 'Work Experience', 'WORK EXPERIENCE', 'Professional Experience']);
  
  if (experienceIndex === -1) {
    console.log("No work experience section found");
    return [];
  }

  // 找到下一个部分的起始位置
  const nextSectionIndex = findNextSectionIndex(lines, experienceIndex);
  
  // 获取工作经验部分的所有行
  const experienceLines = lines.slice(
    experienceIndex + 1, 
    nextSectionIndex === -1 ? undefined : nextSectionIndex
  );
  
  let currentExperience: Partial<ExperienceItem> | null = null;
  
  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i].trim();
    
    // 跳过空行
    if (!line) continue;
    
    // 检查是否是新的工作经验条目
    if (isNewExperienceEntry(line) || i === 0) {
      // 如果已经有一个正在处理的工作经验，先保存它
      if (currentExperience && currentExperience.company && currentExperience.position) {
        experience.push({
          company: currentExperience.company,
          position: currentExperience.position,
          location: currentExperience.location || '',
          startDate: currentExperience.startDate || '',
          endDate: currentExperience.endDate || '',
          isCurrentPosition: currentExperience.isCurrentPosition || false,
          achievements: currentExperience.achievements || []
        });
      }
      
      // 解析公司名称和日期
      const { company, dates } = parseCompanyAndDates(line);
      
      // 创建新的工作经验条目
      currentExperience = {
        company: company.trim(),
        position: '',
        location: '',
        startDate: dates?.startDate || '',
        endDate: dates?.endDate || '',
        isCurrentPosition: dates?.isCurrent || false,
        achievements: []
      };
      
      // 检查是否有地点信息
      const locationMatch = line.match(/\(([^)]+)\)/) || line.match(/,\s*([^,]+)$/);
      if (locationMatch) {
        currentExperience.location = locationMatch[1].trim();
      }
      
      // 检查下一行是否是职位
      if (i + 1 < experienceLines.length) {
        const nextLine = experienceLines[i + 1].trim();
        if (!isNewExperienceEntry(nextLine) && !nextLine.startsWith('•') && !nextLine.startsWith('-')) {
          currentExperience.position = nextLine;
          i++; // 跳过下一行，因为已经处理
        }
      }
    } 
    // 如果当前行是职位（只有在当前经验没有职位的情况下）
    else if (currentExperience && !currentExperience.position && 
            !line.startsWith('•') && !line.startsWith('-') && 
            line.length < 100) {
      currentExperience.position = line;
    }
    // 处理成就点
    else if (currentExperience && 
            (line.startsWith('•') || line.startsWith('-') || 
             line.match(/^[\d•·]\./) || isAchievementLine(line))) {
      // 提取成就内容，去掉前缀标记
      const achievement = line.replace(/^[•\-\d\.]+\s*/, '').trim();
      if (achievement) {
        currentExperience.achievements = currentExperience.achievements || [];
        currentExperience.achievements.push(achievement);
      }
    }
    // 如果不是以上任何情况，可能是成就描述的延续
    else if (currentExperience && currentExperience.achievements && 
             currentExperience.achievements.length > 0 && 
             line.length < 100) {
      const lastIndex = currentExperience.achievements.length - 1;
      currentExperience.achievements[lastIndex] += ' ' + line;
    }
  }
  
  // 添加最后一个工作经验
  if (currentExperience && currentExperience.company && currentExperience.position) {
    experience.push({
      company: currentExperience.company,
      position: currentExperience.position,
      location: currentExperience.location || '',
      startDate: currentExperience.startDate || '',
      endDate: currentExperience.endDate || '',
      isCurrentPosition: currentExperience.isCurrentPosition || false,
      achievements: currentExperience.achievements || []
    });
  }
  
  return experience;
}

function extractEducation(lines: string[]): EducationItem[] {
  const education: EducationItem[] = [];
  const educationIndex = findSectionIndex(lines, ['Education', 'EDUCATION']);
  
  if (educationIndex !== -1) {
    const nextSectionIndex = findNextSectionIndex(lines, educationIndex);
    const educationSection = lines.slice(educationIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
    
    let currentItem: Partial<EducationItem> = {};
    let currentAchievements: string[] = [];
    let currentCourses: string[] = [];
    
    for (const line of educationSection) {
      // 新教育经历的开始标志
      if (isNewEducationEntry(line)) {
        // 保存之前的条目
        if (currentItem.institution) {
          education.push({
            ...currentItem as EducationItem,
            achievements: currentAchievements,
            courses: currentCourses
          });
        }
        
        // 重置当前条目
        currentItem = {};
        currentAchievements = [];
        currentCourses = [];
        
        // 解析学校名称和日期
        const { institution, dates } = parseInstitutionAndDates(line);
        currentItem.institution = institution;
        if (dates) {
          currentItem.startDate = dates.startDate;
          currentItem.endDate = dates.endDate;
        }
      }
      // 学位信息
      else if (!currentItem.degree && isDegreeeLine(line)) {
        currentItem.degree = line.trim();
      }
      // 专业信息
      else if (!currentItem.field && isFieldLine(line)) {
        currentItem.field = line.trim();
      }
      // GPA信息
      else if (!currentItem.gpa && isGpaLine(line)) {
        currentItem.gpa = extractGpa(line);
      }
      // 课程信息
      else if (isCourseLine(line)) {
        currentCourses = [...currentCourses, ...extractCourses(line)];
      }
      // 成就和活动
      else if (isAchievementLine(line)) {
        currentAchievements.push(line.trim());
      }
    }
    
    // 添加最后一个条目
    if (currentItem.institution) {
      education.push({
        ...currentItem as EducationItem,
        achievements: currentAchievements,
        courses: currentCourses
      });
    }
  }
  
  return education;
}

function extractSkills(lines: string[]): string[] {
  let skills: string[] = [];
  const skillsIndex = findSectionIndex(lines, ['Skills', 'SKILLS', 'Technical Skills', 'TECHNICAL SKILLS']);
  
  if (skillsIndex !== -1) {
    const nextSectionIndex = findNextSectionIndex(lines, skillsIndex);
    const skillsSection = lines.slice(skillsIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
    
    // 合并所有技能行并分割
    skills = skillsSection
      .join(' ')
      .split(/[,，、•\s]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1); // 过滤掉单字符的技能
  }
  
  return skills;
}

function detectSkillCategory(skill: string): SkillCategory {
  const categories = {
    technical: /(JavaScript|TypeScript|Python|Java|C\+\+|React|Vue|Angular|Node\.js|SQL|AWS|Docker|Kubernetes|Git|REST|API|HTML|CSS|PHP|Ruby|Swift|Kotlin|Go|Rust|MongoDB|Redis|PostgreSQL|MySQL)/i,
    soft: /(Leadership|Communication|Teamwork|Problem.Solving|Project Management|Time Management|Analytical|Critical Thinking|Adaptability|Creativity)/i,
    language: /(English|Chinese|Spanish|French|German|Japanese|Korean|Russian|Arabic|Portuguese|Italian)/i,
    tool: /(AWS|Microsoft|Google|Cisco|CompTIA|PMP|CISSP|CFA|CISA|CISM|ITIL|Scrum|PMI|PRINCE2)/i
  };
  
  if (categories.technical.test(skill)) return 'technical';
  if (categories.soft.test(skill)) return 'soft';
  if (categories.language.test(skill)) return 'language';
  if (categories.tool.test(skill)) return 'tool';
  return 'other';
}

// 辅助函数
function isNewExperienceEntry(line: string): boolean {
  return Boolean(
    line.match(/^[\u4e00-\u9fa5\w\s]+公司/) || // 中文公司名
    line.match(/^[A-Z][\w\s&]+(?:Inc\.|LLC|Ltd\.|Corporation|Corp\.|Company|Co\.)/) || // 英文公司名
    line.match(/^\d{4}[/-]/) // 日期开头
  );
}

function isNewEducationEntry(line: string): boolean {
  return Boolean(
    line.match(/^[\u4e00-\u9fa5]+大学/) || // 中文大学名
    line.match(/^[A-Z][\w\s]+(?:University|College|Institute|School)/) || // 英文学校名
    line.match(/^\d{4}[/-]/) // 日期开头
  );
}

function parseCompanyAndDates(line: string): { 
  company: string; 
  dates?: { 
    startDate: string; 
    endDate: string; 
    isCurrent: boolean; 
  } 
} {
  const datePattern = /(\d{4}[/-]\d{2}|\d{4})[/-](\d{4}[/-]\d{2}|\d{4}|至今|present)/i;
  const dateMatch = line.match(datePattern);
  
  if (dateMatch) {
    const company = line.replace(datePattern, '').trim();
    const startDate = dateMatch[1];
    const endDate = dateMatch[2];
    const isCurrent = /至今|present/i.test(endDate);
    
    return {
      company,
      dates: {
        startDate,
        endDate: isCurrent ? '至今' : endDate,
        isCurrent
      }
    };
  }
  
  return { company: line.trim() };
}

function parseInstitutionAndDates(line: string): { 
  institution: string; 
  dates?: { 
    startDate: string; 
    endDate: string; 
  } 
} {
  const datePattern = /(\d{4}[/-]\d{2}|\d{4})[/-](\d{4}[/-]\d{2}|\d{4}|至今|present)/i;
  const dateMatch = line.match(datePattern);
  
  if (dateMatch) {
    const institution = line.replace(datePattern, '').trim();
    return {
      institution,
      dates: {
        startDate: dateMatch[1],
        endDate: dateMatch[2]
      }
    };
  }
  
  return { institution: line.trim() };
}

// 辅助函数：查找章节标题的索引
function findSectionIndex(lines: string[], possibleTitles: string[]): number {
  return lines.findIndex(line => 
    possibleTitles.some(title => 
      line.toLowerCase().includes(title.toLowerCase()) ||
      line.toLowerCase() === title.toLowerCase()
    )
  );
}

// 辅助函数：查找下一个章节的索引
function findNextSectionIndex(lines: string[], currentIndex: number): number {
  const sectionMarkers = [
    'Work Experience', 'EXPERIENCE', 'Experience',
    'Education', 'EDUCATION',
    'Skills', 'SKILLS',
    'Projects', 'PROJECTS',
    'Certifications', 'CERTIFICATIONS',
    'Languages', 'LANGUAGES',
    'Interests', 'INTERESTS'
  ];
  
  for (let i = currentIndex + 1; i < lines.length; i++) {
    if (sectionMarkers.some(marker => 
      lines[i].toLowerCase().includes(marker.toLowerCase()) ||
      lines[i].toLowerCase() === marker.toLowerCase()
    )) {
      return i;
    }
  }
  
  return -1;
}

/**
 * 根据文件类型自动选择解析器
 */
export async function parseResume(file: File): Promise<ParsedResume> {
  const fileType = file.type;
  
  console.log(`开始解析文件: ${file.name}, 类型: ${fileType}, 大小: ${file.size} 字节`);
  
  try {
    let parsedData: ParsedResume;
  
  if (fileType === 'application/pdf') {
      console.log('使用PDF解析器');
      parsedData = await parsePdfResume(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
              fileType === 'application/msword') {
      console.log('使用Word解析器');
      parsedData = await parseWordResume(file);
    } else if (fileType === 'text/plain') {
      console.log('使用纯文本解析器');
      const text = await file.text();
      parsedData = extractResumeData(text);
    } else {
      // 尝试作为纯文本处理
      console.log(`未知文件类型 ${fileType}，尝试作为纯文本处理`);
      const text = await file.text();
      parsedData = extractResumeData(text);
    }
    
    // 确保返回的数据有完整的结构
    if (!parsedData.structured) {
      console.log('解析完成，但没有结构化数据，尝试从基本字段构建');
      
      const structured: Resume = {
        contactInfo: {
          name: parsedData.name || '',
          title: parsedData.title || '',
          email: parsedData.email || '',
          phone: parsedData.phone || '',
          location: ''
        },
        summary: parsedData.summary || '',
        experience: [],
        education: [],
        skills: []
      };
      
      // 如果有原始数据字段，尝试转换
      if (Array.isArray(parsedData.experience)) {
        structured.experience = parsedData.experience.map(exp => {
          if (typeof exp === 'string') {
            const parts = exp.split(' - ');
            return {
              company: parts[0] || '',
              position: parts.length > 1 ? parts[1] : '',
              achievements: []
            };
          }
          return {
            company: '',
            position: exp,
            achievements: []
          };
        });
      }
      
      if (Array.isArray(parsedData.education)) {
        structured.education = parsedData.education.map(edu => {
          if (typeof edu === 'string') {
            const parts = edu.split(' - ');
            return {
              institution: parts[0] || '',
              degree: parts.length > 1 ? parts[1] : ''
            };
          }
          return {
            institution: '',
            degree: edu
          };
        });
      }
      
      if (Array.isArray(parsedData.skills)) {
        structured.skills = parsedData.skills.map(skill => ({
          name: skill,
          category: detectSkillCategory(skill),
          level: 3
        }));
      }
      
      // 重新解析原始文本
      if (parsedData.rawText) {
        console.log('尝试重新解析原始文本');
        const newParsedData = extractResumeData(parsedData.rawText);
        // 合并结果
        if (newParsedData.structured) {
          Object.assign(structured, newParsedData.structured);
        }
      }
      
      parsedData.structured = structured;
    }
    
    console.log('简历解析完成，结构化数据状态:', {
      contactInfo: !!parsedData.structured.contactInfo,
      summary: !!parsedData.structured.summary,
      experience: parsedData.structured.experience.length,
      education: parsedData.structured.education.length,
      skills: parsedData.structured.skills.length
    });
    
    return parsedData;
  } catch (error) {
    console.error('解析简历时出错:', error);
    // 返回一个空的结果
    return {
      rawText: '解析失败',
      structured: {
        contactInfo: { name: '' },
        experience: [],
        education: [],
        skills: []
      }
    };
  }
}

/**
 * 通过AI分析解析出的文本内容并转换为结构化数据
 */
export async function analyzeResumeWithAI(parsedText: string): Promise<ParsedResume> {
  try {
    // 这里应该调用AI服务，但目前使用增强版的模拟数据提取
  console.log('分析文本:', parsedText.substring(0, 100) + '...');
  
    // 更精确的信息提取
  const lines = parsedText.split('\n').filter(line => line.trim().length > 0);
  
    // 基于文本位置的启发式方法提取姓名和职位
  const name = lines.length > 0 ? lines[0].trim() : '未知名字';
  const title = lines.length > 1 ? lines[1].trim() : '未知职位';
  
    // 更强大的邮箱提取
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = parsedText.match(emailRegex);
    const email = emailMatches ? emailMatches[0] : undefined;
    
    // 增强电话号码提取，支持多种格式
    // 支持国际格式、带区号格式和常见分隔符
    const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|(\d{4}[\s-]?\d{3}[\s-]?\d{3})|(\d{3}[\s-]?\d{4}[\s-]?\d{4})/g;
    const phoneMatches = parsedText.match(phoneRegex);
    const phone = phoneMatches ? phoneMatches[0] : undefined;
    
    // 提取技能部分，寻找常见的技能部分标题
    const skillsRegex = /技能|SKILLS|专业技能|CORE COMPETENCIES|TECHNICAL SKILLS/i;
    const skillsSection = extractSection(parsedText, skillsRegex);
    const skills = skillsSection
      ? skillsSection
          .split(/[,，、;；]/)
          .map(s => s.trim())
          .filter(s => s.length > 0 && s.length < 30)
      : ['沟通能力', '团队合作', '问题解决'];
    
    // 提取教育背景
    const educationRegex = /教育|EDUCATION|教育背景|学历/i;
    const educationSection = extractSection(parsedText, educationRegex);
    const education = educationSection
      ? educationSection
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.match(educationRegex))
      : ['学士学位，计算机科学'];
      
    // 提取工作经验
    const experienceRegex = /经验|工作经验|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|工作履历/i;
    const experienceSection = extractSection(parsedText, experienceRegex);
    const experience = experienceSection
      ? experienceSection
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.match(experienceRegex))
          .slice(0, 5) // 限制只取前5条
      : ['软件工程师，ABC公司，2020-至今'];
    
    // 生成摘要，使用文档开头的内容
    let summary = "";
    if (lines.length > 2) {
      const potentialSummary = lines.slice(2, 7).join(' ');
      // 如果摘要过长，截取合理长度
      summary = potentialSummary.length > 300 
        ? potentialSummary.substring(0, 300) + '...' 
        : potentialSummary;
    } else {
      summary = '无职业摘要';
    }
    
    // 将提取的基础数据传递给更详细的结构化解析
    const basicParsed = extractResumeData(parsedText);
    
    // 增强解析后的结构化数据
    if (basicParsed.structured) {
      // 这里可以添加额外的AI增强处理逻辑
      // 例如：检测成就描述中的行动动词，提取量化指标等
      // 目前只是模拟这个过程
      
      // 1. 增强工作经验的成就描述，检测行动词
      basicParsed.structured.experience = basicParsed.structured.experience.map(exp => {
        const enhancedAchievements = exp.achievements.map(achievement => {
          // 简单地添加前缀，在实际应用中这应该是AI生成的更好的描述
          if (!achievement.match(/^(managed|led|created|developed|implemented|improved|increased|decreased|reduced|achieved|designed|delivered|resolved)/i)) {
            return `Implemented ${achievement}`;
          }
          return achievement;
        });
        
        return {
          ...exp,
          achievements: enhancedAchievements
        };
      });
      
      // 2. 提取可能的关键词
      basicParsed.structured.experience = basicParsed.structured.experience.map(exp => {
        // 从成就描述中提取可能的关键词
        const keywordPatterns = [
          /\b(AI|ML|Machine Learning|Data Science|Python|JavaScript|React|Node.js|AWS|Azure|Docker|Kubernetes|SQL|NoSQL|MongoDB|PostgreSQL|MySQL|REST|GraphQL)\b/gi
        ];
        
        const keywords = new Set<string>();
        
        for (const achievement of exp.achievements) {
          for (const pattern of keywordPatterns) {
            let match;
            while ((match = pattern.exec(achievement)) !== null) {
              keywords.add(match[1]);
            }
          }
        }
        
        return {
          ...exp,
          keywords: Array.from(keywords)
        };
      });
    }
    
    return basicParsed;
  } catch (error) {
    console.error('简历AI分析失败:', error);
    return extractResumeData(parsedText);  // 失败时回退到基本解析
  }
}

/**
 * 从文本中提取特定部分的辅助函数
 */
function extractSection(text: string, sectionRegex: RegExp): string | null {
  const lines = text.split('\n');
  let sectionStartIndex = -1;
  let sectionEndIndex = -1;
  
  // 查找部分开始位置
  for (let i = 0; i < lines.length; i++) {
    if (sectionRegex.test(lines[i])) {
      sectionStartIndex = i;
      break;
    }
  }
  
  if (sectionStartIndex === -1) return null;
  
  // 查找部分结束位置（通常是下一个主要部分的开始）
  const majorSectionRegex = /技能|SKILLS|教育|EDUCATION|经验|EXPERIENCE|证书|CERTIFICATIONS|项目|PROJECTS|专业技能|工作经验|教育背景|专业技术|PROFESSIONAL SUMMARY|摘要|个人信息|PERSONAL INFORMATION/i;
  
  for (let i = sectionStartIndex + 1; i < lines.length; i++) {
    if (i !== sectionStartIndex && majorSectionRegex.test(lines[i])) {
      sectionEndIndex = i;
      break;
    }
  }
  
  // 如果找不到结束位置，取接下来的10行或到文末
  if (sectionEndIndex === -1) {
    sectionEndIndex = Math.min(sectionStartIndex + 10, lines.length);
  }
  
  return lines.slice(sectionStartIndex + 1, sectionEndIndex).join('\n');
}

/**
 * 将工作经验文本数组转换为结构化的ExperienceItem数组
 */
function parseExperienceItems(experienceTexts: string[]): ExperienceItem[] {
  return experienceTexts.map(text => {
    // 提取公司名称（假设在开头）
    const companyMatch = text.match(/^([^,\d]+)/);
    const company = companyMatch ? companyMatch[0].trim() : '未知公司';
    
    // 提取职位（假设在公司名称后面）
    const positionMatch = text.match(/(?:at|as|position|职位|担任)[\s:：]+([^,\.。，]+)/i);
    const position = positionMatch ? positionMatch[1].trim() : '未知职位';
    
    // 提取日期
    const dateRanges = text.match(/(\d{4}[\s/-]+\d{4}|\d{4}[\s/-]+Present|\d{4}[\s/-]+至今)/gi);
    let startDate = '';
    let endDate = '';
    let isCurrentPosition = false;
    
    if (dateRanges && dateRanges.length > 0) {
      const dateParts = dateRanges[0].split(/[\s/-]+/);
      if (dateParts.length >= 2) {
        startDate = dateParts[0].trim();
        endDate = dateParts[1].trim();
        if (endDate.toLowerCase() === 'present' || endDate === '至今') {
          isCurrentPosition = true;
          endDate = 'Present';
        }
      }
    }
    
    // 提取地点
    const locationMatch = text.match(/(?:in|at|location|地点|位于)[\s:：]+([^,\.。，]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : undefined;
    
    // 提取成就（假设以 •, -, * 等开头的是成就条目）
    const achievements: string[] = [];
    const achievementRegex = /[•\-\*][\s]*([^\n•\-\*]+)/g;
    let achievementMatch;
    while ((achievementMatch = achievementRegex.exec(text)) !== null) {
      achievements.push(achievementMatch[1].trim());
    }
    
    // 如果没有找到任何成就条目，尝试分割段落
    if (achievements.length === 0) {
      const paragraphs = text.split(/\r?\n\r?\n/);
      for (let i = 1; i < paragraphs.length; i++) {
        if (paragraphs[i].length > 15) {
          achievements.push(paragraphs[i].trim());
        }
      }
    }
    
    // 如果仍然没有成就条目，使用原始文本
    if (achievements.length === 0) {
      achievements.push(text);
    }
    
    return {
      company,
      position,
      location,
      startDate,
      endDate,
      isCurrentPosition,
      achievements,
    };
  });
}

/**
 * 将教育经历文本数组转换为结构化的EducationItem数组
 */
function parseEducationItems(educationTexts: string[]): EducationItem[] {
  return educationTexts.map(text => {
    // 提取院校名称（假设在开头）
    const institutionMatch = text.match(/^([^,\d]+)/);
    const institution = institutionMatch ? institutionMatch[0].trim() : '未知学校';
    
    // 提取学位
    const degreeMatch = text.match(/(?:degree|学位|bachelor|master|phd|博士|硕士|学士)[\s:：]*([^,\.。，]+)/i);
    const degree = degreeMatch ? degreeMatch[1].trim() : '未知学位';
    
    // 提取专业方向
    const fieldMatch = text.match(/(?:major|field|专业|领域)[\s:：]*([^,\.。，]+)/i);
    const field = fieldMatch ? fieldMatch[1].trim() : undefined;
    
    // 提取日期
    const dateRanges = text.match(/(\d{4}[\s/-]+\d{4}|\d{4}[\s/-]+Present|\d{4}[\s/-]+至今)/gi);
    let startDate = '';
    let endDate = '';
    
    if (dateRanges && dateRanges.length > 0) {
      const dateParts = dateRanges[0].split(/[\s/-]+/);
      if (dateParts.length >= 2) {
        startDate = dateParts[0].trim();
        endDate = dateParts[1].trim();
        if (endDate.toLowerCase() === 'present' || endDate === '至今') {
          endDate = 'Present';
        }
      }
    }
    
    // 提取GPA
    const gpaMatch = text.match(/(?:gpa|平均成绩)[\s:：]*([0-9\.]+)/i);
    const gpa = gpaMatch ? gpaMatch[1].trim() : undefined;
    
    // 提取成就和课程
    const achievements: string[] = [];
    const achievementRegex = /[•\-\*][\s]*([^\n•\-\*]+)/g;
    let achievementMatch;
    while ((achievementMatch = achievementRegex.exec(text)) !== null) {
      achievements.push(achievementMatch[1].trim());
    }
  
  return {
      institution,
      degree,
      field,
      startDate,
      endDate,
      gpa,
      achievements,
    };
  });
}

/**
 * 将技能字符串数组转换为结构化的SkillItem数组
 */
function convertSkillsToStructured(skills: string[]): SkillItem[] {
  // 技能分类规则
  const categoryRules: Record<SkillCategory, RegExp[]> = {
    technical: [
      /javascript|typescript|python|java|c\+\+|ruby|php|golang|swift|kotlin|rust|sql|html|css|react|angular|vue|node\.js|express|django|flask|spring|hibernate|docker|kubernetes|aws|azure|gcp|git|ci\/cd|jenkins|terraform|linux|unix|bash|powershell|machine learning|deep learning|ai|data science|nlp|computer vision|blockchain/i
    ],
    soft: [
      /leadership|teamwork|communication|presentation|negotiation|time management|problem solving|adaptability|creativity|critical thinking|emotional intelligence|conflict resolution|decision making|stress management|work ethic|flexibility|reliability|patience|empathy|mentoring|coaching/i
    ],
    language: [
      /english|chinese|mandarin|spanish|french|german|japanese|korean|russian|arabic|portuguese|italian|dutch|swedish|finnish|norwegian|danish|hindi|urdu|bengali|punjabi|tamil|telugu|marathi|turkish|vietnamese|thai|indonesian|malay|tagalog/i
    ],
    tool: [
      /microsoft office|word|excel|powerpoint|outlook|microsoft 365|google workspace|adobe|photoshop|illustrator|indesign|figma|sketch|xd|trello|asana|jira|slack|zoom|teams|salesforce|sap|oracle|tableau|power bi|looker|quickbooks|notion|airtable|monday|zendesk|hubspot/i
    ],
    other: [/./] // 默认匹配任何内容
  };
  
  return skills.map(skill => {
    const trimmedSkill = skill.trim();
    // 确定技能类别
    let category: SkillCategory = 'other';
    for (const [cat, patterns] of Object.entries(categoryRules) as [SkillCategory, RegExp[]][]) {
      if (patterns.some(pattern => pattern.test(trimmedSkill))) {
        category = cat;
        break;
      }
    }
    
    return {
      name: trimmedSkill,
      category,
      // 默认不设置level和years，这些可能需要进一步的分析或用户输入
    };
  });
}

/**
 * 从文本中提取位置信息
 */
function extractLocation(text: string): string | undefined {
  // 尝试寻找常见的位置格式
  const locationPatterns = [
    /(?:Location|地点|Address|地址|Residence|居住地)[\s:：]+([\w\s,\.-]+)/i,
    /([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*,\s*[A-Z]{2})/,  // City, State (US格式)
    /([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*)/               // 仅城市名
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractProjects(lines: string[]): ProjectItem[] {
  const projects: ProjectItem[] = [];
  const projectsIndex = findSectionIndex(lines, ['Projects', 'PROJECTS', 'Project Experience']);
  
  if (projectsIndex !== -1) {
    const nextSectionIndex = findNextSectionIndex(lines, projectsIndex);
    const projectsSection = lines.slice(projectsIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
    
    let currentItem: Partial<ProjectItem> = {};
    let currentAchievements: string[] = [];
    let currentTechnologies: string[] = [];
    
    for (const line of projectsSection) {
      if (isNewProjectEntry(line)) {
        if (currentItem.name) {
          projects.push({
            ...currentItem as ProjectItem,
            achievements: currentAchievements,
            technologies: currentTechnologies
          });
        }
        
        currentItem = {};
        currentAchievements = [];
        currentTechnologies = [];
        
        const { name, dates } = parseProjectAndDates(line);
        currentItem.name = name;
        if (dates) {
          currentItem.startDate = dates.startDate;
          currentItem.endDate = dates.endDate;
        }
      }
      else if (!currentItem.role && isRoleLine(line)) {
        currentItem.role = line.trim();
      }
      else if (!currentItem.url && isUrlLine(line)) {
        currentItem.url = line.trim();
      }
      else if (!currentItem.description && isDescriptionLine(line)) {
        currentItem.description = line.trim();
      }
      else if (isTechnologyLine(line)) {
        currentTechnologies = [...currentTechnologies, ...extractTechnologies(line)];
      }
      else if (isAchievementLine(line)) {
        currentAchievements.push(line.trim());
      }
    }
    
    if (currentItem.name) {
      projects.push({
        ...currentItem as ProjectItem,
        achievements: currentAchievements,
        technologies: currentTechnologies
      });
    }
  }
  
  return projects;
}

function extractCertifications(lines: string[]): CertificationItem[] {
  const certifications: CertificationItem[] = [];
  const certificationsIndex = findSectionIndex(lines, ['Certifications', 'CERTIFICATIONS']);
  
  if (certificationsIndex !== -1) {
    const nextSectionIndex = findNextSectionIndex(lines, certificationsIndex);
    const certificationsSection = lines.slice(certificationsIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
    
    let currentItem: Partial<CertificationItem> = {};
    
    for (const line of certificationsSection) {
      if (isNewCertificationEntry(line)) {
        if (currentItem.name) {
          certifications.push(currentItem as CertificationItem);
        }
        
        currentItem = {};
        const { name, date } = parseCertificationAndDate(line);
        currentItem.name = name;
        if (date) {
          currentItem.date = date;
        }
      }
      else if (!currentItem.issuer && isIssuerLine(line)) {
        currentItem.issuer = line.trim();
      }
      else if (!currentItem.url && isUrlLine(line)) {
        currentItem.url = line.trim();
      }
    }
    
    if (currentItem.name) {
      certifications.push(currentItem as CertificationItem);
    }
  }
  
  return certifications;
}

function extractLanguages(lines: string[]): LanguageItem[] {
  const languages: LanguageItem[] = [];
  const languagesIndex = findSectionIndex(lines, ['Languages', 'LANGUAGES']);
  
  if (languagesIndex !== -1) {
    const nextSectionIndex = findNextSectionIndex(lines, languagesIndex);
    const languagesSection = lines.slice(languagesIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
    
    for (const line of languagesSection) {
      const languageMatch = line.match(/^([\u4e00-\u9fa5a-zA-Z]+)\s*[：:]\s*(.+)$/);
      if (languageMatch) {
        languages.push({
          name: languageMatch[1].trim(),
          proficiency: languageMatch[2].trim()
        });
      }
    }
  }
  
  return languages;
}

function extractInterests(lines: string[]): string[] {
  const interests: string[] = [];
  const interestsIndex = findSectionIndex(lines, ['Interests', 'INTERESTS', 'Hobbies']);
  
  if (interestsIndex !== -1) {
    const nextSectionIndex = findNextSectionIndex(lines, interestsIndex);
    const interestsSection = lines.slice(interestsIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
    
    interests.push(...interestsSection
      .join(' ')
      .split(/[,，、•\s]/)
      .map(interest => interest.trim())
      .filter(interest => interest.length > 1)
    );
  }
  
  return interests;
}

// 辅助函数
function isPositionLine(line: string): boolean {
  return Boolean(
    line.match(/^(Senior|Lead|Principal|Software|Frontend|Backend|Full Stack|DevOps|Product|Project).+?(Engineer|Developer|Manager|Designer|Architect)$/) ||
    line.match(/^[\u4e00-\u9fa5]+(工程师|经理|主管|总监|架构师|设计师)$/)
  );
}

function isLocationLine(line: string): boolean {
  return Boolean(
    line.match(/^[A-Za-z\s]+,\s*[A-Za-z]{2}/) || // 美国地址格式
    line.match(/^[\u4e00-\u9fa5]+[市省区]/) // 中国地址格式
  );
}

function isKeywordLine(line: string): boolean {
  return Boolean(
    line.match(/^(技术|技能|工具|框架|语言)[：:]\s*/) ||
    line.match(/^(Technologies|Skills|Tools|Frameworks|Languages)[：:]\s*/)
  );
}

function extractKeywords(line: string): string[] {
  return line
    .replace(/^(技术|技能|工具|框架|语言)[：:]\s*|^(Technologies|Skills|Tools|Frameworks|Languages)[：:]\s*/g, '')
    .split(/[,，、•\s]/)
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 1);
}

function isAchievementLine(line: string): boolean {
  return Boolean(
    line.match(/^[-•·]\s+/) || // 以短横线或圆点开头
    line.match(/^\d+\.\s+/) || // 以数字编号开头
    line.match(/^[A-Z].*[.。]$/) // 以大写字母开头，以句号结尾
  );
}

function isDegreeeLine(line: string): boolean {
  return Boolean(
    line.match(/Bachelor|Master|PhD|学士|硕士|博士|本科|研究生/i)
  );
}

function isFieldLine(line: string): boolean {
  return Boolean(
    line.match(/^[\u4e00-\u9fa5]{2,}学$/) || // 中文专业名
    line.match(/^[A-Z][a-z\s]+(Science|Engineering|Studies|Management|Design)$/) // 英文专业名
  );
}

function isGpaLine(line: string): boolean {
  return Boolean(
    line.match(/GPA[：:]\s*\d+(\.\d+)?/) ||
    line.match(/成绩[：:]\s*\d+(\.\d+)?/)
  );
}

function extractGpa(line: string): string {
  const match = line.match(/(?:GPA|成绩)[：:]\s*(\d+(?:\.\d+)?)/);
  return match ? match[1] : '';
}

function isCourseLine(line: string): boolean {
  return Boolean(
    line.match(/^(相关课程|主修课程|课程)[：:]\s*/) ||
    line.match(/^(Courses|Related Courses)[：:]\s*/)
  );
}

function extractCourses(line: string): string[] {
  return line
    .replace(/^(相关课程|主修课程|课程)[：:]\s*|^(Courses|Related Courses)[：:]\s*/g, '')
    .split(/[,，、•\s]/)
    .map(course => course.trim())
    .filter(course => course.length > 1);
}

function isNewProjectEntry(line: string): boolean {
  return Boolean(
    line.match(/^[\u4e00-\u9fa5\w\s]+项目/) || // 中文项目名
    line.match(/^[A-Z][\w\s-]+$/) || // 英文项目名
    line.match(/^\d{4}[/-]/) // 日期开头
  );
}

function parseProjectAndDates(line: string): { 
  name: string; 
  dates?: { 
    startDate: string; 
    endDate: string; 
  } 
} {
  const datePattern = /(\d{4}[/-]\d{2}|\d{4})[/-](\d{4}[/-]\d{2}|\d{4}|至今|present)/i;
  const dateMatch = line.match(datePattern);
  
  if (dateMatch) {
    const name = line.replace(datePattern, '').trim();
    return {
      name,
      dates: {
        startDate: dateMatch[1],
        endDate: dateMatch[2]
      }
    };
  }
  
  return { name: line.trim() };
}

function isRoleLine(line: string): boolean {
  return Boolean(
    line.match(/^(角色|职责|Role)[：:]\s*/) ||
    line.match(/^(项目经理|技术负责人|开发工程师|设计师|产品经理)/)
  );
}

function isUrlLine(line: string): boolean {
  return Boolean(
    line.match(/^(https?:\/\/[^\s]+)/) ||
    line.match(/^(链接|URL|Link)[：:]\s*(https?:\/\/[^\s]+)/)
  );
}

function isDescriptionLine(line: string): boolean {
  return Boolean(
    line.match(/^(描述|简介|Description)[：:]\s*/) ||
    (line.length > 10 && !isRoleLine(line) && !isUrlLine(line) && !isTechnologyLine(line))
  );
}

function isTechnologyLine(line: string): boolean {
  return Boolean(
    line.match(/^(技术栈|使用技术|Technologies)[：:]\s*/) ||
    line.match(/^(前端|后端|数据库|框架|工具)[：:]\s*/)
  );
}

function extractTechnologies(line: string): string[] {
  return line
    .replace(/^(技术栈|使用技术|Technologies|前端|后端|数据库|框架|工具)[：:]\s*/g, '')
    .split(/[,，、•\s]/)
    .map(tech => tech.trim())
    .filter(tech => tech.length > 1);
}

function isNewCertificationEntry(line: string): boolean {
  return Boolean(
    line.match(/^[\u4e00-\u9fa5\w\s]+证书/) || // 中文证书名
    line.match(/^[A-Z][\w\s-]+(?:Certification|Certificate|License)/) || // 英文证书名
    line.match(/^\d{4}[/-]/) // 日期开头
  );
}

function parseCertificationAndDate(line: string): { 
  name: string; 
  date?: string;
} {
  const datePattern = /(\d{4}[/-]\d{2}|\d{4})/;
  const dateMatch = line.match(datePattern);
  
  if (dateMatch) {
    const name = line.replace(datePattern, '').trim();
    return {
      name,
      date: dateMatch[1]
    };
  }
  
  return { name: line.trim() };
}

function isIssuerLine(line: string): boolean {
  return Boolean(
    line.match(/^(发行方|颁发机构|Issuer|Issued by)[：:]\s*/) ||
    line.match(/^([\u4e00-\u9fa5\w\s]+(?:公司|协会|组织|机构|学院|大学))/) ||
    line.match(/^([A-Z][\w\s&]+(?:Inc\.|LLC|Ltd\.|Corporation|Corp\.|Company|Co\.|Association|Organization|Institute|University))/)
  );
}

// ... existing code ... 