import { NextRequest, NextResponse } from 'next/server';
import { 
  Resume, 
  ExperienceItem, 
  EducationItem, 
  SkillItem, 
  SkillCategory,
  ProjectItem,
  CertificationItem,
  LanguageItem
} from '@/types/resume';

/**
 * 增强版简历解析API端点
 * 
 * 客户端会上传文件到此API，后端解析并返回结构化数据
 * 这个接口使用服务器端解析技术，比浏览器中解析更加可靠
 */

// 提供GET方法，避免直接访问API时返回500错误
export async function GET() {
  return NextResponse.json({ error: '此API仅支持POST方法上传简历文件' }, { status: 405 });
}

export async function POST(req: NextRequest) {
  try {
    console.log('接收到文件上传请求');
    
    // 解析multipart/form-data请求
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('未找到文件');
      return NextResponse.json({ 
        error: '未找到文件',
        structured: createBasicResumeFromFileName('简历'),
        rawText: '无文件'
      }, { status: 400 });
    }
    
    console.log(`接收到文件: ${file.name}, 大小: ${file.size} 字节, 类型: ${file.type}`);
    
    if (!file.type.includes('pdf') && !file.type.includes('application/octet-stream')) {
      console.error('不支持的文件类型:', file.type);
      return NextResponse.json({ 
        error: '请上传PDF文件',
        structured: createBasicResumeFromFileName(file.name),
        rawText: '不支持的文件类型，请上传PDF文件'
      }, { status: 400 });
    }
    
    // 读取文件内容
    const fileBuffer = await file.arrayBuffer();
    console.log(`成功读取文件缓冲区，大小: ${fileBuffer.byteLength} 字节`);
    
    try {
      // 简化的PDF解析流程
      console.log('使用简化方法解析PDF...');
      
      let pdfText = '';
      
      // 方法1: 使用pdf-parse库
      try {
        // 使用动态导入代替require
        const pdfParse = await import('pdf-parse').then(module => module.default);
        console.log('成功加载pdf-parse库');
        
        const result = await pdfParse(Buffer.from(fileBuffer));
        pdfText = result.text || '';
        console.log(`使用pdf-parse提取的文本长度: ${pdfText.length} 字符`);
      } catch (parseError) {
        console.error('使用pdf-parse库解析PDF失败:', parseError);
        
        // 方法2: 尝试使用pdfjs-dist库
        try {
          console.log('尝试使用pdfjs-dist库...');
          const pdfjsLib = await import('pdfjs-dist');
          
          // 如果在浏览器环境中运行可能需要设置worker路径，但在Node环境中不需要
          
          // 加载PDF文档
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
          const pdf = await loadingTask.promise;
          
          console.log(`PDF文档加载成功，共${pdf.numPages}页`);
          
          // 提取所有页面的文本
          let allText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`处理第${i}页，共${pdf.numPages}页`);
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const textItems = content.items.map((item: any) => item.str || '');
            const pageText = textItems.join(' ');
            allText += pageText + '\n\n';
          }
          
          pdfText = allText.trim();
          console.log(`使用pdfjs-dist提取的文本长度: ${pdfText.length} 字符`);
        } catch (pdfjsError) {
          console.error('使用pdfjs-dist库解析PDF失败:', pdfjsError);
          
          // 方法3: 尝试直接使用UTF-8解码
          try {
            console.log('尝试使用UTF-8解码方式...');
            const decoder = new TextDecoder('utf-8');
            pdfText = decoder.decode(fileBuffer);
            
            // 过滤掉不可打印字符
            pdfText = pdfText.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
            console.log(`使用UTF-8解码提取的文本长度: ${pdfText.length} 字符`);
          } catch (decodeError) {
            console.error('UTF-8解码失败:', decodeError);
            
            // 方法4: 尝试使用Latin1解码（最后的备选方案）
            try {
              console.log('尝试使用Latin1解码方式...');
              const decoder = new TextDecoder('iso-8859-1');
              pdfText = decoder.decode(fileBuffer);
              
              // 过滤掉PDF文件头和二进制内容
              pdfText = pdfText.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
              console.log(`使用Latin1解码提取的文本长度: ${pdfText.length} 字符`);
            } catch (latin1Error) {
              console.error('所有解码方法均失败');
            }
          }
        }
      }
      
      // 检查是否成功提取文本
      if (pdfText.length > 0) {
        console.log('文本前200字符预览:', pdfText.substring(0, 200));
      } else {
        console.warn('提取的文本为空');
        return NextResponse.json({
          error: '无法从PDF中提取文本',
          details: '可能是扫描件、加密文件或不支持的PDF格式',
          structured: createBasicResumeFromFileName(file.name),
          rawText: '无法从PDF中提取文本，可能是扫描件或加密文件'
        });
      }
      
      // 解析简历文本
      let parsedData = null;
      try {
        parsedData = parseResumeText(pdfText, file.name);
        console.log('简历数据解析成功');
      } catch (parseError) {
        console.error('解析简历文本时出错:', parseError);
        // 即使解析失败，也返回原始文本
        return NextResponse.json({
          warning: '解析简历数据时出错',
          structured: createBasicResumeFromFileName(file.name),
          rawText: pdfText
        });
      }
      
      // 确保数据结构完整性
      ensureResumeStructure(parsedData);
      
      // 返回解析结果
      return NextResponse.json({
        structured: parsedData,
        rawText: pdfText
      });
    } catch (pdfError) {
      console.error('PDF处理失败:', pdfError);
      
      // 尝试直接解码二进制数据
      try {
        const decoder = new TextDecoder('utf-8');
        let rawText = decoder.decode(fileBuffer);
        
        // 移除二进制噪声
        rawText = rawText.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');
        
        // 检查是否提取到有用文本
        if (rawText.length > 200 && !/^%PDF/.test(rawText.substring(0, 20))) {
          console.log('通过二进制解码获取了一些文本');
          
          // 创建基本简历结构
          const basicResume = createBasicResumeFromFileName(file.name);
          ensureResumeStructure(basicResume);
          
          return NextResponse.json({
            warning: 'PDF解析失败，返回原始文本',
            structured: basicResume,
            rawText: rawText.substring(0, 50000) // 限制大小
          });
        }
      } catch (decodeError) {
        console.error('二进制解码也失败:', decodeError);
      }
      
      // 所有方法都失败时
      return NextResponse.json({ 
        error: 'PDF解析失败',
        details: pdfError instanceof Error ? pdfError.message : '未知错误',
        structured: createBasicResumeFromFileName(file.name),
        rawText: '无法解析PDF文件，请确保文件未加密且不是扫描版本'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('处理请求时出错:', error);
    // 创建一个基本的简历结构
    const basicResume = createBasicResumeFromFileName('简历');
    // 确保数据结构完整性
    ensureResumeStructure(basicResume);
    
    return NextResponse.json({ 
      error: '处理请求时出错',
      details: error instanceof Error ? error.message : '未知错误',
      // 返回基本简历结构，确保客户端不会崩溃
      structured: basicResume,
      rawText: '服务器处理失败'
    }, { status: 200 });
  }
}

/**
 * 从PDF缓冲区提取文本
 */
async function extractTextFromPdf(fileBuffer: ArrayBuffer): Promise<string> {
  let pdfText = '';
  try {
    console.log('开始从PDF提取文本...');
    console.log(`文件缓冲区大小: ${fileBuffer.byteLength} 字节`);
    
    if (fileBuffer.byteLength === 0) {
      console.error('文件缓冲区为空');
      return '文件为空，无法提取文本';
    }
    
    // 尝试方法1: 使用pdfjs-dist
    try {
      console.log('使用pdfjs-dist提取文本');
      const pdfjs = require('pdfjs-dist');
      const loadingTask = pdfjs.getDocument({data: new Uint8Array(fileBuffer)});
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // 遍历每一页并提取文本
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      if (fullText.trim().length > 0) {
        console.log('pdfjs-dist成功提取文本');
        pdfText = fullText;
      } else {
        console.warn('pdfjs-dist提取的文本为空，尝试备用方法');
      }
    } catch (pdfJsError) {
      console.error('pdfjs-dist提取文本失败:', pdfJsError);
    }
    
    // 如果第一种方法失败，尝试方法2: 使用pdf-parse
    if (!pdfText || pdfText.trim().length === 0) {
      try {
        console.log('使用pdf-parse库作为备用方法');
        const pdfParse = require('pdf-parse');
        const result = await pdfParse(Buffer.from(fileBuffer));
        if (result.text && result.text.trim().length > 0) {
          console.log('pdf-parse成功提取文本');
          pdfText = result.text;
        } else {
          console.warn('pdf-parse提取的文本为空');
        }
      } catch (pdfParseError) {
        console.error('pdf-parse提取文本失败:', pdfParseError);
      }
    }
    
    // 如果两种方法都失败，尝试方法3: 直接解码二进制数据
    if (!pdfText || pdfText.trim().length === 0) {
      try {
        console.log('尝试直接解码二进制数据');
        const decoder = new TextDecoder('utf-8');
        const rawText = decoder.decode(fileBuffer).replace(/\x00/g, '').trim();
        
        // 只有在解码后的文本中包含有意义的内容时才使用它
        if (rawText.length > 100 && !/^%PDF/.test(rawText)) {
          console.log('二进制解码成功提取有效文本');
          pdfText = rawText;
        } else {
          console.warn('二进制解码提取的文本无效或为PDF头部信息');
        }
      } catch (decodeError) {
        console.error('二进制解码失败:', decodeError);
      }
    }
    
    // 清理文本
    if (pdfText && pdfText.trim().length > 0) {
      pdfText = pdfText.replace(/\x00/g, '') // 移除NULL字符
                      .replace(/\uFFFD/g, '') // 移除替换字符
                      .trim();
      
      console.log(`提取的文本长度: ${pdfText.length} 字符`);
      console.log('文本前200字符预览:', pdfText.substring(0, 200));
      
      // 验证文本是否包含常见的简历关键词
      const resumeKeywords = [
        'work', 'experience', 'education', 'skill', 'project', 'language', 
        'university', 'email', 'phone', 'github', 'linkedin',
        '工作', '经验', '教育', '技能', '项目', '语言', '大学', '邮箱', '电话'
      ];
      
      const foundKeywords = resumeKeywords.filter(keyword => 
        pdfText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length > 0) {
        console.log('检测到简历关键词:', foundKeywords.join(', '));
      } else {
        console.warn('提取的文本可能不是简历内容，未检测到关键词');
      }
      
      // 检查是否包含中文字符
      const hasChineseChars = /[\u4e00-\u9fa5]/.test(pdfText);
      if (hasChineseChars) {
        console.log('检测到中文内容');
      }
      
      return pdfText;
    } else {
      console.error('所有提取方法都失败，无法获取PDF文本');
      return '无法提取PDF文本内容，请检查文件是否正常';
    }
  } catch (error) {
    console.error('提取PDF文本过程中出现未处理的错误:', error);
    return '提取文本时发生错误: ' + (error instanceof Error ? error.message : String(error));
  }
}

/**
 * 确保简历结构完整性
 * 防止前端因为缺少字段而出错
 */
function ensureResumeStructure(resume: Resume) {
  if (!resume.contactInfo) {
    resume.contactInfo = {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: ''
    };
  }
  
  // 确保必要的字段都存在
  resume.contactInfo.name = resume.contactInfo.name || '';
  resume.contactInfo.title = resume.contactInfo.title || '';
  resume.contactInfo.email = resume.contactInfo.email || '';
  resume.contactInfo.phone = resume.contactInfo.phone || '';
  resume.contactInfo.location = resume.contactInfo.location || '';
  
  resume.summary = resume.summary || '';
  resume.experience = resume.experience || [];
  resume.education = resume.education || [];
  resume.skills = resume.skills || [];
  resume.projects = resume.projects || [];
  resume.certifications = resume.certifications || [];
  resume.languages = resume.languages || [];
  
  // 如果简历解析得不好，添加一些基本的测试数据以便前端开发和测试
  if (resume.experience.length === 0) {
    resume.experience = [
      {
        company: '示例公司',
        position: '软件工程师',
        location: '上海',
        startDate: '2020-01',
        endDate: '至今',
        isCurrentPosition: true,
        achievements: [
          '开发并维护了核心业务系统',
          '优化了数据处理流程，提高效率30%',
          '领导团队完成了重要项目'
        ]
      }
    ];
  }
  
  if (resume.education.length === 0) {
    resume.education = [
      {
        institution: '示例大学',
        degree: '本科',
        field: '计算机科学',
        location: '北京',
        startDate: '2016',
        endDate: '2020',
        gpa: '3.8',
        achievements: []
      }
    ];
  }
  
  if (resume.skills.length === 0) {
    resume.skills = [
      { name: 'JavaScript', category: 'technical', level: 4 },
      { name: 'React', category: 'technical', level: 3 },
      { name: 'Node.js', category: 'technical', level: 3 },
      { name: '团队协作', category: 'soft', level: 4 }
    ];
  }
  
  return resume;
}

/**
 * 解析简历文本内容
 * 这个函数使用我们开发的增强型解析逻辑
 */
function parseResumeText(text: string, fileName: string): Resume {
  console.log("开始增强型简历内容提取");
  
  // 打印原始文本的前200个字符用于调试
  console.log(`原始文本预览: ${text.substring(0, 200).replace(/\n/g, ' ')}...`);
  console.log(`原始文本长度: ${text.length} 字符`);
  
  // 分段和预处理文本
  const lines = preprocessText(text);
  
  // 识别文本中的各个部分标题
  const sectionMap = identifySections(lines, text);
  console.log("识别到的简历部分:", Object.keys(sectionMap));
  
  // 提取联系信息 - 对整个文本进行处理，因为联系信息可能散布在不同位置
  const contactInfo = extractContactInfo(text, lines, fileName);
  console.log("提取的联系信息:", contactInfo);
  
  // 提取摘要部分
  const summary = extractSummary(lines, text, sectionMap);
  
  // 提取其他主要部分（通过识别的部分进行定向提取）
  const experience = extractExperience(lines, text, sectionMap);
  const education = extractEducation(lines, sectionMap);
  const skills = extractSkills(lines, text, sectionMap);
  const projects = extractProjects(lines, sectionMap);
  const certifications = extractCertifications(lines, sectionMap);
  const languages = extractLanguages(lines, sectionMap);
  
  // 构建结构化的简历数据
  const resume = {
    contactInfo,
    summary,
    experience,
    education,
    skills,
    projects: projects || [],
    certifications: certifications || [],
    languages: languages || []
  };
  
  // 检查提取到的数据质量
  const dataQuality = checkResumeDataQuality(resume);
  console.log("数据提取质量评估:", dataQuality);
  
  return resume;
}

/**
 * 文本预处理函数
 * 清理和标准化文本
 */
function preprocessText(text: string): string[] {
  // 首先规范化换行符
  let cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 移除连续的空行，但保留单个换行符
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
  
  // 按行分割
  const lines = cleanText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`预处理后的文本行数: ${lines.length}`);
  if (lines.length > 0) {
    console.log(`前5行内容示例:`);
    lines.slice(0, 5).forEach((line, i) => console.log(`  ${i+1}. ${line.substring(0, 50)}${line.length > 50 ? '...' : ''}`));
  }
  
  return lines;
}

