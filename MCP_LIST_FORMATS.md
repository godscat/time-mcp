# MCP 列表数据返回指南

## 📋 MCP 协议中的列表返回

MCP (Model Context Protocol) 支持返回列表数据，主要通过 `content` 数组中的多个 `text` 类型对象来实现。

## 🔧 返回格式

### 标准 MCP 返回格式

```javascript
return {
  success: true,
  content: [
    {
      type: 'text',
      text: '内容1'
    },
    {
      type: 'text', 
      text: '内容2'
    }
  ]
};
```

## 📝 列表返回方法

### 方法1：格式化文本列表

```javascript
// 简单列表
const workdays = ['2025-03-17', '2025-03-18', '2025-03-19'];
return {
  success: true,
  content: [
    {
      type: 'text',
      text: `工作日列表:\n${workdays.map(day => `- ${day}`).join('\n')}`
    }
  ]
};
```

**输出：**
```
工作日列表:
- 2025-03-17
- 2025-03-18
- 2025-03-19
```

### 方法2：表格格式

```javascript
const workdays = [
  { date: '2025-03-17', day: 'Monday' },
  { date: '2025-03-18', day: 'Tuesday' }
];

const table = workdays.map(wd => `| ${wd.date} | ${wd.day} |`).join('\n');
const header = '| 日期 | 星期 |\n|------|------|';

return {
  success: true,
  content: [
    {
      type: 'text',
      text: `${header}\n${table}`
    }
  ]
};
```

**输出：**
```
| 日期 | 星期 |
|------|------|
| 2025-03-17 | Monday |
| 2025-03-18 | Tuesday |
```

### 方法3：结构化JSON数据

```javascript
const structuredData = [
  { date: '2025-03-17', day: 'Monday', week: 12, year: 2025 },
  { date: '2025-03-18', day: 'Tuesday', week: 12, year: 2025 }
];

return {
  success: true,
  content: [
    {
      type: 'text',
      text: `结构化数据:\n${JSON.stringify(structuredData, null, 2)}`
    }
  ]
};
```

**输出：**
```json
结构化数据:
[
  {
    "date": "2025-03-17",
    "day": "Monday",
    "week": 12,
    "year": 2025
  },
  {
    "date": "2025-03-18",
    "day": "Tuesday",
    "week": 12,
    "year": 2025
  }
]
```

### 方法4：多内容组合

```javascript
const workdays = ['2025-03-17', '2025-03-18', '2025-03-19'];
const structuredData = workdays.map((date, index) => ({
  date: date,
  day: ['Monday', 'Tuesday', 'Wednesday'][index],
  week: 12,
  year: 2025
}));

return {
  success: true,
  content: [
    {
      type: 'text',
      text: `工作日列表:\n${workdays.map(day => `- ${day}`).join('\n')}`
    },
    {
      type: 'text',
      text: `详细数据:\n${JSON.stringify(structuredData, null, 2)}`
    },
    {
      type: 'text',
      text: `总计: ${workdays.length} 个工作日`
    }
  ]
};
```

## 🎯 当前项目中的实现

在我们的 `get_workdays` 工具中，我们使用了多内容组合的方式：

```javascript
case 'get_workdays': {
  const { year, week, format } = args;
  const workdays = getWorkdays(year, week, format);
  
  // 创建结构化的工作日数据
  const structuredWorkdays = workdays.map((date, index) => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return {
      date: date,
      day: dayNames[index],
      week: week,
      year: year,
      isWeekend: false
    };
  });
  
  return {
    success: true,
    content: [
      {
        type: 'text',
        text: `Workdays for ISO week ${week} of ${year}:\n${workdays.map(day => `- ${day}`).join('\n')}`,
      },
      {
        type: 'text',
        text: `Structured data:\n${JSON.stringify(structuredWorkdays, null, 2)}`,
      },
    ],
  };
}
```

## 📊 不同格式的优缺点

| 格式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **简单列表** | 易读、简洁 | 信息量有限 | 简单数据展示 |
| **表格格式** | 结构化、易比较 | 格式复杂 | 需要对齐的数据 |
| **JSON格式** | 机器友好、信息丰富 | 可读性差 | 程序处理 |
| **多内容组合** | 信息全面、格式灵活 | 内容较多 | 复杂数据展示 |

## 🔍 测试方法

### 1. 手动测试
```bash
# 启动服务器
npx -y time-mcp

# 发送请求
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_workdays","arguments":{"year":2025,"week":12}}}'
```

### 2. 单元测试
在我们的测试文件中，我们测试了各种列表格式：

```javascript
it('should return consecutive Monday to Friday', () => {
  const result = testFunctions.getWorkdays(2025, 12);
  const days = result.map(date => dayjs(date));
  
  // Check that we have Monday to Friday
  expect(days[0].day()).toBe(1); // Monday
  expect(days[1].day()).toBe(2); // Tuesday
  // ... 更多验证
});
```

## 💡 最佳实践

1. **保持一致性**: 选择一种格式并在项目中保持一致
2. **考虑用户体验**: 优先选择易读的格式
3. **提供结构化数据**: 同时提供机器可读的格式
4. **适当的格式化**: 使用缩进和换行提高可读性
5. **错误处理**: 确保列表数据为空时的处理

## 🚀 扩展建议

### 1. 添加格式参数
```javascript
// 在工具定义中添加输出格式选项
format: {
  type: 'string',
  enum: ['list', 'table', 'json'],
  default: 'list'
}
```

### 2. 支持多种输出格式
```javascript
switch (outputFormat) {
  case 'table':
    return formatAsTable(data);
  case 'json':
    return formatAsJSON(data);
  default:
    return formatAsList(data);
}
```

### 3. 添加分页支持
对于大量数据，可以添加分页参数：

```javascript
page: {
  type: 'integer',
  default: 1
},
limit: {
  type: 'integer',
  default: 10
}
```

MCP 协议虽然主要使用 `type: 'text'` 的内容，但通过 creative 的格式化，完全可以优雅地返回列表数据！