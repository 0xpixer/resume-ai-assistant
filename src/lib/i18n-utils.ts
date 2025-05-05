/**
 * 简单的文本工具
 * 仅返回默认英文文本，不处理国际化
 */

/**
 * 简单的翻译函数，仅返回默认文本
 * 为将来可能的国际化支持预留接口
 * @param key 字符串键名(未使用)
 * @param defaultText 默认文本
 * @returns 始终返回默认文本
 */
export function t(_key: string, defaultText: string): string {
  return defaultText;
} 