import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ContentGenerationRequest, ContentGenerationResponse } from '@/types/resume';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { type, data, targetJob, jobDescription, tone, length } = await request.json() as ContentGenerationRequest;
    
    if (!type || !data) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    let prompt = '';
    let generatedContent = '';
    
    // 根据指定的语气调整提示词
    const toneInstruction = tone
      ? tone === 'professional' ? '使用专业、正式的语气' 
        : tone === 'conversational' ? '使用自然、对话式的语气' 
        : '使用积极、热情的语气'
      : '使用专业的语气';
    
    // 根据指定的长度调整提示词
    const lengthInstruction = length
      ? length === 'concise' ? '简洁精炼，约50-75字' 
        : length === 'detailed' ? '详细全面，约150-200字' 
        : '标准长度，约100-150字'
      : '标准长度，约100-150字';
    
    switch (type) {
      case 'summary':
        prompt = `为一位${data.title || '专业人士'}创建一段引人注目的职业简介。
        个人背景：${data.background || '有相关工作经验'}。
        目标职位：${targetJob || '相关职位'}。
        职位描述：${jobDescription || '无详细描述'}。
        ${toneInstruction}，${lengthInstruction}。
        请根据职位描述的要求，突出与职位匹配的核心优势。`;
        break;
        
      case 'experience':
        prompt = `优化以下工作经历描述，使其更具吸引力和专业性：
        职位：${data.position || '职位未知'}
        公司：${data.company || '公司未知'}
        时间段：${data.startDate || ''}至${data.endDate || ''}
        原始描述：${Array.isArray(data.achievements) ? data.achievements.join('\n') : data.achievements || ''}
        目标职位：${targetJob || '相关职位'}
        职位描述：${jobDescription || '无详细描述'}
        ${toneInstruction}，${lengthInstruction}。
        请使用STAR法则(情境、任务、行动、结果)，突出与目标职位相关的成就和量化结果，参考职位描述中强调的技能和要求。`;
        break;
        
      case 'achievement':
        prompt = `优化以下工作成就描述，使其更具说服力和专业性：
        成就描述：${data.achievement || ''}
        目标职位：${targetJob || '相关职位'}
        职位描述：${jobDescription || '无详细描述'}
        ${toneInstruction}，${lengthInstruction}。
        请使用STAR法则(情境、任务、行动、结果)，加入量化的指标和成果，使用有力的行动动词开头。`;
        break;
        
      case 'analysis':
        prompt = `分析以下简历内容的优缺点，并提供具体改进建议：
        摘要：${data.summary || ''}
        工作经验：${JSON.stringify(data.experience) || ''}
        技能：${JSON.stringify(data.skills) || ''}
        目标职位：${targetJob || ''}
        
        请从以下几个方面分析：
        1. 拼写和语法
        2. 行动动词的使用
        3. 量化指标的呈现
        4. 关键词匹配度
        5. 时态表达是否一致
        
        对于每个方面，给出具体的改进建议和例子。`;
        break;
        
      case 'skills':
        prompt = `根据以下信息，推荐相关的专业技能：
        当前技能：${Array.isArray(data.currentSkills) ? data.currentSkills.join(', ') : data.currentSkills || '未提供'}
        目标职位：${targetJob || '相关职位'}
        职业背景：${data.background || '有相关工作经验'}
        职位描述：${jobDescription || '无详细描述'}
        请分析职位描述，列出8-12个最匹配该职位的相关技能，包括硬技能和软技能，按与职位需求的匹配度排序。`;
        break;
        
      default:
        return NextResponse.json(
          { error: '不支持的生成类型' },
          { status: 400 }
        );
    }
    
    // 模拟 API 调用以避免真实 API 调用
    // 实际实现中，应该替换为 OpenAI API 调用
    /*
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "你是一位专业的职业顾问和简历撰写专家，擅长创建吸引招聘者的简历内容。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    generatedContent = response.choices[0].message.content || '';
    */
    
    // 模拟响应
    const response: ContentGenerationResponse = {
      content: '',
      alternatives: [],
      keywordsUsed: []
    };
    
    if (type === 'summary') {
      response.content = `作为一名资深软件工程师，拥有5年以上Web开发经验，精通前端框架与后端技术。擅长解决复杂技术问题，提升产品性能与用户体验。曾带领团队成功交付多个关键项目，减少30%开发时间。追求编写高质量、可维护的代码，热衷学习新技术，期待在创新科技公司发挥所长。`;
      response.alternatives = [
        `具有5年Web开发经验的全栈工程师，精通React、Node.js和云服务。善于优化系统架构，提高应用性能，解决技术难题。主导过多个大型项目，注重代码质量和团队协作。寻求应用先进技术解决实际问题的挑战性职位。`,
        `富有创新精神的软件工程师，拥有5年开发经验和计算机科学学位。专注于构建高性能、可扩展的应用程序，擅长前端和后端技术。曾成功优化核心系统，提升40%的处理效率，积极拥抱新技术并解决复杂问题。`
      ];
      response.keywordsUsed = ['软件工程师', 'Web开发', '前端框架', '后端技术', '产品性能', '用户体验', '团队领导', '高质量代码'];
      response.analysis = {
        actionVerbs: 5,
        metrics: 1,
        bullets: 0,
        readability: 85
      };
    } else if (type === 'experience') {
      response.content = `高级前端工程师 | ABC科技有限公司 | 2018-2022\n\n负责公司核心产品的前端架构设计与实现，主导了从传统jQuery到React的技术迁移。优化了应用性能，使页面加载时间减少40%，用户留存率提升20%。设计并实现了组件库，提高了团队开发效率30%，被同行评为公司年度最佳技术贡献。`;
      response.alternatives = [
        `高级前端开发工程师 - ABC科技有限公司 (2018-2022)\n主导核心产品前端技术栈升级，成功将大型应用从jQuery迁移至React框架。实施了代码分割和懒加载策略，将首屏加载时间从3秒减少到1.8秒，提升用户满意度35%。创建了可复用组件系统，缩短新功能开发周期40%，获得公司技术创新奖。`,
        `前端技术负责人 | ABC科技 | 2018-2022\n带领5人团队完成核心产品界面重构，采用React+TypeScript技术栈，实现了组件化和模块化开发。通过优化渲染流程和资源加载策略，使应用性能提升45%。建立了前端自动化测试流程，提高了代码质量，减少了90%的线上bug。`
      ];
      response.keywordsUsed = ['前端架构', 'React', 'jQuery', '性能优化', '组件库', '技术迁移', '用户留存', '开发效率'];
      response.analysis = {
        actionVerbs: 6,
        metrics: 3,
        bullets: 0,
        readability: 90
      };
    } else if (type === 'achievement') {
      response.content = `通过重构数据处理流程并实施缓存策略，将API响应时间从平均2秒减少到300毫秒，提升了系统吞吐量400%，显著改善了用户体验并支持了用户基数从10万增长到50万的业务扩展。`;
      response.alternatives = [
        `领导团队设计并实现了微服务架构转型，将单体应用拆分为15个独立服务，减少了系统宕机时间95%，支持了业务在6个月内扩展到3个新市场，用户数增长了200%。`,
        `优化了电子商务平台的结算流程，通过引入异步处理和批量操作，将高峰期订单处理能力提升了10倍，同时降低了服务器成本25%，促成了季度销售额增长40%。`
      ];
      response.keywordsUsed = ['重构', '数据处理', '缓存策略', 'API响应时间', '系统吞吐量', '用户体验', '业务扩展'];
      response.analysis = {
        actionVerbs: 3,
        metrics: 4,
        bullets: 0,
        readability: 85
      };
    } else if (type === 'analysis') {
      response.content = `您的简历有以下几个方面需要改进：\n\n1. 拼写和语法：总体良好，但注意避免被动语态，如"系统被开发"应改为"开发了系统"。\n\n2. 行动动词使用：仅使用了基础动词如"做"、"负责"，建议使用更有力的词如"实现"、"优化"、"主导"等。\n\n3. 量化指标：缺乏具体数字，建议添加业绩数据，如"提高效率30%"、"减少成本20%"等。\n\n4. 关键词匹配：与目标职位相关的技术关键词较少，建议增加如"React"、"Node.js"、"微服务"等术语。\n\n5. 时态一致性：过去的经历应使用过去时，如"开发"而非"开发中"。`;
    } else if (type === 'skills') {
      response.content = `1. React\n2. TypeScript\n3. JavaScript\n4. Next.js\n5. Node.js\n6. RESTful API设计\n7. GraphQL\n8. 微服务架构\n9. 性能优化\n10. 团队协作\n11. 技术方案设计\n12. 问题解决能力`;
      response.keywordsUsed = ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Node.js', 'RESTful API', 'GraphQL', '微服务'];
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('内容生成错误:', error);
    return NextResponse.json(
      { error: `生成失败: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 