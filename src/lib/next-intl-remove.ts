/**
 * next-intl移除工具
 * 
 * 此文件不会在项目中使用，仅作为参考
 * 执行以下步骤来移除next-intl依赖:
 * 
 * 1. 替换所有import语句:
 *    - 从: import { useTranslations } from 'next-intl';
 *    - 到: import { useTranslations } from '@/lib/next-intl-shim';
 * 
 * 2. 替换所有导航导入:
 *    - 从: import ... from 'next-intl/navigation';
 *    - 到: import ... from '@/config/navigation';
 * 
 * 3. 移除所有middleware.ts文件中的next-intl导入
 * 
 * 4. 更新next.config.js移除国际化配置
 * 
 * 批量替换命令参考:
 * 
 * // 替换所有next-intl导入
 * find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/from '\''next-intl'\''/from '\''@\/lib\/next-intl-shim'\''/g'
 * 
 * // 替换所有next-intl/navigation导入
 * find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/from '\''next-intl\/navigation'\''/from '\''@\/config\/navigation'\''/g'
 */

// 这个文件不包含任何代码，只是作为迁移参考 