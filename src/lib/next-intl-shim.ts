/**
 * next-intl替代模块，重定向所有导入
 * 这将帮助我们在不修改大量组件的情况下过渡到无国际化版本
 */

// 重新导出所有兼容性函数
export * from './next-intl-compat';

// 默认导出
export { useTranslations as default } from './next-intl-compat'; 