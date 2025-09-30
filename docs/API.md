# 📚 API Documentation - Time MCP Server

## Table of Contents

- [Basic Time Tools](#basic-time-tools)
- [Advanced Workday Tools](#advanced-workday-tools)
- [Utility Tools](#utility-tools)
- [Chinese Holiday Integration](#chinese-holiday-integration)
- [Configuration Options](#configuration-options)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

## Basic Time Tools

### current_time

Get current time in UTC and local timezone.

**Parameters:**

```typescript
{
  format?: string;           // Date format (default: "YYYY-MM-DD HH:mm:ss")
  timezone?: string;         // IANA timezone name (default: system timezone)
}
```

**Example:**

```javascript
// Get current time in Shanghai timezone
current_time({
  format: "YYYY-MM-DD HH:mm:ss",
  timezone: "Asia/Shanghai"
})
```

**Available Formats:**

- `h:mm A` (12:30 PM)
- `h:mm:ss A` (12:30:45 PM)
- `YYYY-MM-DD HH:mm:ss` (2025-03-17 12:30:45)
- `YYYY-MM-DD` (2025-03-17)
- `YYYY-MM` (2025-03)
- `MM/DD/YYYY` (03/17/2025)
- `MM/DD/YY` (03/17/25)
- `YYYY/MM/DD` (2025/03/17)
- `YYYY/MM` (2025/03)

### relative_time

Get relative time from now.

**Parameters:**

```typescript
{
  time: string;              // Time in format: YYYY-MM-DD HH:mm:ss
}
```

**Example:**

```javascript
relative_time({
  time: "2025-03-17 12:00:00"
})
// Returns: "2 hours ago" or "in 3 days"
```

### get_timestamp

Get timestamp for specific time.

**Parameters:**

```typescript
{
  time?: string;             // Optional time (default: current time)
}
```

**Example:**

```javascript
get_timestamp({
  time: "2025-03-17 12:00:00"
})
// Returns: 1710656400000
```

### days_in_month

Get number of days in a month.

**Parameters:**

```typescript
{
  date?: string;             // Optional date (default: current month)
}
```

**Example:**

```javascript
days_in_month({
  date: "2025-03-17"
})
// Returns: 31
```

### convert_time

Convert time between timezones.

**Parameters:**

```typescript
{
  sourceTimezone: string;    // Source IANA timezone
  targetTimezone: string;    // Target IANA timezone
  time?: string;             // Optional time (default: current time)
}
```

**Example:**

```javascript
convert_time({
  sourceTimezone: "UTC",
  targetTimezone: "Asia/Shanghai",
  time: "2025-03-17 12:00:00"
})
```

### get_week_year

Get week and ISO week numbers.

**Parameters:**

```typescript
{
  date?: string;             // Optional date (default: current date)
}
```

**Example:**

```javascript
get_week_year({
  date: "2025-03-17"
})
// Returns: { week: 12, isoWeek: 12 }
```

## Advanced Workday Tools

### get_workdays_by_week

Get workdays for a specific ISO week.

**Parameters:**

```typescript
{
  year: number;              // Year (e.g., 2025)
  week: number;              // ISO week number (1-53)
  format?: string;           // Output format (default: "YYYY-MM-DD")
  region?: string;           // "china" or "" (default: "")
  useHolidays?: boolean;     // Use holiday data (default: true)
  refreshData?: boolean;     // Refresh holiday data (default: false)
  customWorkdays?: string[]; // Custom workdays in YYYY-MM-DD format
  customHolidays?: string[]; // Custom holidays in YYYY-MM-DD format
}
```

**Example:**

```javascript
get_workdays_by_week({
  year: 2025,
  week: 12,
  region: "china",
  format: "YYYY年MM月DD日"
})
```

### get_workdays_by_month

Get workdays for a specific month.

**Parameters:**

```typescript
{
  year: number;              // Year (e.g., 2025)
  month: number;             // Month (1-12)
  format?: string;           // Output format (default: "YYYY-MM-DD")
  region?: string;           // "china" or "" (default: "")
  useHolidays?: boolean;     // Use holiday data (default: true)
  refreshData?: boolean;     // Refresh holiday data (default: false)
  customWorkdays?: string[]; // Custom workdays in YYYY-MM-DD format
  customHolidays?: string[]; // Custom holidays in YYYY-MM-DD format
}
```

**Example:**

```javascript
get_workdays_by_month({
  year: 2025,
  month: 3,
  region: "china",
  customWorkdays: ["2025-03-08"],  // Override a holiday
  customHolidays: ["2025-03-15"]   // Add custom holiday
})
```

### get_workdays_by_range

Get workdays for a custom date range.

**Parameters:**

```typescript
{
  startDate: string;         // Start date (YYYY-MM-DD)
  endDate: string;           // End date (YYYY-MM-DD)
  format?: string;           // Output format (default: "YYYY-MM-DD")
  region?: string;           // "china" or "" (default: "")
  useHolidays?: boolean;     // Use holiday data (default: true)
  refreshData?: boolean;     // Refresh holiday data (default: false)
  customWorkdays?: string[]; // Custom workdays in YYYY-MM-DD format
  customHolidays?: string[]; // Custom holidays in YYYY-MM-DD format
}
```

**Example:**

```javascript
get_workdays_by_range({
  startDate: "2025-03-01",
  endDate: "2025-03-31",
  region: "china"
})
```

### get_workdays_by_quarter

Get workdays for a specific quarter.

**Parameters:**

```typescript
{
  year: number;              // Year (e.g., 2025)
  quarter: number;           // Quarter (1-4)
  format?: string;           // Output format (default: "YYYY-MM-DD")
  region?: string;           // "china" or "" (default: "")
  useHolidays?: boolean;     // Use holiday data (default: true)
  refreshData?: boolean;     // Refresh holiday data (default: false)
  customWorkdays?: string[]; // Custom workdays in YYYY-MM-DD format
  customHolidays?: string[]; // Custom holidays in YYYY-MM-DD format
}
```

**Example:**

```javascript
get_workdays_by_quarter({
  year: 2025,
  quarter: 1,
  region: "china"
})
```

### get_workdays_by_year

Get workdays for an entire year.

**Parameters:**

```typescript
{
  year: number;              // Year (e.g., 2025)
  format?: string;           // Output format (default: "YYYY-MM-DD")
  region?: string;           // "china" or "" (default: "")
  useHolidays?: boolean;     // Use holiday data (default: true)
  refreshData?: boolean;     // Refresh holiday data (default: false)
  customWorkdays?: string[]; // Custom workdays in YYYY-MM-DD format
  customHolidays?: string[]; // Custom holidays in YYYY-MM-DD format
}
```

**Example:**

```javascript
get_workdays_by_year({
  year: 2025,
  region: "china"
})
```

## Utility Tools

### get_week_dates

Get date range for a specific ISO week.

**Parameters:**

```typescript
{
  year: number;              // Year (e.g., 2025)
  week: number;              // ISO week number (1-53)
}
```

**Example:**

```javascript
get_week_dates({
  year: 2025,
  week: 12
})
// Returns: { startDate: "2025-03-17", endDate: "2025-03-23" }
```

### get_iso_weeks_in_month

Get ISO weeks contained in a specific month.

**Parameters:**

```typescript
{
  year: number;              // Year (e.g., 2025)
  month: number;             // Month (1-12)
}
```

**Example:**

```javascript
get_iso_weeks_in_month({
  year: 2025,
  month: 3
})
// Returns: { weeks: [10, 11, 12, 13, 14], weekCount: 5 }
```

### get_workday_stats

Get workday statistics for a date range.

**Parameters:**

```typescript
{
  startDate: string;         // Start date (YYYY-MM-DD)
  endDate: string;           // End date (YYYY-MM-DD)
  region?: string;           // "china" or "" (default: "")
  useHolidays?: boolean;     // Use holiday data (default: true)
  refreshData?: boolean;     // Refresh holiday data (default: false)
  customWorkdays?: string[]; // Custom workdays in YYYY-MM-DD format
  customHolidays?: string[]; // Custom holidays in YYYY-MM-DD format
}
```

**Example:**

```javascript
get_workday_stats({
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  region: "china"
})
// Returns: {
//   totalDays: 365,
//   workdays: 249,
//   holidays: 116,
//   weekends: 104,
//   inLieuDays: 12,
//   customWorkdays: 0,
//   customHolidays: 0
// }
```

## Chinese Holiday Integration

### Overview

The Time MCP Server includes comprehensive Chinese holiday data for the years 2004-2025. This includes:

- Official holidays (元旦, 春节, 清明节, 劳动节, 端午节, 中秋节, 国庆节)
- Workday adjustments (调休工作日)
- In-lieu days (调休休息日)
- Regional variations

### Features

- **Automatic Data Download**: Holiday data is automatically downloaded on first installation
- **Offline Caching**: Works without internet connection using cached data
- **Daily Sync**: Automatic data updates at 24:00
- **Smart Fallback**: Graceful degradation when network is unavailable
- **Historical Data**: Complete coverage from 2004 to 2025

### Usage

Set `region: "china"` to enable Chinese holiday support in any workday query:

```javascript
get_workdays_by_month({
  year: 2025,
  month: 3,
  region: "china",  // Enable Chinese holidays
  useHolidays: true
})
```

## Configuration Options

### Region Settings

- `""` (empty string): Standard Monday-Friday workdays
- `"china"`: Chinese holidays and workday adjustments

### Date Formats

- `"YYYY-MM-DD"` (default)
- `"MM/DD/YYYY"`
- `"DD/MM/YYYY"`
- `"YYYY/MM/DD"`
- `"YYYY年MM月DD日"`
- `"MM-DD-YYYY"`

### Custom Dates

Override default behavior with custom workdays and holidays:

```javascript
get_workdays_by_month({
  year: 2025,
  month: 3,
  region: "china",
  customWorkdays: ["2025-03-08"],  // Force this day to be a workday
  customHolidays: ["2025-03-15"]   // Force this day to be a holiday
})
```

### Data Refresh

Control holiday data freshness:

- `refreshData: false` (default): Use cached data
- `refreshData: true`: Force refresh from remote source

## Response Formats

### Standard Response

All tools return structured data with both human-readable and machine-readable formats:

```javascript
{
  success: true,
  content: [
    {
      type: "text",
      text: "Human-readable summary with formatted list"
    },
    {
      type: "text",
      text: "Structured data in JSON format"
    }
  ]
}
```

### Workday Response Structure

```javascript
[
  {
    date: "2025-03-17",
    day: "Monday",
    year: 2025,
    isWeekend: false,
    isHoliday: false,
    isWorkday: true,
    isInLieuDay: false,
    isCustomWorkday: false,
    isCustomHoliday: false,
    holidayInfo?: HolidayInfo,
    workdayInfo?: WorkdayDataInfo,
    inLieuDayInfo?: InLieuDayInfo
  }
]
```

### Holiday Info Structure

```javascript
{
  date: "2025-01-01",
  name: "New Year's Day",
  chineseName: "元旦",
  type: 1,
  isHoliday: true
}
```

## Error Handling

### Common Errors

- **Invalid date format**: Dates must be in YYYY-MM-DD format
- **Invalid date range**: Start date must be before or equal to end date
- **Invalid year**: Year must be a valid number
- **Invalid week**: Week number must be between 1-53
- **Invalid month**: Month must be between 1-12
- **Invalid quarter**: Quarter must be between 1-4
- **Network error**: Failed to download holiday data (falls back to cache)

### Error Response Format

```javascript
{
  success: false,
  content: [
    {
      type: "text",
      text: "Error message describing the issue"
    }
  ]
}
```

## Usage Examples

### Basic Time Queries

```javascript
// Get current time in multiple formats
current_time({ format: "YYYY-MM-DD HH:mm:ss" })
current_time({ format: "h:mm A", timezone: "America/New_York" })

// Convert time between timezones
convert_time({
  sourceTimezone: "UTC",
  targetTimezone: "Asia/Tokyo",
  time: "2025-03-17 12:00:00"
})

// Get timestamp for specific time
get_timestamp({ time: "2025-03-17 12:00:00" })
```

### Workday Planning

```javascript
// Plan work for March 2025 (Chinese holidays)
get_workdays_by_month({
  year: 2025,
  month: 3,
  region: "china",
  format: "YYYY年MM月DD日"
})

// Get Q1 2025 workdays for planning
get_workdays_by_quarter({
  year: 2025,
  quarter: 1,
  region: "china"
})

// Analyze custom project period
get_workdays_by_range({
  startDate: "2025-03-01",
  endDate: "2025-06-30",
  region: "china",
  customWorkdays: ["2025-04-05", "2025-05-01"]
})
```

### Statistical Analysis

```javascript
// Get yearly statistics for reporting
get_workday_stats({
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  region: "china"
})

// Compare different periods
get_workday_stats({
  startDate: "2025-01-01",
  endDate: "2025-03-31",
  region: "china"
})
```

### Custom Configuration

```javascript
// Company-specific work schedule
get_workdays_by_month({
  year: 2025,
  month: 3,
  region: "china",
  customWorkdays: ["2025-03-08", "2025-03-09"],  // Weekend workdays
  customHolidays: ["2025-03-15", "2025-03-16"], // Additional holidays
  useHolidays: true
})
```

## Best Practices

1. **Date Validation**: Always validate date ranges before making queries
2. **Region Setting**: Use `region: "china"` for Chinese holiday support
3. **Custom Dates**: Use custom workdays/holidays for company-specific schedules
4. **Data Freshness**: Use `refreshData: true` when holiday accuracy is critical
5. **Error Handling**: Always check for error responses in production code
6. **Performance**: Prefer specific date ranges over full-year queries for better performance

## Integration Examples

### JavaScript/TypeScript

```typescript
async function getWorkSchedule() {
  const response = await fetch('mcp-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "get_workdays_by_month",
        arguments: {
          year: 2025,
          month: 3,
          region: "china"
        }
      }
    })
  });

  const result = await response.json();
  return result.result.content;
}
```

### Python

```python
import requests
import json

def get_workdays(year, month, region="china"):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "get_workdays_by_month",
            "arguments": {
                "year": year,
                "month": month,
                "region": region
            }
        }
    }

    response = requests.post('mcp-endpoint', json=payload)
    return response.json()['result']['content']
```

---

This API documentation provides comprehensive guidance for using all 14 tools available in the Time MCP Server, with special focus on the advanced workday query capabilities and Chinese holiday integration.