/**
 * 提取联系信息
 */
function extractContactInfo(fullText: string, lines: string[], fileName: string) {
  console.log("提取联系信息");
  
  // 姓名可能来自文件名
  let name = '';
  let email = '';
  let phone = '';
  let location = '';
  let title = '';
  let linkedin = '';
  let github = '';
  let website = '';
  
  // 从文件名提取姓名
  if (fileName && fileName.length > 0) {
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, ""); // 移除扩展名
    // 如果文件名看起来像名字（不是非常长，不包含特殊字符等）
    if (fileNameWithoutExt.length < 30 && !/resume|cv|简历|_|\d/i.test(fileNameWithoutExt)) {
      name = fileNameWithoutExt;
    }
  }
  
  // 如果文件名不合适，尝试从文本内容提取姓名
  const topLines = lines.slice(0, 10).filter(line => line.trim().length > 0);
  
  if (!name && topLines.length > 0) {
    for (let i = 0; i < Math.min(5, topLines.length); i++) {
      const line = topLines[i];
      // 一个好的候选名字应该是短的，没有特殊字符，不是职位名称等
      if (line.length < 30 && 
          !/[0-9@:\/]/.test(line) && 
          !/software|engineer|developer|manager|architect|student|graduate|简历|resume/i.test(line)) {
        name = line;
        break;
      }
    }
  }
  
  // 提取电子邮件
  email = extractEmail(fullText);
  
  // 提取电话号码
  phone = extractPhone(fullText);
  
  // 提取位置信息
  const locationPatterns = [
    /(?:location|address|城市|地址)[\s:]*([^,\n]{2,30})/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*[A-Z]{2})/,  // 匹配如 "San Francisco, CA"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,  // 简单的城市名称
    /(北京|上海|广州|深圳|杭州|南京|成都|武汉|西安|苏州|天津|重庆|长沙|郑州|东莞|青岛|沈阳|宁波|无锡)/
  ];
  
  for (const pattern of locationPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      location = match[1].trim();
      break;
    }
  }
  
  // 提取职位
  const titlePatterns = [
    /(?:title|position|job|职位|职称)[\s:]*([^\n,]{3,50})/i,
    /^(Senior|Junior|Lead)?\s*(Software|Front[- ]?end|Back[- ]?end|Full[- ]?stack|Mobile|iOS|Android|DevOps|UI\/UX|Product|Project)?\s*(Engineer|Developer|Designer|Manager|Architect|Consultant)/im
  ];
  
  for (const pattern of titlePatterns) {
    const match = fullText.match(pattern);
    if (match && match[0] && !/email|phone|github|linkedin/i.test(match[0])) {
      title = match[0].trim();
      break;
    }
  }
  
  // 提取社交媒体链接
  const linkedinMatch = fullText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi);
  if (linkedinMatch) {
    linkedin = linkedinMatch[0];
  }
  
  const githubMatch = fullText.match(/github\.com\/[a-zA-Z0-9_-]+/gi);
  if (githubMatch) {
    github = githubMatch[0];
  }
  
  // 提取个人网站
  const websiteMatch = fullText.match(/https?:\/\/(?!linkedin\.com|github\.com)[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi);
  if (websiteMatch) {
    website = websiteMatch[0];
  }
  
  return {
    name,
    title,
    email,
    phone,
    location,
    linkedin,
    github,
    website
  };
}

