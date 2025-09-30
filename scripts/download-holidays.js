#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';

const HOLIDAYS_URL = 'https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json';
const HOLIDAYS_FILE = path.join(process.cwd(), 'chinese-days.json');

function downloadHolidays() {
  return new Promise((resolve, reject) => {
    console.log('正在下载中国节假日数据...');

    https.get(HOLIDAYS_URL, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const holidaysData = JSON.parse(data);
          fs.writeFileSync(HOLIDAYS_FILE, JSON.stringify(holidaysData, null, 2));
          console.log('中国节假日数据下载成功！');
          resolve(holidaysData);
        } catch (error) {
          console.error('解析节假日数据失败:', error.message);
          reject(error);
        }
      });

    }).on('error', (error) => {
      console.error('下载节假日数据失败:', error.message);
      reject(error);
    });
  });
}

async function main() {
  try {
    // 检查文件是否已存在
    if (fs.existsSync(HOLIDAYS_FILE)) {
      console.log('中国节假日数据文件已存在，跳过下载。');
      return;
    }

    await downloadHolidays();
  } catch (error) {
    console.error('节假日数据下载失败，但程序仍可正常运行:', error.message);
    process.exit(0);
  }
}

main();