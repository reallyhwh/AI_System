# AI智能报销系统设计

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

## 项目结构

```
AI_system/
├── index.html              # 入口 HTML 文件
├── package.json            # 项目配置和依赖
├── vite.config.ts          # Vite 构建配置
├── postcss.config.mjs      # PostCSS 配置
├── DESIGN_DOCUMENT.md      # 详细设计文档
├── ATTRIBUTIONS.md         # 第三方库声明
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
│   │   └── components/     # 公共组件
│   │       ├── StepIndicator.tsx      # 步骤指示器
│   │       ├── VoiceModal.tsx         # 语音输入弹窗
│   │       ├── CitySearchModal.tsx    # 城市搜索弹窗
│   │       ├── CostCenterSearchModal.tsx # 成本中心搜索弹窗
│   │       ├── DepartmentSearchModal.tsx # 部门搜索弹窗
│   │       ├── HRSearchModal.tsx      # HR 搜索弹窗
│   │       ├── TicketSelectorModal.tsx # 票据选择弹窗
│   │       ├── figma/                 # Figma 相关组件
│   │       └── ui/                    # UI 基础组件（shadcn/ui）
│   │
│   ├── styles/             # 样式文件
│   │   ├── index.css       # 样式入口
│   │   ├── tailwind.css    # Tailwind 配置
│   │   ├── theme.css       # 主题变量
│   │   └── fonts.css       # 字体配置
│   │
│   └── imports/            # 导入的静态 HTML 文件
│
├── public/                 # 静态资源目录
├── dist/                   # 构建输出目录
└── guidelines/             # 项目指南文档
    └── Guidelines.md       # 开发指南
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
- **意图识别**：通过关键词匹配识别用户需求，自动跳转到对应模块
- **智能费用计算**：根据出差信息自动计算补贴、交通费、住宿费等
- **票据 AI 稽查**：模拟票据上传后的智能校验流程
- **合规性校验**：自动检测异常关键词，确保报销合规

### 交互特性
- **语音输入**：支持语音录入，自动填充表单
- **步骤流程**：清晰的步骤指示器引导用户完成操作
- **响应式设计**：支持移动端、平板端、桌面端

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

## 详细文档

更多设计细节请参阅 [设计文档](./DESIGN_DOCUMENT.md)，包含：
- 设计规范（色彩系统、字体间距、按钮规范）
- 各页面详细字段说明
- 数据模型定义
- 智能功能实现说明

## 许可证

本项目仅供学习和参考使用。