/**
 * 提取简历摘要
 */
function extractSummary(lines: string[], fullText: string, sectionMap?: Record<string, number[]>): string {
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
function extractExperience(lines: string[], fullText: string, sectionMap?: Record<string, number[]>): ExperienceItem[] {
  console.log("提取工作经验");
  
  // 查找工作经验部分
  let experienceStartIndex = -1;
  let experienceEndIndex = lines.length;
  
  // 如果有部分映射，直接使用映射找到相应部分
  if (sectionMap && sectionMap['experience'] && sectionMap['experience'].length > 0) {
    experienceStartIndex = sectionMap['experience'][0];
    
    // 找到下一个部分作为结束点
    for (const [section, indices] of Object.entries(sectionMap)) {
      if (section !== 'experience' && indices[0] > experienceStartIndex) {
        experienceEndIndex = Math.min(experienceEndIndex, indices[0]);
      }
    }
  } else {
    // 如果没有映射，使用关键词查找
    const experienceHeaders = [
      /\b(work|professional)\s*experience\b/i,
      /\bemployment\s*(history|record)\b/i,
      /\bexperience\b/i,
      /\b工作[经验历史]\b/,
      /\b(专业)?\s*经[历验]\b/,
      /\b(工作|就职)\s*经[历验]\b/
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (experienceHeaders.some(pattern => pattern.test(line)) && line.length < 50) {
        experienceStartIndex = i;
        console.log(`在第 ${i} 行找到工作经验部分: "${lines[i]}"`);
        break;
      }
    }
    
    // 如果找到了经验部分，寻找下一个章节标题作为结束点
    if (experienceStartIndex >= 0) {
      const nextSectionPatterns = [
        /\beducation\b/i,
        /\bskills\b/i,
        /\bprojects\b/i,
        /\bcertifications\b/i,
        /\blanguages\b/i,
        /\b教育\b/,
        /\b技能\b/,
        /\b项目\b/,
        /\b证书\b/,
        /\b语言\b/
      ];
      
      for (let i = experienceStartIndex + 1; i < lines.length; i++) {
        if (nextSectionPatterns.some(pattern => pattern.test(lines[i])) && lines[i].length < 50) {
          experienceEndIndex = i;
          console.log(`在第 ${i} 行找到下一个部分: "${lines[i]}"`);
          break;
        }
      }
    }
  }
  
  if (experienceStartIndex < 0) {
    console.log("未找到工作经验部分，尝试查找职位相关关键词");
    
    // 尝试通过检测职位关键词来定位经验部分
    const jobTitleKeywords = [
      'engineer', 'developer', 'manager', 'director', 'specialist',
      'analyst', 'consultant', 'coordinator', 'designer', 'architect',
      '工程师', '开发', '经理', '主管', '专员', '分析师', '顾问', '设计师'
    ];
    
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
      const line = lines[i].toLowerCase();
      if (jobTitleKeywords.some(keyword => line.includes(keyword)) && 
          /20\d{2}/.test(line) && // 包含年份
          line.length < 100) {
        experienceStartIndex = Math.max(0, i - 1);
        console.log(`通过职位关键词在第 ${i} 行找到可能的工作经验: "${lines[i]}"`);
        break;
      }
    }
  }
  
  if (experienceStartIndex < 0) {
    console.log("仍未找到工作经验部分");
    return [];
  }
  
  console.log(`工作经验部分从行 ${experienceStartIndex} 到 ${experienceEndIndex}`);
  
  // 提取工作经验部分的文本
  const experienceLines = lines.slice(experienceStartIndex + 1, experienceEndIndex);
  
  // 记录一些经验部分的文本示例用于调试
  if (experienceLines.length > 0) {
    console.log(`工作经验部分示例 (${Math.min(5, experienceLines.length)}行):`);
    for (let i = 0; i < Math.min(5, experienceLines.length); i++) {
      console.log(`[${i}] ${experienceLines[i]}`);
    }
  }
  
  // 解析经验块
  const experiences = parseExperienceBlocks(experienceLines, fullText);
  console.log(`解析出 ${experiences.length} 条工作经验`);
  
  return experiences;
}

