import sbhzmFallback from '../data/sbhzm-fallback.json';

/**
 * 吉祥物 / 看板娘配置文件
 * 
 * 融合两大方案：
 * 1. 在线优先：通过 Cloudflare Pages Functions (/api/random-quote) 实时拉取 https://sbhzm.cn/ 最新烂梗
 * 2. 本地兜底：内置 136 条精选烂梗 + 191 条全量静态语音库，断网或离线秒级回退
 * 3. 语音播放：点击随机播放语音，严格限制 50% 音量 (0.5)
 */

export interface MascotVoice {
  id: string;
  title: string;
  src: string;
  categoryId?: string;
  duration?: number;
}

export interface MascotConfig {
  /** 是否启用吉祥物挂件 */
  enabled: boolean;
  /** 图片路径 */
  avatar: string;
  /** 是否开启点击语音播放 */
  enableVoice: boolean;
  /** 语音播放音量 (0.0 ~ 1.0, 默认 0.5 即 50%) */
  voiceVolume: number;
  /** 默认/兜底台词列表 */
  defaultQuotes: string[];
  /** 内置语音库列表 */
  voices: MascotVoice[];
  /** 可选：远程动态词库接口 */
  remoteQuotesUrl?: string;
}

/** 本地兜底台词（全部使用 sbhzm 烂梗语录库） */
export const defaultMascotQuotes: string[] = sbhzmFallback.quotes || [];

/** 191 个全量语音列表 */
export const defaultVoices: MascotVoice[] = sbhzmFallback.voices || [];

/**
 * 智能获取词列表：
 * 优先识别 Cloudflare Pages / Vite 注入的 PUBLIC_MASCOT_QUOTES 环境变量
 */
export function getMascotQuotes(): string[] {
  let envQuotes = '';

  try {
    if (typeof process !== 'undefined' && process.env?.PUBLIC_MASCOT_QUOTES) {
      envQuotes = process.env.PUBLIC_MASCOT_QUOTES;
    } else if (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_MASCOT_QUOTES) {
      envQuotes = (import.meta as any).env.PUBLIC_MASCOT_QUOTES;
    }
  } catch {
    // 降级为默认
  }

  if (!envQuotes || typeof envQuotes !== 'string' || !envQuotes.trim()) {
    return defaultMascotQuotes;
  }

  const trimmed = envQuotes.trim();

  // 1. JSON 数组解析
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // 回退至分隔符模式
    }
  }

  // 2. 换行符 / 分号 / 竖线分隔解析
  const splitList = trimmed
    .split(/[\r\n;；|｜]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return splitList.length > 0 ? splitList : defaultMascotQuotes;
}

export const mascotConfig: MascotConfig = {
  enabled: true,
  avatar: '/mascot.png',
  enableVoice: true,
  voiceVolume: 0.5, // 50% 音量
  defaultQuotes: defaultMascotQuotes,
  voices: defaultVoices,
};
