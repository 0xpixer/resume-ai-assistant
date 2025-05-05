#!/bin/bash

# 移除next-intl依赖的脚本
# 此脚本将替换所有next-intl导入为我们的兼容层

echo "开始移除next-intl依赖..."

# 替换所有next-intl导入
echo "替换所有next-intl导入..."
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/from '\''next-intl'\''/from '\''@\/lib\/next-intl-shim'\''/g'

# 替换所有next-intl/navigation导入
echo "替换所有next-intl/navigation导入..."
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/from '\''next-intl\/navigation'\''/from '\''@\/config\/navigation'\''/g'

# 替换所有next-intl/server导入
echo "替换所有next-intl/server导入..."
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/from '\''next-intl\/server'\''/from '\''@\/lib\/next-intl-server-shim'\''/g'

echo "完成！"
echo "请检查项目是否正常运行，可能需要手动修复一些特殊情况。" 