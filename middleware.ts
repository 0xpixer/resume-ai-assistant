import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 简化的中间件，移除所有国际化处理
export function middleware(request: NextRequest) {
  // 直接返回未修改的请求
  return NextResponse.next();
}

// 更新匹配规则，确保不拦截任何资源
export const config = {
  // 仅匹配主要页面路由，排除所有静态资源和API
  matcher: [] // 空数组表示不匹配任何路径，暂时禁用中间件
}; 