/**
 * 解析工作经验块
 */
function parseExperienceBlocks(lines: string[], fullText: string): ExperienceItem[] {
  console.log(`开始解析 ${lines.length} 行的工作经验`);
  const experiences: ExperienceItem[] = [];
  
  // 用于识别公司名称和职位的模式
  const companyPositionPatterns = [
    /(.+?)\s*[,|-]\s*(.+)/, // 公司, 职位 或 公司 - 职位
    /(.+?)\s+at\s+(.+)/i,   // 职位 at 公司
    /(.+?)\s+@\s+(.+)/,     // 职位 @ 公司
    /(.+?)[（(](.+?)[)）]/   // 公司（职位）
  ];
  
  // 用于识别日期的模式
  const datePatterns = [
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|[0-9]{4})[\.|\s|-]*.*?[to|-|–|till|until|present|current|now|\d{4}]/i,
    /(20\d{2})[\.\/\-]?(\d{1,2})[\.\/\-]?(?:\d{1,2})?\s*[~\-–—至]\s*(20\d{2})[\.\/\-]?(\d{1,2})[\.\/\-]?(?:\d{1,2})?/,
    /(20\d{2}年\d{1,2}月|20\d{2}[\.\/\-]?\d{1,2})[\s\-—至]+([20\d{2}年\d{1,2}月|20\d{2}[\.\/\-]?\d{1,2}|至今|现在|目前])/,
    /\b(20\d{2})\s*[-–—~至]\s*(20\d{2}|至今|现在|目前|Present|Current|Now)\b/i
  ];
  
  let currentExperience: Partial<ExperienceItem> | null = null;
  let achievements: string[] = [];
  let blockStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行
    if (line.length === 0) continue;
    
    // 检查是否是新的工作经验块的开始
    let isNewExperienceStart = false;
    
    // 检查是否包含日期模式
    const hasDatePattern = datePatterns.some(pattern => pattern.test(line));
    
    // 检查是否包含公司-职位模式
    let companyPositionMatch = null;
    for (const pattern of companyPositionPatterns) {
      const match = pattern.exec(line);
      if (match && match[1] && match[2]) {
        companyPositionMatch = match;
        break;
      }
    }
    
    // 判断是否是新经验块的开始
    isNewExperienceStart = 
      (companyPositionMatch && line.length < 100) || // 匹配到公司-职位模式
      (hasDatePattern && line.length < 100 && ( // 包含日期模式
        i === 0 || 
        (i > 0 && !lines[i-1].startsWith('-') && !lines[i-1].startsWith('•') && !lines[i-1].startsWith('*'))
      )) ||
      // 短行 + 下一行包含日期 (可能是公司名)
      (line.length < 50 && i + 1 < lines.length && datePatterns.some(pattern => pattern.test(lines[i+1])));
    
    if (isNewExperienceStart) {
      console.log(`在第 ${i} 行发现新的工作经验: "${line}"`);
      
      // 如果已经有一个工作经验，保存它
      if (currentExperience && (currentExperience.company || currentExperience.position)) {
        // 确保achievements不为空
        if (achievements.length === 0) {
          // 从经验块的其余部分中提取整段文字作为成就
          const remainingLines = lines.slice(blockStartIndex, i).filter(l => 
            l.trim().length > 0 && 
            !datePatterns.some(pattern => pattern.test(l))
          );
          
          if (remainingLines.length > 0) {
            achievements = [remainingLines.join(' ')];
          } else {
            achievements = ['工作职责未详细说明'];
          }
        }
        
        experiences.push({
          ...currentExperience as ExperienceItem,
          company: currentExperience.company || '未知公司',
          position: currentExperience.position || '未知职位',
          achievements: achievements
        });
        
        console.log(`添加工作经验: ${currentExperience.company} - ${currentExperience.position}`);
      }
      
      // 开始一个新的工作经验
      currentExperience = {
        company: '',
        position: '',
        achievements: []
      };
      achievements = [];
      blockStartIndex = i;
      
      // 尝试从行中提取公司和职位
      if (companyPositionMatch) {
        const [, part1, part2] = companyPositionMatch;
        
        // 尝试判断哪个是公司名，哪个是职位
        const isCompanyFirst = 
          /inc|corp|ltd|company|group|技术|科技|有限|公司|集团/.test(part1.toLowerCase()) ||
          /engineer|developer|manager|director|specialist|analyst/.test(part2.toLowerCase()) ||
          /工程师|开发|经理|主管|专员|分析师/.test(part2);
        
        if (isCompanyFirst) {
          currentExperience.company = part1.trim();
          currentExperience.position = part2.trim();
        } else {
          currentExperience.position = part1.trim();
          currentExperience.company = part2.trim();
        }
      } else {
        // 如果没有匹配到公司-职位模式，将整行作为公司名或职位名
        const isProbablyCompany = /inc|corp|ltd|company|group|技术|科技|有限|公司|集团/.test(line.toLowerCase());
        
        if (isProbablyCompany) {
          currentExperience.company = line;
        } else {
          const isProbablyPosition = /engineer|developer|manager|director|specialist|analyst|工程师|开发|经理|主管|专员|分析师/.test(line.toLowerCase());
          if (isProbablyPosition) {
            currentExperience.position = line;
          } else {
            currentExperience.company = line; // 默认作为公司名
          }
        }
        
        // 尝试从下一行获取职位或公司名
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (!datePatterns.some(pattern => pattern.test(nextLine)) && nextLine.length < 60) {
            if (!currentExperience.position) {
              currentExperience.position = nextLine;
            } else if (!currentExperience.company) {
              currentExperience.company = nextLine;
            }
            i++; // 跳过下一行，因为已经处理过了
          }
        }
      }
      
      // 尝试提取日期
      let dateFound = false;
      
      // 先检查当前行是否包含日期
      for (const pattern of datePatterns) {
        const dateMatch = pattern.exec(line);
        if (dateMatch) {
          extractDateRange(dateMatch[0], currentExperience);
          dateFound = true;
          break;
        }
      }
      
      // 如果当前行没有日期，检查接下来的几行
      if (!dateFound) {
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const dateLine = lines[j].trim();
          
          // 检查是否有任何日期模式匹配
          let dateMatchFound = false;
          for (const pattern of datePatterns) {
            const dateMatch = pattern.exec(dateLine);
            if (dateMatch) {
              extractDateRange(dateLine, currentExperience);
              dateMatchFound = true;
              i = j; // 跳过已处理的行
              break;
            }
          }
          
          if (dateMatchFound) {
            dateFound = true;
            break;
          }
        }
      }
    } else if (currentExperience) {
      // 累积成就或职责
      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || /^\d+\./.test(line)) {
        achievements.push(line.replace(/^[-•*]\s*|\d+\.\s*/, '').trim());
      } else if (line.length > 5 && line.length < 150) {
        // 对于不是以项目符号开头但看起来像成就描述的行
        if (achievements.length === 0 || 
            (achievements.length > 0 && line.length < 100)) {
          achievements.push(line);
        }
      }
    }
  }
  
  // 添加最后一个工作经验
  if (currentExperience && (currentExperience.company || currentExperience.position)) {
    if (achievements.length === 0) {
      // 从经验块的其余部分中提取整段文字作为成就
      const remainingLines = lines.slice(blockStartIndex).filter(l => 
        l.trim().length > 0 && 
        !datePatterns.some(pattern => pattern.test(l))
      );
      
      if (remainingLines.length > 0) {
        achievements = [remainingLines.join(' ')];
      } else {
        achievements = ['工作职责未详细说明'];
      }
    }
    
    experiences.push({
      ...currentExperience as ExperienceItem,
      company: currentExperience.company || '未知公司',
      position: currentExperience.position || '未知职位',
      achievements: achievements
    });
    
    console.log(`添加最后一条工作经验: ${currentExperience.company} - ${currentExperience.position}`);
  }
  
  return experiences;
}

