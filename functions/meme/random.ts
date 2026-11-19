// functions/meme/random.ts
// Cloudflare Pages Function: 开放聚合接口，返回一条随机语录 + 一个随机语音 (走本站 CDN 极速直出，彻底解决源站延迟)
import fallbackData from '../../src/data/sbhzm-fallback.json';

const overflowEggs = [
  '…（太长了被看板娘吃掉啦！ᐠ( ᐛ )ᐟ）',
  '…（小作文太长，不想念了啦！）',
  '…（长篇大论，看板娘CPU烧了喵~）',
  '…（太长啦，建议回原贴品鉴）',
];

function formatQuote(text: string): string {
  if (!text || typeof text !== 'string') return '……';
  const clean = text.trim();
  const MAX_LEN = 62;
  if (clean.length <= MAX_LEN) {
    return clean;
  }
  const egg = overflowEggs[Math.floor(Math.random() * overflowEggs.length)];
  return clean.slice(0, 44) + egg;
}

function getRandomFallbackQuote(): string {
  const quotes = fallbackData.quotes || [];
  if (quotes.length > 0) {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  return '……';
}

function getRandomVoice(baseUrl: string) {
  const voices = fallbackData.voices || [];
  if (voices.length === 0) return null;
  const v = voices[Math.floor(Math.random() * voices.length)];
  const rawSrc = v.src || '';
  const url = rawSrc.startsWith('http')
    ? rawSrc
    : `${baseUrl}${rawSrc.startsWith('/') ? '' : '/'}${rawSrc}`;

  return {
    id: v.id,
    title: v.title,
    url,
    category: v.categoryId || 'misc',
    duration: v.duration || 0,
  };
}

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const reqUrl = new URL(context.request.url);
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;

  let quote = '';
  let isLive = false;

  // 1. 优先尝试从源站拉取实时最新随机烂梗
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2秒超时保护

    const upstreamRes = await fetch('https://sbhzm.cn/api/public/memes/random', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://sbhzm.cn/',
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      const data = await upstreamRes.json();
      if (data && typeof data.content === 'string' && data.content.trim()) {
        quote = formatQuote(data.content);
        isLive = true;
      }
    }
  } catch {
    // 超时或失败则静默走本地兜底
  }

  // 2. 兜底语录
  if (!quote) {
    quote = formatQuote(getRandomFallbackQuote());
  }

  // 3. 随机语音 (使用本站高速 CDN 完整直链)
  const voice = getRandomVoice(baseUrl);

  const responseBody = {
    code: 200,
    quote,
    voice,
    volume: 0.5, // 推荐播放音量 50%
    isLive,      // 是否为实时在线抓取
  };

  return new Response(JSON.stringify(responseBody, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// 支持 OPTIONS 跨域预检
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}
