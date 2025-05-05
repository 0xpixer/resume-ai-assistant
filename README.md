# 简历 AI 助手

一个现代的简历创建和管理工具，使用人工智能帮助用户创建、优化和管理简历。

## Affinda API 集成指南

本项目使用 Affinda API 进行简历解析。以下是设置和使用的步骤：

### 1. 注册 Affinda 账户

1. 访问 [Affinda官网](https://www.affinda.com/) 并注册一个账户
2. 登录到 Affinda 控制台
3. 生成一个 API 密钥

### 2. 配置 API 密钥

在 `src/app/api/resume/parse/route.ts` 文件中，替换以下行中的 API 密钥：

```typescript
const AFFINDA_API_KEY = 'YOUR_AFFINDA_API_KEY'; // 替换为您的实际API密钥
```

建议将此密钥存储在环境变量中，例如：

```typescript
const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY || '';
```

然后在项目根目录的 `.env.local` 文件中添加：

```
AFFINDA_API_KEY=your_actual_api_key
```

### 3. 使用简历上传功能

1. 在创建简历页面，拖放您的简历文件（PDF或Word）或点击上传按钮选择文件
2. 系统将自动解析您的简历并填充到编辑器中
3. 您可以在上传后编辑所有信息

### 4. 注意事项

- Affinda API 提供免费层级，但有每月解析次数限制，请查阅他们的定价页面了解详情
- 解析结果的质量取决于原始简历的格式和内容质量
- 支持的文件格式包括 PDF 和 Word 文档（.doc, .docx）
- 文件大小限制为 10MB

## 项目特性

- 现代化的简历编辑界面
- 多种简历模板选择
- AI 辅助内容生成
- Resume Analysis and Feedback
- 自动从已有简历中提取数据
- 轻松导出为 PDF 格式

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- 集成 Affinda API 进行简历解析

## 环境变量

创建 `.env.local` 文件，添加以下环境变量：

```
AFFINDA_API_KEY=your_affinda_api_key
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
