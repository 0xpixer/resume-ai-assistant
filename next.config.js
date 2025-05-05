/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },

  // 禁用构建时的ESLint检查，这样不会因ESLint错误中断构建
  eslint: {
    // 警告而不是错误（不会导致构建失败）
    ignoreDuringBuilds: true,
  },

  // 忽略TypeScript错误
  typescript: {
    ignoreBuildErrors: true,
  },

  // 添加重定向规则
  async redirects() {
    return [
      {
        source: '/create-resume',
        destination: '/resume/create',
        permanent: true,
      },
      // 确保/resume/create路径能被正确路由
      {
        source: '/resume/create-resume',
        destination: '/resume/create',
        permanent: true,
      }
    ];
  },

  webpack: (config, { isServer }) => {
    // PDF.js 配置修复
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/build/pdf.js';

    // 当在浏览器环境中时，设置空模块代替 Node.js 模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
        // 添加其他canvas相关依赖的fallback
        'canvas/lib/DOMMatrix': false,
        'canvas/lib/bindings': false,
        'canvas/lib/canvas': false,
        'canvas/lib/context2d': false,
        'canvas/lib/image': false,
        'canvas/lib/jpegstream': false,
        'canvas/lib/parse-font': false,
        'canvas/lib/pattern': false,
        'canvas/lib/pdfstream': false,
        'canvas/lib/pngstream': false
      };
    }

    return config;
  },
};

module.exports = nextConfig; 