# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Model Context Protocol (MCP) 服务器实现，为 LLM 提供时间感知能力。项目使用 TypeScript 开发，构建为一个可全局安装的 CLI 工具。

## 开发命令

```bash
# 开发模式运行
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix
```

## 架构说明

### 核心文件结构

- `src/index.ts` - 服务器主入口，处理 MCP 协议和工具调用
- `src/tools.ts` - 定义了所有可用时间工具的 schema
- `eslint.config.mjs` - ESLint 配置，使用 TypeScript 规则

### 工具实现
项目提供 6 个时间相关工具：

1. `current_time` - 获取当前时间（UTC 和本地时间）
2. `relative_time` - 获取相对时间
3. `get_timestamp` - 获取时间戳
4. `days_in_month` - 获取月份天数
5. `convert_time` - 时区转换
6. `get_week_year` - 获取年份中的周数

### 技术栈

- **MCP SDK**: `@modelcontextprotocol/sdk` - 实现协议通信
- **时间处理**: `dayjs` - 配置了 relativeTime、utc、timezone、weekOfYear、isoWeek 插件
- **构建**: `tsup` - 输出 CommonJS 和 ESM 格式
- **开发**: `tsx` - 支持 TypeScript 直接运行
- **Node.js**: 需要 >= 20.0.0

### 关键设计模式

- 使用严格的 TypeScript 类型检查，所有工具参数都有完整的类型守卫
- 服务器通过 `StdioServerTransport` 进行通信
- 错误处理：每个工具调用都有 try-catch 包装，返回标准的 MCP 错误响应格式
- 构建输出包含可执行权限设置 (755)

### 部署要求

- 通过 Smithery 或 npm 发布
- 支持 Claude Desktop、Cursor、Windsurf 等 MCP 客户端
- 使用 npx 直接运行：`npx -y time-mcp`
