// scripts/fetch-sbhzm.mjs
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('1. 获取 index.html 确认最新 js bundle...');
  const htmlRes = await fetch('https://sbhzm.cn/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });
  const html = await htmlRes.text();
  const jsMatch = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/);
  const jsPath = jsMatch ? jsMatch[0] : '/assets/index-VsLQCXRS.js';
  console.log('JS Bundle 路径:', jsPath);

  console.log('2. 下载 JS 并提取完整 191 个语音按钮数据...');
  const jsRes = await fetch('https://sbhzm.cn' + jsPath, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://sbhzm.cn/'
    }
  });
  const jsCode = await jsRes.text();

  const start = jsCode.indexOf('Zo=[');
  let voices = [];
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
      voices = new Function('return ' + code)();
      console.log(`成功提取 ${voices.length} 个语音！`);
    }
  }

  console.log('3. 拉取经典烂梗列表 (前 3 页，每页 50 条)...');
  const quotesSet = new Set();
  for (let page = 1; page <= 3; page++) {
    try {
      const memeRes = await fetch(`https://sbhzm.cn/api/public/memes?sort=latest&page=${page}&page_size=50`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://sbhzm.cn/'
        }
      });
      if (memeRes.ok) {
        const data = await memeRes.json();
        const items = Array.isArray(data) ? data : (data?.items || []);
        for (const item of items) {
          const content = typeof item === 'string' ? item : item?.content;
          if (content && typeof content === 'string') {
            const clean = content.trim();
            if (clean && clean.length <= 150) { // 剔除过长文本，适合气泡展示
              quotesSet.add(clean);
            }
          }
        }
      }
    } catch (e) {
      console.warn(`拉取第 ${page} 页失败:`, e.message);
    }
  }

  const quotes = Array.from(quotesSet);
  console.log(`成功整理得到 ${quotes.length} 条优质烂梗！`);

  // 保证目录存在
  const outDir = path.resolve('src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const result = {
    updatedAt: new Date().toISOString(),
    totalVoices: voices.length,
    totalQuotes: quotes.length,
    voices: voices.map(v => ({
      id: v.id,
      title: v.title,
      src: v.src,
      categoryId: v.categoryId,
      duration: v.durationSeconds || 0
    })),
    quotes
  };

  const outFile = path.join(outDir, 'sbhzm-fallback.json');
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`✅ 成功写入兜底数据到 ${outFile}！`);
}

main().catch(console.error);
