'use client';

import React from 'react';
import { t } from './i18n-utils';

/**
 * 模拟next-intl的useTranslations钩子
 * @param namespace 命名空间(可选)，仅用于保持与原来API的兼容性
 * @returns 返回翻译函数t
 */
export function useTranslations(namespace?: string) {
  // 返回一个函数，它接受一个键并返回对应的翻译
  return function(key: string, params?: Record<string, any>): string {
    // 如果提供了命名空间，使用命名空间作为前缀
    const fullKey = namespace ? `${namespace}.${key}` : key;
    // 返回默认文本 (英文)
    return t(fullKey, key);
  };
}

/**
 * 模拟next-intl的客户端提供者
 * 仅作为无操作组件，让迁移更顺畅
 */
export function NextIntlClientProvider({ children, ...props }: { children: React.ReactNode, [key: string]: any }) {
  return <>{children}</>;
}

/**
 * 模拟createSharedPathnamesNavigation，简单返回Next.js的原生函数
 */
export function createSharedPathnamesNavigation() {
  return {
    Link: React.Fragment,
    redirect: () => {},
    usePathname: () => '',
    useRouter: () => ({ push: () => {}, replace: () => {} })
  };
} 