// 辅助函数：从文本中提取日期范围
function extractDateRange(text: string, experience: Partial<ExperienceItem>) {
  // 处理常见日期格式
  
  // 尝试提取"YYYY-MM - YYYY-MM"或"YYYY.MM - YYYY.MM"格式
  const standardFormat = /(\d{4})[.\-\/]?(\d{1,2})[.\-\/]?(?:\d{1,2})?\s*[-–—~至]\s*(\d{4}|至今|现在|目前|present|current|now)[.\-\/]?(\d{1,2})?/i;
  let match = standardFormat.exec(text);
  
  if (match) {
    const startYear = match[1];
    const startMonth = match[2];
    let endYear = match[3];
    let endMonth = match[4] || '';
    
    const isCurrent = /至今|现在|目前|present|current|now/i.test(endYear);
    
    experience.startDate = `${startYear}.${startMonth}`;
    
    if (isCurrent) {
      experience.endDate = '至今';
      experience.isCurrentPosition = true;
    } else {
      experience.endDate = endMonth ? `${endYear}.${endMonth}` : endYear;
      experience.isCurrentPosition = false;
    }
    
    return;
  }
  
  // 处理中文日期格式
  const chineseFormat = /(20\d{2})年(\d{1,2})月\s*[-–—~至]\s*(20\d{2})年(\d{1,2})月|至今|现在|目前/;
  match = chineseFormat.exec(text);
  
  if (match) {
    const startYear = match[1];
    const startMonth = match[2];
    let endYear = match[3];
    let endMonth = match[4] || '';
    
    const isCurrent = !endYear || /至今|现在|目前/.test(endYear);
    
    experience.startDate = `${startYear}.${startMonth}`;
    
    if (isCurrent) {
      experience.endDate = '至今';
      experience.isCurrentPosition = true;
    } else {
      experience.endDate = `${endYear}.${endMonth}`;
      experience.isCurrentPosition = false;
    }
    
    return;
  }
  
  // 处理简单年份格式 "YYYY - YYYY" 或 "YYYY - Present"
  const yearFormat = /(20\d{2})\s*[-–—~至]\s*(20\d{2}|至今|现在|目前|Present|Current|Now)/i;
  match = yearFormat.exec(text);
  
  if (match) {
    const startYear = match[1];
    let endYear = match[2];
    
    const isCurrent = /至今|现在|目前|present|current|now/i.test(endYear);
    
    experience.startDate = startYear;
    
    if (isCurrent) {
      experience.endDate = '至今';
      experience.isCurrentPosition = true;
    } else {
      experience.endDate = endYear;
      experience.isCurrentPosition = false;
    }
    
    return;
  }
  
  // 如果所有匹配都失败，尝试从文本中提取年份
  const years = text.match(/(19|20)\d{2}/g);
  if (years && years.length >= 2) {
    experience.startDate = years[0];
    experience.endDate = years[1];
    experience.isCurrentPosition = false;
  } else if (years && years.length === 1) {
    // 只有一个年份，假设是开始日期
    experience.startDate = years[0];
    experience.endDate = '至今';
    experience.isCurrentPosition = true;
  }
  
  // 检查是否包含"至今"或"Present"等当前职位的指示
  if (experience.endDate && /至今|现在|目前|present|current|now/i.test(text)) {
    experience.isCurrentPosition = true;
    experience.endDate = '至今';
  }
}

/**
 * 提取教育经历
 */
