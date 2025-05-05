import { NextResponse } from 'next/server';
import { ParsedResume } from '@/types/resume';

// LinkedIn API相关配置，需要从环境变量获取
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || '';

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

interface LinkedInProfile {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  localizedHeadline?: string;
  vanityName?: string;
  profilePicture?: {
    displayImage?: string;
  };
}

interface LinkedInEmail {
  elements: Array<{
    handle: string;
    handleDecorated: string;
    type: string;
    primary: boolean;
  }>;
}

/**
 * 通过授权码获取LinkedIn访问令牌
 */
async function getLinkedInAccessToken(code: string): Promise<string> {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error(`获取访问令牌失败: ${response.statusText}`);
    }

    const data: LinkedInTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('获取LinkedIn访问令牌失败:', error);
    throw error;
  }
}

/**
 * 获取LinkedIn用户基本信息
 */
async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`获取个人资料失败: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取LinkedIn个人资料失败:', error);
    throw error;
  }
}

/**
 * 获取LinkedIn用户电子邮件
 */
async function getLinkedInEmail(accessToken: string): Promise<string> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`获取电子邮件失败: ${response.statusText}`);
    }

    const data: LinkedInEmail = await response.json();
    const primaryEmail = data.elements.find(email => email.primary)?.handle;
    return primaryEmail || '';
  } catch (error) {
    console.error('获取LinkedIn电子邮件失败:', error);
    return '';
  }
}

/**
 * 将LinkedIn个人资料转换为简历格式
 */
function convertProfileToResume(profile: LinkedInProfile, email: string, profileUrl: string): ParsedResume {
  const name = `${profile.localizedFirstName} ${profile.localizedLastName}`;
  
  return {
    name: name,
    title: profile.localizedHeadline || '',
    email: email,
    phone: '',
    location: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    rawText: '',
    structured: {
      contactInfo: {
        name: name,
        title: profile.localizedHeadline || '',
        email: email,
        phone: '',
        location: '',
        linkedin: profileUrl,
        github: '',
        website: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: []
    }
  };
}

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { code, profileUrl } = body;
    
    // 验证请求参数
    if (!code) {
      return NextResponse.json(
        { error: '缺少LinkedIn授权码' },
        { status: 400 }
      );
    }
    
    if (!profileUrl) {
      return NextResponse.json(
        { error: '缺少LinkedIn个人资料地址' },
        { status: 400 }
      );
    }
    
    console.log(`接收到LinkedIn导入请求，开始处理授权码`);
    
    try {
      // 获取访问令牌
      const accessToken = await getLinkedInAccessToken(code);
      
      // 获取LinkedIn个人资料
      const profile = await getLinkedInProfile(accessToken);
      
      // 获取LinkedIn电子邮件
      const email = await getLinkedInEmail(accessToken);
      
      // 将LinkedIn个人资料转换为简历格式
      const resumeData = convertProfileToResume(profile, email, profileUrl);
      
      console.log('LinkedIn个人资料获取成功');
      
      // 返回处理后的数据
      return NextResponse.json(resumeData);
    } catch (error) {
      console.error('LinkedIn API调用失败:', error);
      
      // 如果API调用失败，返回错误信息
      return NextResponse.json(
        { error: '无法获取LinkedIn个人资料，请重新授权' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('LinkedIn导入错误:', error);
    
    let errorMessage = '导入失败，请重试';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 