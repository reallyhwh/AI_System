# AI智能报销系统

一个面向企业的智能费控管理平台前端项目，通过 AI 技术自动化处理出差申请、差旅报销、员工报销等业务流程。

> 原始设计来源：[Figma 设计文件](https://www.figma.com/design/Wk4yB4jq9cYAkO1fRBbppA/AI%E6%99%BA%E8%83%BD%E6%8A%A5%E9%94%80%E7%B3%BB%E7%BB%9F%E8%AE%BE%E8%AE%A1)

## 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS v4** - 样式框架
- **React Router** - 路由管理
- **Radix UI** - 无障碍 UI 组件库
- **shadcn/ui** - UI 组件库
- **Dify API** - AI 智能体服务

## 项目结构

```
AI_system/
├── index.html              # 入口 HTML 文件
├── package.json            # 项目配置和依赖
├── vite.config.ts          # Vite 构建配置（含代理配置）
├── postcss.config.mjs      # PostCSS 配置
├── .gitignore              # Git 忽略配置
├── README.md               # 项目说明文档
├── DESIGN_DOCUMENT.md      # 详细设计文档
├── ATTRIBUTIONS.md         # 第三方库声明
│
├── config/                 # 配置文件目录
│   └── dify-agents/        # Dify 智能体配置
│       ├── 出差申请智能体.yml
│       ├── 差旅报销智能体.yml
│       └── 意图识别智能体.yml
│
├── public/                 # 静态资源目录
│
├── src/                    # 源代码目录
│   ├── main.tsx            # 应用入口文件
│   │
│   ├── app/                # 主应用代码
│   │   ├── App.tsx         # 根组件（路由 + Toast）
│   │   ├── routes.ts       # 路由配置
│   │   │
│   │   ├── pages/          # 页面组件
│   │   │   ├── Home.tsx               # 首页 - AI 对话助手
│   │   │   ├── BusinessTrip.tsx       # 出差申请（2步骤流程）
│   │   │   ├── TravelReimbursement.tsx # 差旅报销（4步骤流程）
│   │   │   ├── EmployeeReimbursement.tsx # 员工报销（4步骤流程）
│   │   │   ├── ImageManagement.tsx    # 影像管理 - 票据管理
│   │   │   ├── FieldConfig.tsx        # 字段配置 - 拖拽式表单设计器
│   │   │   ├── RuleConfig.tsx         # 规则配置 - 企业费控规则引擎
│   │   │   └── OperationLog.tsx       # 操作日志
│   │   │
│   │   ├── components/     # 公共组件
│   │   │   ├── StepIndicator.tsx      # 步骤指示器
│   │   │   ├── VoiceModal.tsx         # 语音输入弹窗
│   │   │   ├── CitySearchModal.tsx    # 城市搜索弹窗
│   │   │   ├── CostCenterSearchModal.tsx # 成本中心搜索弹窗
│   │   │   ├── DepartmentSearchModal.tsx # 部门搜索弹窗
│   │   │   ├── HRSearchModal.tsx      # HR 搜索弹窗
│   │   │   ├── TicketSelectorModal.tsx # 票据选择弹窗
│   │   │   ├── figma/                 # Figma 相关组件
│   │   │   └── ui/                    # UI 基础组件（shadcn/ui）
│   │   │
│   │   ├── services/       # 服务层
│   │   │   └── dify.ts     # Dify API 服务封装
│   │   │
│   │   ├── hooks/          # 自定义 Hooks
│   │   │
│   │   └── utils/          # 工具函数
│   │       └── storage.ts  # 本地存储工具
│   │
│   ├── types/              # 类型定义
│   │   └── index.ts        # 集中类型管理
│   │
│   ├── constants/          # 常量定义
│   │   └── index.ts        # 路由、状态等常量
│   │
│   └── styles/             # 样式文件
│       ├── index.css       # 样式入口
│       ├── tailwind.css    # Tailwind 配置
│       └── theme.css       # 主题变量
│
└── docs/                   # 文档目录
    ├── examples/           # 示例代码
    │   └── DifyIntegrationExample.tsx
    └── (其他文档)
```

## 功能模块

| 模块 | 路由 | 描述 |
|------|------|------|
| 首页（AI 对话） | `/` | 智能意图识别，语音/文本输入，快捷流程入口 |
| 出差申请 | `/business-trip` | 2步骤流程，智能计算公里数/天数/费用/补贴 |
| 差旅报销 | `/travel-reimbursement` | 4步骤流程，票据上传→AI稽查→信息填充→合规校验 |
| 员工报销 | `/employee-reimbursement` | 4步骤流程，针对日常费用报销 |
| 影像管理 | `/image-management` | 票据分类展示、搜索、批量操作、票据预览 |
| 字段配置 | `/field-config` | 拖拽式表单设计器，三面板布局 |
| 规则配置 | `/rule-config` | 企业费控规则引擎管理，支持多种规则类型 |
| 操作日志 | `/operation-log` | 操作记录查看 |

## 核心特性

### AI 智能功能
- **意图识别**：通过 Dify 智能体识别用户需求，自动跳转到对应模块
- **智能表单填充**：AI 解析用户输入，自动提取信息填充表单字段
- **智能费用计算**：根据出差信息自动计算补贴、交通费、住宿费等
- **票据 AI 稽查**：模拟票据上传后的智能校验流程
- **合规性校验**：自动检测异常关键词，确保报销合规

### 交互特性
- **语音输入**：支持语音录入，自动填充表单
- **步骤流程**：清晰的步骤指示器引导用户完成操作
- **响应式设计**：支持移动端、平板端、桌面端

## AI 智能体集成

本项目集成三个 Dify 智能体：

### 1. 意图识别智能体
- **功能**：分析用户输入，识别用户意图并返回对应页面路由
- **支持意图**：出差申请、差旅报销、员工报销

### 2. 出差申请智能体
- **功能**：解析用户描述，提取出差信息并生成标准表单
- **提取字段**：出差人、出发地、目的地、日期、交通方式、费用等

### 3. 差旅报销智能体
- **功能**：解析报销描述，提取报销信息并关联出差申请
- **提取字段**：报销人、费用明细、票据信息等

### API 配置

智能体 API 配置位于 `src/app/services/dify.ts`：

```typescript
const DIFY_CONFIG = {
  baseUrl: '/api/dify/v1',  // 通过 Vite 代理访问
  intentAgentApiKey: 'app-xxx',
  businessTripApiKey: 'app-xxx',
  travelReimbursementApiKey: 'app-xxx',
};
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建输出位于 `dist/` 目录。

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 类型定义统一放在 `src/types/`
- 常量定义统一放在 `src/constants/`
- 公共组件放在 `src/app/components/`
- 工具函数放在 `src/app/utils/`

### 新增页面

1. 在 `src/app/pages/` 创建页面组件
2. 在 `src/app/routes.ts` 添加路由配置
3. 在 `src/constants/index.ts` 添加路由常量

### 新增智能体

1. 在 Dify 平台创建智能体并获取 API Key
2. 在 `src/app/services/dify.ts` 添加 API Key 配置
3. 实现调用函数和数据解析逻辑

## 详细文档

更多设计细节请参阅 [设计文档](./DESIGN_DOCUMENT.md)，包含：
- 设计规范（色彩系统、字体间距、按钮规范）
- 各页面详细字段说明
- 数据模型定义
- 智能功能实现说明

## 许可证

本项目仅供学习和参考使用。
