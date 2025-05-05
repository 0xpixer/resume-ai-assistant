import { NextRequest, NextResponse } from 'next/server';
import { Resume, SkillCategory } from '@/types/resume';

// 从环境变量中获取API密钥
const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY || '';

// 调试信息：显示API密钥的前几个字符（安全起见不显示完整密钥）
console.log(`Affinda API密钥设置状态: ${AFFINDA_API_KEY ? '已设置 (前5位: ' + AFFINDA_API_KEY.substring(0, 5) + '...)' : '未设置'}`);

export async function POST(req: NextRequest) {
  console.log('收到简历解析请求');
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('未提供文件');
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }
    
    console.log(`文件信息: 名称=${file.name}, 大小=${file.size}字节, 类型=${file.type}`);
    
    try {
      // 读取文件内容
      const fileBuffer = await file.arrayBuffer();
      
      // 如果是PDF，需要提取文本
      // 这里我们模拟提取文本，实际上需要使用pdf.js或其他库
      // 但我们可以尝试基本的解析
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        // 对于PDF文件，我们使用一个简单的方法提取一些文本
        // 这不是完整的解析，但可以获取一些基本内容
        const textDecoder = new TextDecoder('utf-8');
        const bufferData = new Uint8Array(fileBuffer);
        const pdfText = textDecoder.decode(bufferData);
        
        // 尝试提取一些文本内容（这是一个非常基础的方法）
        extractedText = pdfText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
                            .replace(/\\n/g, '\n')
                            .replace(/\\r/g, '')
                            .replace(/\\t/g, ' ');
      } else if (file.type.includes('word')) {
        // Word文档需要特殊处理，这里只能返回一个提示
        extractedText = "这是一个Word文档，需要特殊库进行解析。";
      } else {
        // 其他类型文件，尝试以文本形式读取
        const textDecoder = new TextDecoder('utf-8');
        extractedText = textDecoder.decode(fileBuffer);
      }
      
      console.log(`提取的文本(前200字符): ${extractedText.substring(0, 200)}...`);
      
      // 基于提取的文本，尝试识别和解析简历内容
      const parsedResume = parseResumeText(extractedText, file.name);
      
      return NextResponse.json({
        structured: parsedResume,
        rawText: extractedText.substring(0, 1000) // 返回部分原始文本用于调试
      });
      
    } catch (parseError) {
      console.error('解析文件内容时出错:', parseError);
      
      // 使用文件名作为姓名，创建一个更个性化的模拟结果
      const nameFromFile = file.name.replace('.pdf', '').replace('.docx', '');
      
      // 创建一个模拟结果，但使用文件名作为联系人姓名
      const mockResult = {
        structured: {
          contactInfo: {
            name: nameFromFile,
            title: '职位候选人',
            email: `${nameFromFile.toLowerCase().replace(/\s/g, '.')}@example.com`,
            phone: '123-456-7890',
            location: '中国'
          },
          summary: `这是${nameFromFile}的简历摘要。由于无法完全解析您的简历内容，请在下方编辑以反映您的实际情况。`,
          experience: [
            {
              company: '请输入公司名称',
              position: '您的职位',
              location: '工作地点',
              startDate: '2020-01',
              endDate: '至今',
              isCurrentPosition: true,
              achievements: [
                '请在此处描述您的工作职责和成就',
                '添加更多要点以突出您的技能和经验'
              ]
            }
          ],
          education: [
            {
              institution: '请输入学校名称',
              degree: '学位',
              field: '专业',
              location: '学校所在地',
              startDate: '2015',
              endDate: '2019',
              gpa: '',
              achievements: []
            }
          ],
          skills: [
            {
              name: '技能1',
              category: 'technical',
              level: 4
            },
            {
              name: '技能2',
              category: 'soft',
              level: 4
            }
          ]
        }
      };
      
      console.log('无法完全解析文件，返回部分模拟数据');
      return NextResponse.json(mockResult);
    }
    
  } catch (error) {
    console.error('简历解析失败:', error);
    return NextResponse.json(
      { 
        error: `简历解析失败: ${error instanceof Error ? error.message : String(error)}`,
        structured: {
          contactInfo: { name: '', title: '', email: '', phone: '', location: '' },
          summary: '',
          experience: [],
          education: [],
          skills: []
        }
      }, 
      { status: 500 }
    );
  }
}

