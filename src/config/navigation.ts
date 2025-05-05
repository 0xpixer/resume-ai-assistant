/**
 * 导航配置
 * 使用Next.js原生组件替代国际化导航
 */
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation';
import Link from 'next/link';

// 支持的语言列表，目前只使用一种语言
export const locales = ['zh-CN'];
export const defaultLocale = 'zh-CN';

// 导出Next.js原生导航API
export { Link };

// 路由重定向包装函数
export function redirect(path: string) {
  // Next.js不支持服务器组件中的编程式导航，
  // 这将在客户端组件中引发错误
  // 对于服务器组件，应该使用Next.js的redirect函数
  return { destination: path, permanent: false };
}

// 导出路径名钩子
export function usePathname() {
  return useNextPathname();
}

// 导出路由钩子
export function useRouter() {
  return useNextRouter();
} 