/**
 * 吉祥物 / 看板娘配置文件
 * 
 * 方便快捷修改台词的三种方式：
 * 
 * 【方式一：直接在本地代码修改】
 * 在下方的 defaultMascotQuotes 数组中随意增加、删除或修改语句即可。
 * 
 * 【方式二：在 Cloudflare Pages 后台设置环境变量（推荐：无需改动代码）】
 * 1. 进入 Cloudflare Dashboard -> Workers & Pages -> 点击你的项目
 * 2. 进入 Settings -> Environment variables -> 点击 Add variable
 * 3. 变量名（Variable name）填写：PUBLIC_MASCOT_QUOTES
 * 4. 变量值（Value）填写你的台词，支持以下任意格式：
 *    - 换行分隔（每行一句台词）
 *    - 分号分隔（例如：今天也要开心追番; 扎口动漫永远的神; 来看新番啦）
 *    - JSON 数组（例如：["台词1", "台词2", "台词3"]）
 * 5. 保存后在 Deployments 页面点击 "Retry deployment"（重新部署）即可快速更新！
 * 
 * 【方式三：免重新部署的远程热更新（可选）】
 * 在下方 remoteQuotesUrl 中填入一个公开的 JSON 接口（例如 Cloudflare Worker、KV 或第三方 JSON 托管），
 * 网站前端会在用户打开时自动拉取并合并最新台词，连部署都不需要！
 */

export interface MascotConfig {
  /** 是否启用吉祥物挂件 */
  enabled: boolean;
  /** 图片路径 */
  avatar: string;
  /** 默认台词列表 */
  defaultQuotes: string[];
  /** 可选：远程动态词库接口（例如 Cloudflare Worker / KV / JSON 地址） */
  remoteQuotesUrl?: string;
}

/** 默认台词列表，独立列出方便随时修改 */
export const defaultMascotQuotes: string[] = [
  '扎口动漫，高清追番不迷路！✨',
  '今天的新番看了吗？(｡♥‿♥｡)',
  '看、看到我了吗…？',
  '画质超分和弹幕已就绪～💻',
  '记得保存主线和备用线路哦！📌',
  '哇！被你戳中了～(⁄ ⁄>⁄ω⁄<⁄ ⁄)',
  '连接你的二次元世界！🌸',
];

/**
 * 智能获取词列表：
 * 自动识别 Cloudflare Pages / Vite 注入的 PUBLIC_MASCOT_QUOTES 环境变量
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
  defaultQuotes: defaultMascotQuotes,
  // 如需免构建远程实时热更新，可取消注释并配置对应的 API/JSON 地址：
  // remoteQuotesUrl: 'https://your-worker.your-subdomain.workers.dev/quotes',
};
