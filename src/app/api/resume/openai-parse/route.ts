import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from "openai";
import { Resume } from '@/types/resume';
// 更改导入方式，避免初始化时的文件路径问题
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// 初始化OpenAI API客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// 在API初始化时检查API密钥
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY environment variable is not set. OpenAI API will not work properly.');
}

// GET方法，用于验证API是否正常工作
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "OpenAI Resume Parser API is working properly"
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// OPTIONS方法，用于处理CORS预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// POST方法，处理简历解析请求
export async function POST(req: NextRequest) {
  console.log('Resume upload request received');
  
  // 检查内容类型
  const contentType = req.headers.get('content-type');
  if (!contentType || !contentType.includes('multipart/form-data')) {
    console.error('Invalid content type:', contentType);
    return NextResponse.json({ error: 'Request must be in multipart/form-data format' }, { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
  
  try {
    // 从请求中获取文件数据
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('未找到文件');
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }
    
    console.log(`接收到文件: ${file.name}, 大小: ${file.size} 字节, 类型: ${file.type}`);
    
    // 确保是PDF文件
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      console.error('无效的文件类型:', file.type);
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 });
    }
    
    // 读取文件内容
    const fileBuffer = await file.arrayBuffer();
    console.log(`成功读取文件缓冲区，大小: ${fileBuffer.byteLength} 字节`);
    
    try {
      // 使用pdf-parse提取PDF文本
      console.log('正在提取PDF文本...');
      let pdfText = '';
      
      try {
        // 使用pdf-parse提取文本
        const data = await pdfParse(Buffer.from(fileBuffer));
        pdfText = data.text || '';
        console.log(`提取的文本长度: ${pdfText.length} 字符`);
      } catch (pdfError) {
        console.error('PDF文本提取失败:', pdfError);
        
        // 尝试使用UTF-8解码作为备选
        console.log('尝试使用UTF-8解码...');
        const decoder = new TextDecoder('utf-8');
        pdfText = decoder.decode(fileBuffer)
          .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, ''); // 清理非打印字符
        
        if (pdfText.length < 100 || pdfText.startsWith('%PDF')) {
          console.error('无法有效提取PDF内容');
          return NextResponse.json({
            error: '无法提取PDF内容',
            details: '提取的内容无效或太短',
          }, { status: 400 });
        }
      }
      
      if (pdfText.length === 0) {
        console.error('提取的文本为空');
        return NextResponse.json({
          error: '无法从PDF中提取文本',
          details: '可能是扫描件、加密文件或不支持的PDF格式',
        }, { status: 400 });
      }
      
      console.log('文本前200字符预览:', pdfText.substring(0, 200));
      
      // 调用OpenAI API解析简历内容
      console.log('调用OpenAI API解析简历...');
      
      const prompt = `
你是一个专业的简历解析器。请从以下简历文本中提取结构化信息，并以JSON格式返回。
确保提取的数据符合以下结构：

1. contactInfo：包含姓名(name)、职位(title)、电子邮件(email)、电话号码(phone)、地点(location)、网站(website)、LinkedIn(linkedin)和GitHub(github)
2. summary：提取简历摘要或个人陈述
3. experience：工作经验，每项包含公司名称(company)、职位(position)、地点(location)、开始日期(startDate)、结束日期(endDate)、是否当前职位(isCurrentPosition)、成就/职责列表(achievements)
   - 非常重要：每个工作经验项(每家公司)必须有自己独立的成就列表
   - 请确保与公司A相关的成就仅包含在公司A的条目中，不要与其他公司的成就混合
   - 每个achievements数组只能包含与该特定公司相关的成就项
4. education：教育经历，每项包含学校名称(institution)、学位(degree)、专业(field)、地点(location)、开始日期(startDate)、结束日期(endDate)、GPA(gpa)
5. skills：技能列表，每项包含技能名称(name)和类别(category)，类别可以是'technical'、'soft'、'language'、'tool'或'other'
6. certifications：证书，每项包含证书名称(name)、颁发机构(issuer)和日期(date)
7. projects：项目经验，每项包含项目名称(name)、描述(description)、使用的技术(technologies)
8. languages：语言能力，每项包含语言名称(name)和熟练程度(proficiency)

请特别注意工作经验部分：
- 识别每个独立的工作经历(根据公司名称、时间段等)
- 为每个工作经历提供独立的achievements数组
- 确保achievements数组中的内容只与该特定工作相关，而不是与其他工作混合

如果某些信息在简历中不存在，对应字段可以返回空数组或null。尽可能完整地提取所有信息。

以下是要解析的简历文本:
${pdfText.substring(0, 8000)} // 限制文本长度以避免超出API限制

请返回JSON格式的解析结果，并确保每个工作经验项有自己独立的成就列表。
`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125", // 选择合适的模型
        messages: [
          { 
            role: "system", 
            content: "你是一个专业的简历解析助手，能够从简历文本中提取关键信息并以结构化JSON格式返回。请确保输出是有效的JSON格式。" 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // 获取OpenAI返回的内容
      const content = response.choices[0].message.content;
      
      if (!content) {
        console.error('OpenAI API返回空响应');
        return NextResponse.json({
          error: 'AI解析失败',
          details: '无法获取解析结果',
          rawText: pdfText
        }, { status: 500 });
      }
      
      console.log('OpenAI解析成功，处理返回的数据');
      
      try {
        // 解析OpenAI返回的JSON
        const parsedData = JSON.parse(content);
        
        // 处理解析后的结果
        if (parsedData) {
          // 转换联系信息
          const contactInfo = parsedData.contactInfo || {};
          console.log('提取到的联系人信息:', JSON.stringify(contactInfo));
          
          // 转换工作经验 - 确保每个工作经验都有其自己的成就列表
          const experience = (parsedData.experience || []).map((exp: any) => ({
            company: exp.company || '',
            position: exp.position || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            isCurrentPosition: !!exp.isCurrentPosition,
            // 确保每个工作条目的成就是数组，并属于该公司
            achievements: Array.isArray(exp.achievements) ? 
              exp.achievements.filter((a: any) => a && typeof a === 'string') : 
              []
          }));
          
          console.log('提取到的工作经验数:', experience.length);
          
          // 转换教育经历
          const education = (parsedData.education || []).map((edu: any) => ({
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            location: edu.location || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            gpa: edu.gpa || '',
            achievements: Array.isArray(edu.achievements) ? 
              edu.achievements.filter((a: any) => a && typeof a === 'string') : 
              []
          }));
          
          console.log('提取到的教育经历数:', education.length);
          
          // 转换技能
          const skills = (parsedData.skills || []).map((skill: any) => ({
            name: skill.name || '',
            category: skill.category || 'technical',
            level: 3  // 默认熟练度
          }));
          
          console.log('提取到的技能数:', skills.length);
          
          // 转换证书
          const certifications = (parsedData.certifications || []).map((cert: any) => ({
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || ''
          }));
          
          // 转换项目
          const projects = (parsedData.projects || []).map((proj: any) => ({
            name: proj.name || '',
            description: proj.description || '',
            technologies: Array.isArray(proj.technologies) ? proj.technologies : []
          }));
          
          // 转换语言
          const languages = (parsedData.languages || []).map((lang: any) => ({
            name: lang.name || '',
            proficiency: lang.proficiency || ''
          }));
          
          // 返回结构化结果
          const structured: Resume = {
            contactInfo: {
              name: contactInfo.name || '',
              title: contactInfo.title || '',
              email: contactInfo.email || '',
              phone: contactInfo.phone || '',
              location: contactInfo.location || '',
              website: contactInfo.website || '',
              linkedin: contactInfo.linkedin || '',
              github: contactInfo.github || ''
            },
            summary: parsedData.summary || '',
            experience,
            education,
            skills,
            certifications,
            projects,
            languages
          };
          
          // 返回解析结果
          return NextResponse.json({
            structured,
            rawText: pdfText
          });
        }
      } catch (jsonError) {
        console.error('解析OpenAI返回的JSON失败:', jsonError);
        console.log('OpenAI返回的原始内容:', content);
        
        return NextResponse.json({
          error: '解析AI返回数据失败',
          details: '返回的数据不是有效的JSON格式',
          rawText: pdfText
        }, { status: 500 });
      }
      
    } catch (error) {
      console.error('处理PDF文件时出错:', error);
      return NextResponse.json({
        error: '处理PDF文件失败',
        details: error instanceof Error ? error.message : '未知错误',
      }, { status: 500 });
    }
    
  } catch (requestError) {
    console.error('处理请求时出错:', requestError);
    return NextResponse.json({
      error: '处理上传请求失败',
      details: requestError instanceof Error ? requestError.message : '未知错误',
    }, { status: 500 });
  }
} 