// 基于提取的文本尝试解析简历内容
function parseResumeText(text: string, fileName: string): Resume {
  console.log('尝试解析简历文本...');
  
  // 从文件名中获取可能的姓名
  const nameFromFile = fileName.replace('.pdf', '').replace('.docx', '');
  
  // 尝试从文本中识别电子邮件
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatches = text.match(emailRegex) || [];
  const email = emailMatches.length > 0 ? emailMatches[0] : '';
  
  // 尝试识别电话号码
  const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?|(\d{8,11})/g;
  const phoneMatches = text.match(phoneRegex) || [];
  const phone = phoneMatches.length > 0 ? phoneMatches[0] : '';
  
  // 尝试识别技能 (基于常见技能关键词)
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python',
    'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'NoSQL',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git', 'Agile', 'Scrum'
  ];
  
  const extractedSkills = skillKeywords
    .filter(skill => text.toLowerCase().includes(skill.toLowerCase()))
    .map(skill => skill.toLowerCase());
  
  const skills = extractedSkills.map(skill => ({
    name: skill,
    category: 'technical' as SkillCategory,
    level: 3
  }));
  
  // 尝试提取摘要 (取前300个字符作为摘要)
  const summary = text.replace(/\\n/g, ' ')
                    .replace(/\\r/g, ' ')
                    .replace(/\\t/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 300);
  
  // 为简历创建一个基本结构
  const parsedResume: Resume = {
    contactInfo: {
      name: nameFromFile,
      title: detectTitle(text) || '职位候选人',
      email: email,
      phone: phone,
      location: detectLocation(text) || '中国'
    },
    summary: summary,
    experience: extractExperience(text),
    education: extractEducation(text),
    skills: skills.length > 0 ? skills : [{ name: '请添加技能', category: 'technical', level: 3 }]
  };
  
  console.log(`解析完成: 找到 ${skills.length} 个技能, ${parsedResume.experience.length} 段工作经验, ${parsedResume.education.length} 段教育经历`);
  
  return parsedResume;
}

// 从文本中识别可能的职位
function detectTitle(text: string): string {
  const titleKeywords = [
    '软件工程师', '开发工程师', '前端开发', '后端开发', '全栈开发',
    'Software Engineer', 'Developer', 'Frontend', 'Backend', 'Full Stack',
    'Product Manager', '产品经理', 'Designer', '设计师', 'Data Scientist', 
    '数据科学家', 'Project Manager', '项目经理'
  ];
  
  for (const title of titleKeywords) {
    if (text.includes(title)) {
      return title;
    }
  }
  
  return '';
}

// 从文本中识别可能的地点
function detectLocation(text: string): string {
  const locationKeywords = [
    '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉',
    'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 
    'Nanjing', 'Chengdu', 'Wuhan', 'China', '中国'
  ];
  
  for (const location of locationKeywords) {
    if (text.includes(location)) {
      return location;
    }
  }
  
  return '';
}

