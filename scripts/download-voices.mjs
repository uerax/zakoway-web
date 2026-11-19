// scripts/download-voices.mjs
import fs from 'node:fs';
import path from 'node:path';

const fallbackPath = path.resolve('src/data/sbhzm-fallback.json');
const rawData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
const voices = rawData.voices || [];

console.log(`准备下载 ${voices.length} 个音频文件到本地 public/audio/...`);

// 替换 Windows 无法作为文件名的字符 (以防万一)
function sanitizeFilename(name) {
  return name.replace(/[\\:*?"<>|]/g, (match) => {
    const map = {
      ':': '：',
      '*': '＊',
      '?': '？',
      '"': '\'\'',
      '<': '《',
      '>': '》',
      '|': '｜',
      '\\': '＼',
    };
    return map[match] || '_';
  });
}

// 并发控制器
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = new Set();
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= poolLimit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

let downloadedCount = 0;
let failedCount = 0;
let totalBytes = 0;

async function downloadVoice(voice, index) {
  const rawSrc = voice.src;
  const parts = rawSrc.split('/');
  const filename = parts.pop();
  const safeFilename = sanitizeFilename(filename);
  const relativeDir = parts.join('/'); // e.g. /audio/buttons/ruma&zanghua

  const localDir = path.resolve('public', relativeDir.replace(/^\//, ''));
  fs.mkdirSync(localDir, { recursive: true });

  const localFilePath = path.join(localDir, safeFilename);
  const updatedSrc = `${relativeDir}/${safeFilename}`;

  // 如果已经下载且大于 0 字节，直接跳过
  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 0) {
    downloadedCount++;
    const sz = fs.statSync(localFilePath).size;
    totalBytes += sz;
    voice.src = updatedSrc;
    return;
  }

  // 拼接源站请求 URL (对中文和特殊字符进行 URI 编码)
  const encodedParts = parts.map((p) => encodeURIComponent(p));
  const encodedFilename = encodeURIComponent(filename);
  const remoteUrl = `https://sbhzm.cn${encodedParts.join('/')}/${encodedFilename}`;

  let retries = 3;
  let success = false;

  while (retries > 0 && !success) {
    try {
      const res = await fetch(remoteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://sbhzm.cn/',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 100) {
        throw new Error('File too small or empty');
      }

      fs.writeFileSync(localFilePath, buffer);
      downloadedCount++;
      totalBytes += buffer.length;
      success = true;
      voice.src = updatedSrc;

      if (downloadedCount % 20 === 0 || downloadedCount === voices.length) {
        console.log(`[进度] 已成功下载 ${downloadedCount}/${voices.length} (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
      }
    } catch (e) {
      retries--;
      if (retries === 0) {
        console.error(`❌ 下载失败: ${voice.title} (${remoteUrl}) -> ${e.message}`);
        failedCount++;
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }
}

async function main() {
  const startTime = Date.now();
  console.log('开始并发下载（并发度：6）...');

  await asyncPool(6, voices, downloadVoice);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('-------------------------------------------');
  console.log(`✅ 下载完成！`);
  console.log(`成功: ${downloadedCount} 个, 失败: ${failedCount} 个`);
  console.log(`总容量: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`耗时: ${durationSec} 秒`);

  // 更新 fallback json 中的 src 为本地安全相对路径
  rawData.voices = voices;
  fs.writeFileSync(fallbackPath, JSON.stringify(rawData, null, 2), 'utf-8');
  console.log(`已更新 ${fallbackPath} 中的本地音频路径映射！`);
}

main().catch(console.error);
