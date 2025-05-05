/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
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