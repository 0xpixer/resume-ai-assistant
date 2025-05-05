/**
 * next-intl服务器端替代模块
 */

// 创建空的中间件函数，不执行任何国际化逻辑
export function createMiddleware() {
  return function middleware(request: Request) {
    // 简单地返回未修改的请求，无需进行国际化处理
    return NextResponse.next();
  };
}

// NextResponse 模拟对象
const NextResponse = {
  next: () => new Response(null)
};

// 创建国际化请求处理器
export function createI18nServer() {
  return {
    getRequestConfig: () => {
      return { locale: 'zh-CN' };
    },
    getTranslations: () => {
      return Promise.resolve({});
    }
  };
}

// 创建支持后备翻译的配置
export function createTranslator() {
  return {
    translate: (key: string) => key
  };
}

// 导出路径名配置
export const pathnames = {
  index: () => '/',
  about: () => '/about',
  resume: {
    create: () => '/resume/create'
  }
}; 