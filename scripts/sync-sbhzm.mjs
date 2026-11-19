// scripts/sync-sbhzm.mjs
// 一体化增量自动同步脚本：检测源站新语音与新烂梗，仅增量下载新增音频
import fs from 'node:fs';
import path from 'node:path';

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

async function main() {
  console.log('🔍 [1/4] 正在检测源站 (sbhzm.cn) 最新构建版本...');
  let jsPath = '/assets/index-VsLQCXRS.js';
  try {
    const htmlRes = await fetch('https://sbhzm.cn/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await htmlRes.text();
    const match = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/);
    if (match) jsPath = match[0];
  } catch (e) {
    console.warn('获取最新 JS Bundle 路径失败，使用缓存版本:', e.message);
  }
  console.log(`-> 最新前端 Bundle: ${jsPath}`);

  console.log('📦 [2/4] 解析源站最新语音列表...');
  const jsRes = await fetch('https://sbhzm.cn' + jsPath, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://sbhzm.cn/',
    },
  });
  const jsCode = await jsRes.text();

  const start = jsCode.indexOf('Zo=[');
  let remoteVoices = [];
  if (start !== -1) {
    let depth = 0;
    let end = -1;
    for (let i = start + 3; i < jsCode.length; i++) {
      if (jsCode[i] === '[') depth++;
      else if (jsCode[i] === ']') {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end !== -1) {
      const code = jsCode.slice(start + 3, end);
      remoteVoices = new Function('return ' + code)();
    }
  }

  console.log(`-> 源站当前共有 ${remoteVoices.length} 个语音`);

  // 读取本地现有数据
  const fallbackPath = path.resolve('src/data/sbhzm-fallback.json');
  let localData = { voices: [], quotes: [] };
  if (fs.existsSync(fallbackPath)) {
    try {
      localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
    } catch {}
  }

  console.log('⚡ [3/4] 比对本地与源站差异，仅增量下载新增语音...');
  let newlyDownloaded = 0;
  let alreadyExist = 0;
  let failed = 0;

  const updatedVoices = [];

  async function processVoice(voice) {
    const rawSrc = voice.src;
    const parts = rawSrc.split('/');
    const filename = parts.pop();
    const safeFilename = sanitizeFilename(filename);
    const relativeDir = parts.join('/');

    const localDir = path.resolve('public', relativeDir.replace(/^\//, ''));
    fs.mkdirSync(localDir, { recursive: true });

    const localFilePath = path.join(localDir, safeFilename);
    const updatedSrc = `${relativeDir}/${safeFilename}`;

    updatedVoices.push({
      id: voice.id,
      title: voice.title,
      src: updatedSrc,
      categoryId: voice.categoryId,
      duration: voice.durationSeconds || voice.duration || 0,
    });

    // 已存在且大于 0 字节 -> 秒跳过
    if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 100) {
      alreadyExist++;
      return;
    }

    // 增量下载新文件
    const encodedParts = parts.map((p) => encodeURIComponent(p));
    const encodedFilename = encodeURIComponent(filename);
    const remoteUrl = `https://sbhzm.cn${encodedParts.join('/')}/${encodedFilename}`;

    try {
      const res = await fetch(remoteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://sbhzm.cn/',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error('File too small');
      fs.writeFileSync(localFilePath, buf);
      newlyDownloaded++;
      console.log(`✨ 发现并下载新语音: [${voice.title}] (${(buf.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      failed++;
      console.warn(`❌ 下载新语音失败: ${voice.title} -> ${err.message}`);
    }
  }

  await asyncPool(6, remoteVoices, processVoice);

  console.log(`-> 比对结果: 本地已有 ${alreadyExist} 个, 新增下载 ${newlyDownloaded} 个, 失败 ${failed} 个`);

  console.log('📝 [4/4] 同步最新热门烂梗列表...');
  const quotesSet = new Set(localData.quotes || []);
  for (let page = 1; page <= 3; page++) {
    try {
      const memeRes = await fetch(`https://sbhzm.cn/api/public/memes?sort=latest&page=${page}&page_size=50`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://sbhzm.cn/',
        },
      });
      if (memeRes.ok) {
        const data = await memeRes.json();
        const items = Array.isArray(data) ? data : (data?.items || []);
        for (const item of items) {
          const content = typeof item === 'string' ? item : item?.content;
          if (content && typeof content === 'string') {
            const clean = content.trim();
            if (clean && clean.length <= 150) {
              quotesSet.add(clean);
            }
          }
        }
      }
    } catch {}
  }

  const quotes = Array.from(quotesSet);

  // 写回本地数据
  const finalResult = {
    updatedAt: new Date().toISOString(),
    totalVoices: updatedVoices.length,
    totalQuotes: quotes.length,
    voices: updatedVoices,
    quotes,
  };

  fs.writeFileSync(fallbackPath, JSON.stringify(finalResult, null, 2), 'utf-8');

  console.log('----------------------------------------------------');
  console.log(`🎉 同步完成！当前语音总数: ${updatedVoices.length} 个，烂梗总数: ${quotes.length} 条`);
}

main().catch(console.error);
