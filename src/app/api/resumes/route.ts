import { NextRequest, NextResponse } from 'next/server';
import { Resume, ResumeWithMetadata } from '@/types/resume';

// 初始示例简历数据
const initialMockResumes: ResumeWithMetadata[] = [
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

// 获取所有简历数据
function getResumes(): ResumeWithMetadata[] {
  // 在服务器端，我们无法直接访问localStorage，所以这里只是一个模拟
  // 在实际应用中，这里应该从数据库中获取数据
  try {
    // 由于这是服务器端代码，我们使用全局变量来模拟持久化存储
    if (typeof global.resumes === 'undefined') {
      global.resumes = [...initialMockResumes];
    }
    return global.resumes;
  } catch (error) {
    console.error('Error getting resumes:', error);
    return [...initialMockResumes];
  }
}

// 保存所有简历数据
function saveResumes(resumes: ResumeWithMetadata[]): void {
  // 在服务器端，我们无法直接访问localStorage，所以这里只是一个模拟
  // 在实际应用中，这里应该将数据保存到数据库中
  try {
    global.resumes = resumes;
  } catch (error) {
    console.error('Error saving resumes:', error);
  }
}

// 添加新简历
function addResume(resume: ResumeWithMetadata): ResumeWithMetadata {
  const resumes = getResumes();
  resumes.push(resume);
  saveResumes(resumes);
  return resume;
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
 * GET: 获取所有简历
 */
export async function GET(req: NextRequest) {
  try {
    // 获取所有简历
    const resumes = getResumes();
    
    // 处理标签过滤
    const url = new URL(req.url);
    const tagFilter = url.searchParams.get('tag');
    
    let filteredResumes = [...resumes];
    
    // 如果指定了标签，进行过滤
    if (tagFilter) {
      filteredResumes = filteredResumes.filter(resume => 
        resume.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
      );
    }
    
    // 模拟延迟，使UI感觉更真实
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json({
      success: true,
      resumes: filteredResumes,
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: '获取简历失败' },
      { status: 500 }
    );
  }
}

/**
 * POST: 创建新简历
 */
export async function POST(req: NextRequest) {
  try {
    const { name, resume } = await req.json();
    
    // 验证输入
    if (!name || !resume) {
      return NextResponse.json(
        { error: '简历名称和内容不能为空' },
        { status: 400 }
      );
    }
    
    // 创建新简历
    const newId = Date.now().toString();
    const now = new Date().toISOString().split('T')[0];
    
    const newResume: ResumeWithMetadata = {
      id: newId,
      name,
      ...resume,
      createdAt: now,
      updatedAt: now,
      tags: [],
    };
    
    // 保存新简历
    addResume(newResume);
    
    console.log('Created new resume:', newId);
    
    return NextResponse.json({
      success: true,
      resume: newResume,
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: '创建简历失败' },
      { status: 500 }
    );
  }
} 