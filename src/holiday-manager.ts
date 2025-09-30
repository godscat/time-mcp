import fs from 'fs';
import path from 'path';
import https from 'https';
import dayjs from 'dayjs';

interface HolidayData {
  holidays: Record<string, string>;
  workdays: Record<string, string>;
  inLieuDays: Record<string, string>;
}

interface HolidayInfo {
  date: string;
  name: string;
  chineseName: string;
  type: number;
  isHoliday: boolean;
}

interface WorkdayInfo {
  date: string;
  name: string;
  chineseName: string;
  type: number;
  isWorkday: boolean;
}

interface InLieuDayInfo {
  date: string;
  name: string;
  chineseName: string;
  type: number;
  isInLieuDay: boolean;
}

export class HolidayManager {
  private static instance: HolidayManager;
  private holidays: Map<string, HolidayInfo> = new Map();
  private workdays: Map<string, WorkdayInfo> = new Map();
  private inLieuDays: Map<string, InLieuDayInfo> = new Map();
  private lastSync: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly HOLIDAYS_URL = 'https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json';
  private readonly HOLIDAYS_FILE = path.join(process.cwd(), 'chinese-days.json');

  private constructor() {}

  public static getInstance(): HolidayManager {
    if (!HolidayManager.instance) {
      HolidayManager.instance = new HolidayManager();
    }
    return HolidayManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadHolidayData();
      this.startDailySync();
    } catch (error) {
      console.warn('节假日数据初始化失败，将使用默认工作日配置:', error);
    }
  }

  private async loadHolidayData(): Promise<void> {
    try {
      // 优先尝试从本地文件加载
      if (fs.existsSync(this.HOLIDAYS_FILE)) {
        const data = fs.readFileSync(this.HOLIDAYS_FILE, 'utf8');
        this.parseHolidayData(JSON.parse(data));
        this.lastSync = new Date();
        console.log('从本地文件加载节假日数据成功');
        return;
      }

      // 本地文件不存在，尝试下载
      await this.downloadHolidayData();
    } catch (error) {
      console.warn('加载节假日数据失败:', error);
      throw error;
    }
  }

  private async downloadHolidayData(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('正在下载中国节假日数据...');

      https.get(this.HOLIDAYS_URL, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const holidayData = JSON.parse(data);
            this.parseHolidayData(holidayData);
            this.saveHolidayData(holidayData);
            this.lastSync = new Date();
            console.log('中国节假日数据下载成功');
            resolve();
          } catch (error) {
            reject(new Error(`解析节假日数据失败: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`下载节假日数据失败: ${error.message}`));
      });
    });
  }

  private parseHolidayData(data: HolidayData): void {
    // 解析节假日数据
    this.holidays.clear();
    for (const [date, info] of Object.entries(data.holidays)) {
      const [name, chineseName, type] = info.split(',');
      this.holidays.set(date, {
        date,
        name,
        chineseName,
        type: parseInt(type),
        isHoliday: true,
      });
    }

    // 解析调休工作日数据
    this.workdays.clear();
    for (const [date, info] of Object.entries(data.workdays)) {
      const [name, chineseName, type] = info.split(',');
      this.workdays.set(date, {
        date,
        name,
        chineseName,
        type: parseInt(type),
        isWorkday: true,
      });
    }

    // 解析补休日数据
    this.inLieuDays.clear();
    for (const [date, info] of Object.entries(data.inLieuDays)) {
      const [name, chineseName, type] = info.split(',');
      this.inLieuDays.set(date, {
        date,
        name,
        chineseName,
        type: parseInt(type),
        isInLieuDay: true,
      });
    }
  }

  private saveHolidayData(data: HolidayData): void {
    try {
      fs.writeFileSync(this.HOLIDAYS_FILE, JSON.stringify(data, null, 2));
      console.log('节假日数据保存到本地成功');
    } catch (error) {
      console.warn('保存节假日数据到本地失败:', error);
    }
  }

  private startDailySync(): void {
    // 计算到下一个24:00的时间
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // 设置定时同步
    setTimeout(() => {
      this.syncData();
      this.syncInterval = setInterval(() => {
        this.syncData();
      }, 24 * 60 * 60 * 1000); // 每24小时同步一次
    }, msUntilMidnight);
  }

  private async syncData(): Promise<void> {
    try {
      console.log('开始同步节假日数据...');
      await this.downloadHolidayData();
      console.log('节假日数据同步成功');
    } catch (error) {
      console.warn('节假日数据同步失败:', error);
    }
  }

  public isHoliday(date: string): boolean {
    return this.holidays.has(date);
  }

  public isWorkday(date: string): boolean {
    return this.workdays.has(date);
  }

  public isInLieuDay(date: string): boolean {
    return this.inLieuDays.has(date);
  }

  public getHolidayInfo(date: string): HolidayInfo | undefined {
    return this.holidays.get(date);
  }

  public getWorkdayInfo(date: string): WorkdayInfo | undefined {
    return this.workdays.get(date);
  }

  public getInLieuDayInfo(date: string): InLieuDayInfo | undefined {
    return this.inLieuDays.get(date);
  }

  public isWorkdayForChineseCalendar(date: string): boolean {
    const dayjsDate = dayjs(date);
    const dayOfWeek = dayjsDate.day();

    // 周末通常是休息日
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 如果是调休工作日，则是工作日
    if (this.isWorkday(date)) {
      return true;
    }

    // 如果是补休日，则是休息日
    if (this.isInLieuDay(date)) {
      return false;
    }

    // 如果是节假日，则是休息日
    if (this.isHoliday(date)) {
      return false;
    }

    // 其他情况：周一到周五是工作日，周末是休息日
    return !isWeekend;
  }

  public getLastSyncTime(): Date | null {
    return this.lastSync;
  }

  public async refreshData(): Promise<void> {
    await this.syncData();
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}