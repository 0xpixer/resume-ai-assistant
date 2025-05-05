import { NextResponse } from 'next/server';

// 这个文件存在只是为了确保Next.js路由系统能够正确识别/resume/create路径
// 当用户直接访问/resume/create时，依然会使用page.tsx进行渲染

export async function GET() {
  // 正常情况下不会走到这个处理函数，因为page.tsx会优先处理
  return NextResponse.next();
} 