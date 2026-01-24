# DataGenCanvas (Data Master)

## 项目简介 (Project Overview)
**DataGenCanvas** (又名 "Data Master") 是一个基于 Vue 3 和 Element Plus 构建的现代化前端应用，旨在为看板系统生成测试数据。它提供了一个直观的图形用户界面，允许用户配置生成参数，调用后端 API 生成 SQL 数据，并实时预览生成结果。

## 核心功能 (Key Features)

### 1. 数据生成器 (Generator)
- **支持类型**:
  - `TradeKPI` (交易KPI支付数据)
  - `Customer` (客户基础信息)
- **参数配置**:
  - 目标区域代码 (Region Code)
  - 生成数量 (1-100)
- **执行反馈**:
  - 实时显示生成总数、入库成功数。
  - SQL 语句预览 (支持代码折叠与复制)。
  - 成功/失败状态提示。

### 2. 界面布局
- 采用经典的左右布局 (Sidebar + Main Content)。
- **侧边栏**: 导航菜单 (生成器、历史记录、系统设置)。
- **顶部栏**: 面包屑导航。
- **响应式设计**: 适配不同屏幕尺寸。

## 技术栈 (Tech Stack)
- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **路由管理**: [Vue Router 4](https://router.vuejs.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **HTTP 客户端**: [Axios](https://axios-http.com/)
- **图标库**: @element-plus/icons-vue

## 项目结构 (Project Structure)

```
d:\Projects\front\dataGenCanvas\
├── public/              # 静态资源
├── src/
│   ├── api/             # API 接口层 (request.js 封装与模块化接口)
│   ├── layout/          # 全局布局组件 (Sidebar, Header)
│   ├── views/           # 页面级组件 (Generator, History, Settings)
│   ├── router/          # 路由配置
│   ├── App.vue          # 根组件 (路由出口)
│   ├── main.js          # 应用入口
├── .env                 # 环境变量配置
├── package.json         # 项目依赖与脚本
├── vite.config.js       # Vite 配置文件
└── README.md            # 项目说明文档
```

## 快速开始 (Getting Started)

### 1. 安装依赖
由于引入了 `vue-router`，请确保重新安装依赖：
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

## 配置说明 (Configuration)
后端 API 地址通过环境变量配置，位于项目根目录的 `.env` 文件中：
```ini
VITE_API_BASE_URL=https://smartruledatagen.onrender.com
```

## 优化与重构记录 (Refactoring Logs)
我们已对项目进行了现代化的重构，使其符合主流企业级开发规范：

1.  **引入 Vue Router**:
    - 实现了真正的路由跳转，支持 URL 直接访问特定页面（如 `/settings`）。
    - 支持路由懒加载，优化首屏性能。
2.  **目录结构分层**:
    - **Views**: 将业务页面拆分为独立组件 (`src/views/`)。
    - **Layout**: 抽离通用布局 (`src/layout/`)，便于后续扩展多套布局。
    - **API**: 封装 Axios (`src/api/request.js`)，统一处理拦截器和错误提示；将 API 定义模块化 (`src/api/generator.js`)。
3.  **代码清理**:
    - 移除了未使用的 Vue 模板文件和 CSS。
    - 修正了 `package.json` 中的依赖版本。

## 可拓展性建议 (Extensibility Suggestions)

为保证项目长期的可维护性与扩展性，建议遵循以下最佳实践：

### 1. 状态管理 (State Management)
- 当前应用状态较为简单，使用 Vue Composition API (`ref`/`reactive`) 即可。
- **未来建议**: 如果涉及多组件共享复杂状态（如用户信息、全局主题配置、跨页面的生成任务队列），建议引入 **Pinia**。

### 2. 组件化 (Componentization)
- 继续保持“高内聚，低耦合”的原则。
- 对于通用的业务组件（如“带有搜索功能的表格”、“复杂的表单块”），应提取到 `src/components/` 中。

### 3. Mock 数据与开发
- 建议在 `vite.config.js` 中集成 `vite-plugin-mock` 或使用简单的 JSON Server，以便在后端 API 不可用时进行离线开发。

### 4. 类型检查 (TypeScript)
- 虽然当前项目使用 JavaScript，但随着项目规模扩大，强烈建议迁移至 **TypeScript**，以获得更好的类型安全和 IDE 智能提示。

### 5. 测试 (Testing)
- **单元测试**: 使用 Vitest + Vue Test Utils 测试核心逻辑（如 API 数据处理、组件状态流转）。
- **E2E 测试**: 使用 Cypress 或 Playwright 进行端到端流程测试。

### 6. 持续集成 (CI/CD)
- 建立自动化构建流程，确保每次提交都能通过 Lint 检查和构建测试。
