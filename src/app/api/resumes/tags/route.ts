import { NextRequest, NextResponse } from 'next/server';
import { ResumeWithMetadata } from '@/types/resume';

// 声明全局变量类型
declare global {
  var resumes: ResumeWithMetadata[];
}

// 获取所有简历数据
function getResumes(): ResumeWithMetadata[] {
  try {
    if (typeof global.resumes === 'undefined') {
      global.resumes = [];
    }
    return global.resumes;
  } catch (error) {
    console.error('Error getting resumes:', error);
    return [];
  }
}

// 保存所有简历数据
function saveResumes(resumes: ResumeWithMetadata[]): void {
  try {
    global.resumes = resumes;
  } catch (error) {
    console.error('Error saving resumes:', error);
  }
}

// 更新简历标签
function updateResumeTags(id: string, tags: string[]): boolean {
  const resumes = getResumes();
  const index = resumes.findIndex(r => r.id === id);
  
  if (index === -1) {
    return false;
  }
  
  resumes[index].tags = tags;
  saveResumes(resumes);
  return true;
}

/**
 * API route to update tags for a resume
 * In a real application, this would connect to a database
 * For this demo, we'll just return a success response
 */

/**
 * POST: 更新简历标签
 */
export async function POST(req: NextRequest) {
  try {
    const { resumeId, tags } = await req.json();
    
    // 验证输入
    if (!resumeId) {
      return NextResponse.json(
        { error: '简历ID不能为空' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: '标签必须是数组' },
        { status: 400 }
      );
    }
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 更新标签
    const result = updateResumeTags(resumeId, tags);
    
    if (!result) {
      return NextResponse.json(
        { error: '找不到指定的简历' },
        { status: 404 }
      );
    }
    
    console.log(`Updated tags for resume ${resumeId}:`, tags);
    
    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    return NextResponse.json(
      { error: '更新标签失败' },
      { status: 500 }
    );
  }
}

/**
 * GET: 获取标签建议
 */
export async function GET() {
  try {
    // 返回标签建议列表
    const tagSuggestions = [
      'technical', 'software', 'engineering', 'development',
      'marketing', 'sales', 'management', 'leadership',
      'design', 'creative', 'content', 'writing',
      'data', 'analytics', 'research', 'science',
      'finance', 'accounting', 'legal', 'healthcare',
      'education', 'teaching', 'customer service', 'support',
      'project management', 'product management', 'operations',
      'human resources', 'recruiting', 'administrative',
      'entry level', 'mid level', 'senior level', 'executive'
    ];
    
    return NextResponse.json({
      success: true,
      tags: tagSuggestions,
    });
  } catch (error) {
    console.error('Error fetching tag suggestions:', error);
    return NextResponse.json(
      { error: '获取标签建议失败' },
      { status: 500 }
    );
  }
} 