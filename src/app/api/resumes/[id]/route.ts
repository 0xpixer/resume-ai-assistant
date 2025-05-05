import { NextRequest, NextResponse } from 'next/server';
import { Resume, ResumeWithMetadata } from '@/types/resume';

// 从API路由获取简历ID
interface Params {
  params: {
    id: string;
  };
}

// 声明全局变量类型
declare global {
  var resumes: ResumeWithMetadata[];
}

// 获取所有简历数据
function getResumes(): ResumeWithMetadata[] {
  // 在服务器端，我们无法直接访问localStorage，所以这里只是一个模拟
  // 在实际应用中，这里应该从数据库中获取数据
  try {
    if (typeof global.resumes === 'undefined') {
      // 从主API路由获取初始数据
      const initialMockResumes = [
        {
          id: '1',
          name: 'Software Engineer Resume',
          contactInfo: {
            name: 'John Doe',
            title: 'Senior Software Engineer',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/johndoe',
            github: 'github.com/johndoe',
            website: 'johndoe.com'
          },
          summary: 'Experienced software engineer with 8+ years of experience',
          experience: [],
          education: [],
          skills: [],
          score: 85,
          matchedJob: 'Senior Software Engineer at Tech Co.',
          match: 76,
          createdAt: '2023-02-15',
          updatedAt: '2023-03-10',
          tags: ['tech', 'software', 'senior']
        },
        {
          id: '2',
          name: 'Marketing Resume',
          contactInfo: {
            name: 'Jane Smith',
            title: 'Marketing Manager',
            email: 'jane@example.com',
            phone: '+1 (555) 987-6543',
            location: 'New York, NY',
            linkedin: 'linkedin.com/in/janesmith',
            github: '',
            website: 'janesmith.com'
          },
          summary: 'Creative marketing professional with experience in digital marketing',
          experience: [],
          education: [],
          skills: [],
          score: 92,
          matchedJob: 'Marketing Operations Manager, Global Business Marketing',
          match: 84,
          createdAt: '2023-01-20',
          updatedAt: '2023-03-07',
          tags: ['marketing', 'digital', 'management']
        },
        {
          id: '3',
          name: 'Data Scientist Resume',
          contactInfo: {
            name: 'David Johnson',
            title: 'Senior Data Scientist',
            email: 'david@example.com',
            phone: '+1 (555) 246-8135',
            location: 'Austin, TX',
            linkedin: 'linkedin.com/in/davidjohnson',
            github: 'github.com/davidj',
            website: ''
          },
          summary: 'Data scientist with expertise in machine learning and statistical analysis',
          experience: [],
          education: [],
          skills: [],
          score: 78,
          matchedJob: '',
          match: 0,
          createdAt: '2023-02-28',
          updatedAt: '2023-02-28',
          tags: ['data', 'analytics', 'machine learning']
        }
      ];
      global.resumes = initialMockResumes;
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

// 获取单个简历
function getResumeById(id: string): ResumeWithMetadata | null {
  const resumes = getResumes();
  return resumes.find(resume => resume.id === id) || null;
}

// 更新简历
function updateResume(id: string, updatedResume: ResumeWithMetadata): ResumeWithMetadata | null {
  const resumes = getResumes();
  const index = resumes.findIndex(r => r.id === id);
  
  if (index === -1) {
    return null;
  }
  
  resumes[index] = updatedResume;
  saveResumes(resumes);
  return updatedResume;
}

// 删除简历
function deleteResume(id: string): boolean {
  const resumes = getResumes();
  const index = resumes.findIndex(r => r.id === id);
  
  if (index === -1) {
    return false;
  }
  
  resumes.splice(index, 1);
  saveResumes(resumes);
  return true;
}

/**
 * GET: 获取单个简历
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    console.log(`Fetching resume with ID: ${id}`);
    
    // 直接从内存中获取简历
    const resume = getResumeById(id);
    
    if (!resume) {
      return NextResponse.json(
        { error: '找不到指定的简历' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: '获取简历失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT: 更新简历
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { name, resume } = await req.json();
    
    // 验证输入
    if (!name || !resume) {
      return NextResponse.json(
        { error: '简历名称和内容不能为空' },
        { status: 400 }
      );
    }
    
    console.log(`Updating resume with ID: ${id}`);
    
    // 获取当前时间作为更新时间
    const now = new Date().toISOString().split('T')[0];
    
    // 创建更新后的简历对象
    const updatedResume: ResumeWithMetadata = {
      id,
      name,
      ...resume,
      updatedAt: now,
      // 保留原有的创建时间和标签
      createdAt: resume.createdAt || now,
      tags: resume.tags || [],
    };
    
    // 更新简历
    const result = updateResume(id, updatedResume);
    
    if (!result) {
      return NextResponse.json(
        { error: '找不到指定的简历' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      resume: result,
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: '更新简历失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 删除简历
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    console.log(`Deleting resume with ID: ${id}`);
    
    // 删除简历
    const result = deleteResume(id);
    
    if (!result) {
      return NextResponse.json(
        { error: '找不到指定的简历' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `已成功删除ID为 ${id} 的简历`,
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: '删除简历失败' },
      { status: 500 }
    );
  }
} 