// 尝试从文本中提取工作经验
function extractExperience(text: string): any[] {
  const experience = [];
  
  // 尝试查找公司名称的模式
  const companyRegex = /(?:公司|企业|集团|Corp|Inc|LLC|有限公司|股份有限公司)/g;
  const companyMatches = text.match(companyRegex);
  
  // 如果找到可能的公司引用，尝试提取工作经验
  if (companyMatches && companyMatches.length > 0) {
    // 找到包含公司的上下文
    const segments = text.split(/[\n\r]+/);
    
    // 记录所有找到的公司及其位置
    const companies = [];
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].match(companyRegex)) {
        // 提取可能的公司名称
        let companyName = segments[i].trim();
        if (companyName.length > 50) {
          companyName = companyName.substring(0, 50);
        }
        
        companies.push({
          name: companyName,
          index: i,
          position: '',
          location: ''
        });
      }
    }
    
    // 为每个公司提取成就，只提取到下一个公司之前的内容
    for (let c = 0; c < companies.length; c++) {
      const currentCompany = companies[c];
      const nextCompany = companies[c + 1];
      
      // 确定当前公司内容的起始和结束位置
      const startIndex = Math.max(0, currentCompany.index - 2);
      const endIndex = nextCompany ? nextCompany.index : Math.min(segments.length, currentCompany.index + 15);
      
      // 提取公司上下文信息
      const companyContext = segments.slice(startIndex, endIndex).join(' ');
      currentCompany.position = detectPositionFromContext(companyContext);
      currentCompany.location = detectLocation(companyContext);
      
      // 提取成就 (使用当前公司到下一个公司之间的文本)
      const achievements = [];
      for (let j = currentCompany.index + 1; j < endIndex; j++) {
        // 跳过太短的行或空行
        if (segments[j].trim().length <= 10) continue;
        
        // 只添加不包含公司关键词的行作为成就
        if (!segments[j].match(companyRegex)) {
          achievements.push(segments[j].trim());
        }
        
        // 限制成就数量，防止提取太多无关内容
        if (achievements.length >= 5) break;
      }
      
      experience.push({
        company: currentCompany.name,
        position: currentCompany.position,
        location: currentCompany.location,
        startDate: '',  // 日期格式通常很难从纯文本中准确提取
        endDate: '',
        isCurrentPosition: false,
        achievements: achievements.length > 0 ? achievements : ['请添加工作职责和成就']
      });
    }
  }
  
  // 如果没有找到任何工作经验，返回一个默认条目
  if (experience.length === 0) {
    experience.push({
      company: '请输入公司名称',
      position: '您的职位',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentPosition: false,
      achievements: ['请在此处添加您的主要成就和职责']
    });
  }
  
  return experience;
}

// 从上下文中检测职位
function detectPositionFromContext(context: string): string {
  const positionKeywords = [
    '工程师', '开发者', '经理', '总监', '专员', '主管', '设计师', '分析师',
    'Engineer', 'Developer', 'Manager', 'Director', 'Specialist', 'Supervisor', 
    'Designer', 'Analyst'
  ];
  
  for (const position of positionKeywords) {
    if (context.includes(position)) {
      // 尝试提取包含职位的完整短语
      const beforeText = context.split(position)[0];
      const words = beforeText.split(/\s+/);
      const relevantWords = words.slice(Math.max(0, words.length - 3));
      
      return [...relevantWords, position].join(' ').trim();
    }
  }
  
  return '';
}

// 尝试从文本中提取教育经历
function extractEducation(text: string): any[] {
  const education = [];
  
  // 尝试查找教育机构的模式
  const eduRegex = /(?:大学|学院|学校|University|College|School|Institute)/gi;
  const eduMatches = text.match(eduRegex);
  
  // 如果找到可能的教育机构引用，尝试提取教育经历
  if (eduMatches && eduMatches.length > 0) {
    // 找到包含教育机构的上下文
    const segments = text.split(/[\n\r]+/);
    
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].match(eduRegex)) {
        // 可能找到一段教育经历
        const eduLine = segments[i];
        
        // 提取可能的学校名称
        let institution = eduLine.trim();
        if (institution.length > 50) {
          institution = institution.substring(0, 50);
        }
        
        // 尝试检测学位和专业
        const degreeMatches = segments.slice(i, i + 3).join(' ').match(/(?:本科|学士|硕士|博士|Bachelor|Master|Ph\.?D|MBA)/i);
        const degree = degreeMatches ? degreeMatches[0] : '';
        
        // 尝试检测专业领域
        const fieldMatches = segments.slice(i, i + 3).join(' ').match(/(?:计算机|软件|电子|机械|土木|化学|物理|数学|经济|金融|管理|法律|医学|Computer|Software|Electronic|Civil|Mechanical|Chemistry|Physics|Math|Economic|Finance|Management|Law|Medicine)/i);
        const field = fieldMatches ? fieldMatches[0] : '';
        
        education.push({
          institution: institution,
          degree: degree,
          field: field,
          location: detectLocation(segments.slice(i, i + 3).join(' ')),
          startDate: '',  // 日期格式通常很难从纯文本中准确提取
          endDate: '',
          gpa: '',
          achievements: []
        });
        
        // 跳过已处理的段落
        i += 2;
      }
    }
  }
  
  // 如果没有找到教育经历，返回一个空的默认条目
  if (education.length === 0) {
    education.push({
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      achievements: []
    });
  }
  
  return education;
} 