function extractEducation(lines: string[], sectionMap?: Record<string, number[]>): EducationItem[] {
  console.log("提取教育经历");
  
  // 教育部分的多种可能标题
  const educationHeaders = [
    'education', 'academic background', 'educational background', 'academic history',
    '教育', '教育背景', '学历', '学历背景', '教育经历'
  ];
  
  // 可能的下一节标题
  const nextSectionHeaders = [
    'skills', 'experience', 'projects', 'certifications', 'languages', 'interests', 'awards',
    '技能', '经验', '项目', '证书', '语言', '兴趣', '奖项'
  ];
  
  // 找到教育部分的开始
  let educationStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationHeaders.some(header => line.includes(header))) {
      educationStartIndex = i + 1;  // 从标题的下一行开始
      break;
    }
  }
  
  // 如果找不到教育部分
  if (educationStartIndex === -1) {
    // 尝试查找大学或学位关键词
    const educationKeywords = ['university', 'college', 'bachelor', 'master', 'phd', 'degree', 'bs', 'ba', 'mba', 'msc'];
    
    for (let i = Math.floor(lines.length / 2); i < lines.length; i++) {
      if (educationKeywords.some(keyword => lines[i].toLowerCase().includes(keyword))) {
        educationStartIndex = i;
        break;
      }
    }
  }
  
  // 如果仍然找不到，返回空数组
  if (educationStartIndex === -1) {
    return [];
  }
  
  // 找到教育部分的结束位置
  let educationEndIndex = lines.length;
  
  for (let i = educationStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (nextSectionHeaders.some(header => 
      line.includes(header) && 
      (line.startsWith(header) || new RegExp(`^\\s*${header}\\s*[:\\.]`, 'i').test(line))
    )) {
      educationEndIndex = i;
      break;
    }
  }
  
  // 提取教育块
  const educationLines = lines.slice(educationStartIndex, educationEndIndex);
  
  // 解析教育块
  return parseEducationBlocks(educationLines);
}

/**
 * 解析教育块成为结构化数据
 */
function parseEducationBlocks(lines: string[]) {
  const items: EducationItem[] = [];
  let currentItem: EducationItem | null = null;
  let currentAchievements: string[] = [];
  
  const universityPattern = /(university|college|institute|school) of ([A-Za-z\s]+)|([A-Za-z\s]+) (university|college|institute|school)/i;
  const degreePattern = /(Bachelor|Master|Ph\.D|MBA|B\.S\.|B\.A\.|M\.S\.|M\.A\.|M\.Eng|Diploma) (?:of|in)? ([A-Za-z\s]+)/i;
  const datePattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Present|Current|\d{4})[\s\d,-]+)/i;
  const gpaPattern = /GPA[:\s]*([\d.]+)(?:\/[\d.]+)?/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.length === 0) {
      continue; // 跳过空行
    }
    
    // 检查是否为学校名称
    const universityMatch = universityPattern.exec(line);
    
    if (universityMatch || line.length > 5 && line.length < 60 && /[A-Z]/.test(line[0])) {
      // 如果已有一个教育项，保存它
      if (currentItem) {
        currentItem.achievements = currentAchievements;
        items.push(currentItem);
        currentAchievements = [];
      }
      
      // 创建新的教育项
      currentItem = {
        institution: universityMatch ? 
          (universityMatch[2] ? `${universityMatch[1]} of ${universityMatch[2]}` : `${universityMatch[3]} ${universityMatch[4]}`) : 
          line,
        degree: '',
        field: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
        achievements: []
      };
      
      // 检查下一行是否包含学位信息
      if (i + 1 < lines.length) {
        const nextLine = lines[i+1].trim();
        const degreeMatch = degreePattern.exec(nextLine);
        
        if (degreeMatch) {
          currentItem.degree = degreeMatch[1];
          currentItem.field = degreeMatch[2];
          
          // 检查GPA
          const gpaMatch = gpaPattern.exec(nextLine);
          if (gpaMatch) {
            currentItem.gpa = gpaMatch[1];
          }
          
          // 检查日期
          const dateMatch = datePattern.exec(nextLine);
          if (dateMatch) {
            const datePart = dateMatch[1];
            if (datePart.includes(' - ')) {
              const [start, end] = datePart.split(' - ');
              currentItem.startDate = start.trim();
              currentItem.endDate = end.trim();
            } else if (datePart.includes('-')) {
              const [start, end] = datePart.split('-');
              currentItem.startDate = start.trim();
              currentItem.endDate = end.trim();
            } else {
              currentItem.endDate = datePart.trim();
            }
          }
          
          i++; // 跳过已处理的下一行
        }
      }
    } 
    // 检查是否为成就描述
    else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      if (currentItem) {
        const achievement = line.replace(/^[•\-\*]\s*/, '').trim();
        if (achievement.length > 5) {
          currentAchievements.push(achievement);
        }
      }
    }
    // 检查是否为GPA信息
    else if (!currentItem?.gpa && gpaPattern.test(line)) {
      if (currentItem) {
        const gpaMatch = gpaPattern.exec(line);
        if (gpaMatch) {
          currentItem.gpa = gpaMatch[1];
        }
      }
    }
    // 如果是普通文本行且存在当前项目
    else if (currentItem) {
      // 检查是否包含日期
      const dateMatch = datePattern.exec(line);
      if (dateMatch && (!currentItem.startDate || !currentItem.endDate)) {
        const datePart = dateMatch[1];
        if (datePart.includes(' - ')) {
          const [start, end] = datePart.split(' - ');
          currentItem.startDate = start.trim();
          currentItem.endDate = end.trim();
        } else if (datePart.includes('-')) {
          const [start, end] = datePart.split('-');
          currentItem.startDate = start.trim();
          currentItem.endDate = end.trim();
        } else {
          currentItem.endDate = datePart.trim();
        }
      }
      // 检查是否包含学位信息
      else if (!currentItem.degree) {
        const degreeMatch = degreePattern.exec(line);
        if (degreeMatch) {
          currentItem.degree = degreeMatch[1];
          currentItem.field = degreeMatch[2];
        }
      }
      // 否则可能是成就
      else if (line.length > 15) {
        currentAchievements.push(line);
      }
    }
  }
  
  // 不要忘记最后一个项目
  if (currentItem) {
    currentItem.achievements = currentAchievements;
    items.push(currentItem);
  }
  
  return items;
}

/**
 * 提取技能
 */
