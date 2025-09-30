# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## 项目概述

这是一个功能强大的 Model Context Protocol (MCP) 服务器实现，为 LLM 提供全面的时间感知能力。
项目使用 TypeScript 开发，特别集成了中国节假日数据，构建为一个可全局安装的 CLI 工具。

## 开发命令

```bash
# 开发模式运行
pnpm run dev

# 构建项目
pnpm run build

# 代码检查
pnpm run lint

# 自动修复代码问题
pnpm run lint:fix

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage
```

## 架构说明

### 核心文件结构

- `src/index.ts` - 服务器主入口，处理 MCP 协议和工具调用
- `src/tools.ts` - 定义了所有可用时间工具的 schema
- `src/holiday-manager.ts` - 中国节假日数据管理和离线缓存
- `eslint.config.mjs` - ESLint 配置，使用 TypeScript 规则
- `scripts/download-holidays.js` - 节假日数据自动下载脚本

### 工具实现

项目提供 14 个时间相关工具，分为几大类：

#### 基础时间工具 (6 个)

1. `current_time` - 获取当前时间（UTC 和本地时间）
2. `relative_time` - 获取相对时间
3. `get_timestamp` - 获取时间戳
4. `days_in_month` - 获取月份天数
5. `convert_time` - 时区转换
6. `get_week_year` - 获取年份中的周数

#### 工作日查询工具 (5 个)

1. `get_workdays_by_week` - 按 ISO 周数查询工作日（原有功能）
2. `get_workdays_by_month` - 按月份查询工作日
3. `get_workdays_by_range` - 按日期范围查询工作日
4. `get_workdays_by_quarter` - 按季度查询工作日
5. `get_workdays_by_year` - 按年份查询工作日

#### 辅助工具 (3 个)

1. `get_week_dates` - 获取 ISO 周的日期范围
2. `get_iso_weeks_in_month` - 获取月份包含的 ISO 周数
3. `get_workday_stats` - 工作日统计信息

### 技术栈

- **MCP SDK**: `@modelcontextprotocol/sdk` - 实现协议通信
- **时间处理**: `dayjs` - 配置了 relativeTime、utc、timezone、weekOfYear、isoWeek 插件
- **中国节假日**: `chinese-days` - 2004-2025 年中国节假日和调休数据
- **数据下载**: `node-fetch` - 自动下载和缓存节假日数据
- **构建**: `tsup` - 输出 CommonJS 和 ESM 格式
- **开发**: `tsx` - 支持 TypeScript 直接运行
- **测试**: `vitest` - 完整的单元测试覆盖
- **Node.js**: 需要 >= 20.0.0

### 关键设计模式

#### 中国节假日集成

- **离线缓存**: 自动下载节假日数据到本地 `chinese-days.json`
- **每日同步**: 24:00 自动更新数据，确保数据新鲜度
- **智能降级**: 网络失败时自动使用本地缓存数据
- **单例模式**: `HolidayManager` 确保数据管理的一致性
- **Map 优化**: O(1) 查找性能的日期索引结构

#### 工作日查询增强

- **多维度查询**: 支持周、月、季度、年、日期范围查询
- **自定义配置**: 支持自定义工作日和节假日
- **区域支持**: 中国节假日和标准工作日两种模式
- **实时刷新**: 支持手动刷新节假日数据
- **统计功能**: 提供详细的工作日、节假日、周末统计

#### 错误处理和验证

- **严格类型检查**: 所有工具参数都有完整的类型守卫
- **参数验证**: 日期格式、范围、类型等多重验证
- **优雅降级**: 数据不可用时的容错处理
- **标准错误响应**: 符合 MCP 协议的错误格式

### 部署要求

- **Smithery**: `npx -y @smithery/cli install @yokingma/time-mcp --client claude`
- **npm**: `npm install -g time-mcp`
- **npx**: `npx -y time-mcp`
- **支持客户端**: Claude Desktop、Cursor、Windsurf、Cherry Studio

### 配置示例

#### Claude Desktop

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "npx",
      "args": ["-y", "time-mcp"]
    }
  }
}
```

#### Cursor (mcp.json)

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "npx",
      "args": ["-y", "time-mcp"]
    }
  }
}
```

### 测试和质量保证

- **单元测试**: 65+ 测试用例，100% 通过率
- **测试覆盖**: 所有核心功能和边界情况
- **代码检查**: ESLint 严格规则
- **构建验证**: 自动化构建和部署流程

### 数据文件

- `chinese-days.json` - 中国节假日数据（35KB，自动下载）
- 支持节假日、工作日、调休日查询
- 数据范围：2004-2025 年
- 自动更新机制
