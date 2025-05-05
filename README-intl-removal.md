# Next-intl 移除指南

本文档提供了从项目中移除 next-intl 国际化依赖的步骤和说明。

## 背景

项目最初使用 next-intl 提供国际化支持，但由于简化需求和解决一些相关问题，我们决定移除这个依赖，同时保留一个兼容层以最小化代码更改。

## 已创建的兼容文件

1. `src/lib/next-intl-compat.tsx` - 客户端兼容层，提供 `useTranslations` 等 API
2. `src/lib/next-intl-shim.ts` - 导入重定向模块
3. `src/lib/next-intl-server-shim.ts` - 服务器端兼容层
4. `src/config/navigation.ts` - 导航 API 兼容层

## 移除步骤

### 1. 使用兼容层替换导入

我们提供了一个脚本 `scripts/remove-intl.sh` 来批量替换所有导入:

```bash
# 使脚本可执行
chmod +x scripts/remove-intl.sh

# 运行脚本
./scripts/remove-intl.sh
```

这个脚本会:
- 将 `from 'next-intl'` 替换为 `from '@/lib/next-intl-shim'`
- 将 `from 'next-intl/navigation'` 替换为 `from '@/config/navigation'`
- 将 `from 'next-intl/server'` 替换为 `from '@/lib/next-intl-server-shim'`

### 2. 移除 next-intl 依赖

完成上述替换后，可以从 package.json 中移除 next-intl 依赖:

```bash
npm uninstall next-intl
```

### 3. 测试应用

运行应用并测试各个功能，确保一切正常工作:

```bash
npm run dev
```

## 兼容层说明

### useTranslations 钩子

`useTranslations` 钩子现在是一个简单的函数，它返回一个函数，该函数接受一个键并返回该键本身。这意味着所有翻译键将直接显示为文本，而不是被翻译。

### 导航 API

导航 API (`Link`, `useRouter`, `usePathname`, `redirect`) 现在直接使用 Next.js 的原生 API，不再处理国际化路径。

## 未来国际化支持

如果将来需要重新添加国际化支持，可以:

1. 重新安装 next-intl
2. 移除兼容层
3. 恢复原始导入路径

## 注意事项

- 某些组件可能需要手动调整，特别是那些依赖特定国际化功能的组件
- 所有路由现在都是非国际化的，不再包含语言前缀
- 默认语言设置为 'zh-CN' 