function extractSkills(lines: string[], fullText: string, sectionMap?: Record<string, number[]>): SkillItem[] {
  console.log("提取技能");
  
  // 查找技能部分
  let skillsStartIndex = -1;
  let skillsEndIndex = lines.length;
  
  if (sectionMap && sectionMap['skills'] && sectionMap['skills'].length > 0) {
    skillsStartIndex = sectionMap['skills'][0];
    
    // 找到下一个部分作为结束点
    for (const [section, indices] of Object.entries(sectionMap)) {
      if (section !== 'skills' && indices[0] > skillsStartIndex) {
        skillsEndIndex = Math.min(skillsEndIndex, indices[0]);
      }
    }
  } else {
    // 如果没有映射，使用关键词查找
    const skillsHeaders = [
      /^skills/i,
      /^technical\s*skills/i,
      /^core\s*competencies/i,
      /^技能/,
      /^专业技能/
    ];
    
    for (let i = 0; i < lines.length; i++) {
      if (skillsHeaders.some(pattern => pattern.test(lines[i])) && lines[i].length < 40) {
        skillsStartIndex = i;
        break;
      }
    }
    
    // 如果找到了技能部分，寻找下一个章节标题作为结束点
    if (skillsStartIndex >= 0) {
      const nextSectionPatterns = [
        /education/i,
        /experience/i,
        /projects/i,
        /certifications/i,
        /languages/i,
        /教育/,
        /经验/,
        /项目/,
        /证书/,
        /语言/
      ];
      
      for (let i = skillsStartIndex + 1; i < lines.length; i++) {
        if (nextSectionPatterns.some(pattern => pattern.test(lines[i])) && lines[i].length < 40) {
          skillsEndIndex = i;
          break;
        }
      }
    }
  }
  
  if (skillsStartIndex < 0) {
    console.log("未找到技能部分");
    // 尝试从整个文本中提取一些常见技能
    return extractCommonSkills(fullText);
  }
  
  console.log(`技能部分从行 ${skillsStartIndex} 到 ${skillsEndIndex}`);
  
  // 提取技能部分的文本
  const skillsLines = lines.slice(skillsStartIndex + 1, skillsEndIndex);
  const skillsText = skillsLines.join(' ');
  
  // 从技能部分提取技能词
  return extractSkillsFromText(skillsText);
}

/**
 * 从文本中提取常见技能
 */
function extractCommonSkills(text: string): SkillItem[] {
  console.log("尝试从全文提取常见技能");
  
  // 技术技能
  const technicalSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Next.js', 'Nest.js',
    'HTML', 'CSS', 'SASS', 'LESS', 'Java', 'Python', 'C++', 'C#', '.NET', 'SQL', 'NoSQL',
    'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git',
    'REST API', 'GraphQL', 'Redux', 'Webpack', 'Jest', 'Cypress', 'CI/CD', 'TDD', 'Agile', 'Scrum',
    'DevOps', 'Machine Learning', 'Big Data', 'Data Science', 'Blockchain', 'AI', 'NLP', 'Cloud Computing',
    'iOS', 'Android', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Xamarin'
  ];
  
  // 软技能
  const softSkills = [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
    'Time Management', 'Adaptability', 'Creativity', 'Emotional Intelligence', 'Conflict Resolution',
    '沟通', '领导力', '团队合作', '问题解决', '批判性思维', '时间管理', '适应性', '创造力'
  ];
  
  const skills: SkillItem[] = [];
  
  // 检查文本中是否包含这些技能
  for (const skill of technicalSkills) {
    try {
      // 处理特殊技能名称，如C++，需要转义+号
      const escapedSkill = skill
        .replace(/\./g, '\\.')  // 转义点号
        .replace(/\+/g, '\\+')  // 转义加号
        .replace(/\*/g, '\\*')  // 转义星号
        .replace(/\?/g, '\\?')  // 转义问号
        .replace(/\(/g, '\\(')  // 转义左括号
        .replace(/\)/g, '\\)'); // 转义右括号
      
      // 使用单词边界确保匹配完整单词
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(text)) {
        skills.push({
          name: skill,
          category: 'technical',
          level: 3  // 默认中等水平
        });
      }
    } catch (regexError) {
      console.warn(`创建正则表达式时出错，跳过技能 "${skill}":`, regexError);
      // 使用简单的indexOf作为备用方案
      if (text.toLowerCase().indexOf(skill.toLowerCase()) !== -1) {
        skills.push({
          name: skill,
          category: 'technical',
          level: 3  // 默认中等水平
        });
      }
    }
  }
  
  for (const skill of softSkills) {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(text)) {
      skills.push({
        name: skill,
        category: 'soft',
        level: 3
      });
    }
  }
  
  console.log(`从全文提取到 ${skills.length} 个技能`);
  return skills;
}

/**
 * 从技能文本中提取结构化技能
 */
function extractSkillsFromText(skillsText: string): SkillItem[] {
  console.log("从技能文本中提取技能");
  
  const skills: SkillItem[] = [];
  
  // 尝试识别技能类别
  const technicalCategory = /technical|programming|development|software|硬技能|编程|开发/i;
  const softCategory = /soft|personal|interpersonal|soft skills|软技能|个人/i;
  const languageCategory = /language|languages|语言/i;
  const toolCategory = /tools|platforms|software|工具|平台/i;
  
  // 首先尝试提取明确的技能列表
  const skillItems = skillsText
    .replace(/,/g, '•')
    .replace(/\//g, '•')
    .replace(/\|/g, '•')
    .replace(/•+/g, '•')
    .split('•')
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 40);
  
  // 为每个提取的技能确定类别
  for (const skill of skillItems) {
    // 如果是常见的编程语言或技术
    if (/JavaScript|TypeScript|React|Angular|Vue|Node\.js|HTML|CSS|Python|Java|C\+\+|SQL|Git/i.test(skill)) {
      skills.push({
        name: skill,
        category: 'technical',
        level: 3
      });
    }
    // 如果是软技能
    else if (/Communication|Leadership|Teamwork|Problem Solving|沟通|领导力|团队/i.test(skill)) {
      skills.push({
        name: skill,
        category: 'soft',
        level: 3
      });
    }
    // 如果是语言技能
    else if (/English|Chinese|Spanish|French|German|Japanese|英语|中文|英文|法语|德语|日语/i.test(skill)) {
      skills.push({
        name: skill,
        category: 'language',
        level: 3
      });
    }
    // 如果是工具或平台
    else if (/Windows|Mac|Linux|Office|Photoshop|Illustrator|AutoCAD|JIRA|Slack/i.test(skill)) {
      skills.push({
        name: skill,
        category: 'tool',
        level: 3
      });
    }
    // 其他技能
    else if (skill.length > 2) {
      skills.push({
        name: skill,
        category: 'other',
        level: 3
      });
    }
  }
  
  // 如果仍然没有提取到技能，尝试使用通用技能列表
  if (skills.length === 0) {
    return extractCommonSkills(skillsText);
  }
  
  console.log(`从技能文本中提取到 ${skills.length} 个技能`);
  return skills;
}

/**
 * 提取项目经历
 */
function extractProjects(lines: string[], sectionMap?: Record<string, number[]>): ProjectItem[] {
  // 项目部分简化实现
  return [];
}

/**
 * 提取证书
 */
function extractCertifications(lines: string[], sectionMap?: Record<string, number[]>): CertificationItem[] {
  // 证书部分简化实现
  return [];
}

/**
 * 提取语言能力
 */
function extractLanguages(lines: string[], sectionMap?: Record<string, number[]>): LanguageItem[] {
  console.log("提取语言能力");
  
  // 查找语言部分
  let languageStartIndex = -1;
  let languageEndIndex = lines.length;
  
  if (sectionMap && sectionMap['languages'] && sectionMap['languages'].length > 0) {
    languageStartIndex = sectionMap['languages'][0];
    
    // 找出下一个部分的起始行作为结束点
    for (const [section, indices] of Object.entries(sectionMap)) {
      if (section !== 'languages' && indices[0] > languageStartIndex) {
        languageEndIndex = Math.min(languageEndIndex, indices[0]);
      }
    }
  } else {
    // 如果没有明确的语言部分，尝试查找包含语言关键词的行
    for (let i = 0; i < lines.length; i++) {
      if (/languages|语言能力|language skills/i.test(lines[i]) && lines[i].length < 40) {
        languageStartIndex = i;
        break;
      }
    }
  }
  
  if (languageStartIndex < 0) {
    return []; // 没有找到语言部分
  }
  
  // 提取语言部分的文本并解析
  const languageLines = lines.slice(languageStartIndex + 1, languageEndIndex);
  const languages: LanguageItem[] = [];
  
  // 常见的语言水平表达
  const proficiencyKeywords: Record<string, string> = {
    'native': 'Native',
    'mother tongue': 'Native',
    'fluent': 'Fluent',
    'proficient': 'Proficient',
    'advanced': 'Advanced',
    'intermediate': 'Intermediate',
    'basic': 'Basic',
    'beginner': 'Basic',
    '母语': 'Native',
    '精通': 'Fluent',
    '熟练': 'Proficient',
    '中级': 'Intermediate',
    '初级': 'Basic'
  };
  
  for (const line of languageLines) {
    if (line.length < 5 || line.length > 100) continue; // 跳过过短或过长的行
    
    // 尝试匹配语言和水平
    let languageName = '';
    let proficiency = 'Intermediate'; // 默认水平
    
    // 匹配常见语言名称
    const commonLanguages = ['English', 'Chinese', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 
                           '英语', '中文', '英文', '法语', '德语', '日语', '韩语', '俄语', '西班牙语'];
    
    for (const lang of commonLanguages) {
      if (line.includes(lang)) {
        languageName = lang;
        break;
      }
    }
    
    // 如果找到了语言名称，尝试提取水平
    if (languageName) {
      for (const [keyword, level] of Object.entries(proficiencyKeywords)) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          proficiency = level;
          break;
        }
      }
      
      languages.push({ name: languageName, proficiency });
    }
  }
  
  return languages;
}

/**
 * 从文件名创建基本的简历结构
 * 当解析失败时提供一个基本的框架
 */
function createBasicResumeFromFileName(fileName: string) {
  const name = fileName.replace(/\.(pdf|docx?)$/i, '').trim();
  
  return {
    contactInfo: {
      name: name || '简历所有者',
      title: '',
      email: '',
      phone: '',
      location: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: []
  };
}

/**
 * 提取电子邮件地址的强化函数
 */
function extractEmail(text: string): string {
  // 多种邮箱格式的正则表达式
  const emailRegexes = [
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,  // 标准格式
    /([a-zA-Z0-9._-]+\s?[@＠]\s?[a-zA-Z0-9._-]+\s?[.．]\s?[a-zA-Z0-9_-]+)/gi,  // 带空格或全角符号
    /([a-zA-Z0-9._-]+\s?\(at\)\s?[a-zA-Z0-9._-]+\s?[.．]\s?[a-zA-Z0-9_-]+)/gi  // (at)格式
  ];
  
  // 尝试所有正则表达式
  for (const regex of emailRegexes) {
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      // 清理匹配结果
      let email = matches[0].trim()
        .replace(/\s+/g, '')  // 移除空格
        .replace('(at)', '@')  // 替换(at)
        .replace('＠', '@')    // 替换全角@
        .replace('．', '.');   // 替换全角点
      
      // 验证提取的邮箱是否有效
      if (email.includes('@') && email.includes('.')) {
        return email;
      }
    }
  }
  
  return '';
}

/**
 * 提取电话号码的强化函数
 */
function extractPhone(text: string): string {
  // 多种电话号码格式的正则表达式
  const phoneRegexes = [
    /(?:\+?(\d{1,3})[ -.]?)?(\(?\d{3}\)?[ -.]?)?(\d{3}[ -.]?\d{4})/g,  // 国际格式
    /(\d{3}[-.\s]??\d{3}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{3}[-.\s]??\d{4})/g,  // 美式格式
    /(\+?（?\d{1,4}）?[-.\s]?)?(\(?\d{3,4}\)?[-.\s]?)?(\d{3}[-.\s]?\d{4})/g  // 带括号和国际前缀
  ];
  
  // 尝试所有正则表达式
  for (const regex of phoneRegexes) {
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      // 清理匹配结果
      return matches[0].trim();
    }
  }
  
  return '';
}

// 添加新函数：识别简历中的不同部分
function identifySections(lines: string[], fullText: string): Record<string, number[]> {
  const sections: Record<string, number[]> = {};
  
  // 定义各部分的关键词匹配
  const sectionKeywords: Record<string, RegExp[]> = {
    'experience': [
      /^work\s*experience/i, 
      /^professional\s*experience/i, 
      /^employment\s*history/i, 
      /^work\s*history/i,
      /^experience$/i,
      /^工作经验$/,
      /^工作经历$/
    ],
    'education': [
      /^education(\s*|:)/i, 
      /^academic$/i, 
      /^qualification/i,
      /^教育背景$/,
      /^学历$/
    ],
    'skills': [
      /^skills(\s*|:)/i, 
      /^technical\s*skills/i, 
      /^core\s*competencies/i,
      /^competencies/i,
      /^技能$/,
      /^专业技能$/
    ],
    'summary': [
      /^(professional\s*)?summary/i, 
      /^profile/i, 
      /^objective/i, 
      /^about\s*me/i,
      /^个人总结$/,
      /^个人简介$/
    ],
    'projects': [
      /^projects/i, 
      /^project\s*experience/i,
      /^项目经验$/,
      /^项目$/
    ],
    'certifications': [
      /^certifications/i, 
      /^certificates/i, 
      /^credentials/i,
      /^资格证书$/,
      /^证书$/
    ],
    'languages': [
      /^languages/i,
      /^语言能力$/,
      /^语言$/
    ]
  };
  
  // 查找各部分的开始行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 略过太长的行，它们不太可能是标题
    if (line.length > 50) continue;
    
    // 检查该行是否匹配任何部分的关键词
    for (const [section, patterns] of Object.entries(sectionKeywords)) {
      if (patterns.some(pattern => pattern.test(line))) {
        if (!sections[section]) {
          sections[section] = [];
        }
        sections[section].push(i);
        console.log(`找到"${section}"部分, 行号: ${i}, 内容: "${line}"`);
        break;
      }
    }
  }
  
  return sections;
}

// 添加新函数：检查提取数据的质量
function checkResumeDataQuality(resume: Resume): Record<string, boolean> {
  return {
    hasName: !!resume.contactInfo.name,
    hasEmail: !!resume.contactInfo.email,
    hasPhone: !!resume.contactInfo.phone,
    hasSummary: !!resume.summary && resume.summary.length > 20,
    hasExperience: resume.experience.length > 0,
    hasEducation: resume.education.length > 0,
    hasSkills: resume.skills.length > 0
  };
} 