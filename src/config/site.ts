export interface ProductAction {
  label: string;
  url: string;
  icon?: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  name: string;
  type: 'web' | 'app' | 'tool' | 'community';
  badge: string;
  subtext: string;
  description: string;
  features: string[];
  themeColor: string; // 主题强调色 (如 #00f2fe 或 #ff3388)
  themeColorAlt?: string; // 渐变第二色
  primaryAction: ProductAction;
  secondaryActions?: ProductAction[];
  mockupImage?: string;
}

export interface AdSlot {
  id: string;
  enabled: boolean;
  type: 'card' | 'banner' | 'sponsor-logo';
  title: string;
  subtext?: string;
  description: string;
  tag: string; // 标识文字，如 "赞助合作" 或 "AD"
  targetUrl: string;
  themeColor?: string;
  themeColorAlt?: string;
  actionText?: string;
  features?: string[];
}

export interface BackupLine {
  name: string;
  url: string;
  status: string; // 如 "线路响应正常"
  type: 'main' | 'backup' | 'cdn';
}

export interface SiteConfig {
  brand: {
    name: string;
    logoText: string;
    slogan: string;
    description: string;
    pillText: string;
  };
  // 核心 SEO 配置
  seo: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    siteUrl: string;
    ogImage: string;
  };
  // 顶部通知与广告位
  topNoticeBanner: {
    enabled: boolean;
    tag: string;
    text: string;
    url: string;
    actionLabel: string;
  };
  // 产品矩阵（在此添加新产品）
  products: Product[];
  // 原生卡片广告位（在此配置信息流广告）
  cardAds: AdSlot[];
  // 官方备用线路列表
  backupLines: BackupLine[];
  // 官方防失联社群渠道
  socials: {
    telegramUrl: string;
    githubUrl: string;
    email?: string;
  };
  // 底部赞助商与友情链接
  sponsors: {
    name: string;
    url: string;
  }[];
  // 模块显隐开关
  showMockupStage?: boolean;
  showFuturePlaceholder?: boolean;
}

/**
 * 智能读取环境变量（兼容 Cloudflare Pages / Vite / Node 环境）
 */
function getEnv(key: string, fallback: string = ''): string {
  try {
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key]!.trim();
    }
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
      return String((import.meta as any).env[key]).trim();
    }
  } catch {}
  return fallback;
}

// ----------------------------------------------------
// Cloudflare Pages / 运行时参数提取与智能覆盖
// ----------------------------------------------------
const envMainUrl = getEnv('PUBLIC_MAIN_URL', 'https://zakoway.com/');
const envBackupUrl = getEnv('PUBLIC_BACKUP_URL', 'https://bakasine.eu.org/');
const envAppDownloadUrl = getEnv('PUBLIC_APP_DOWNLOAD_URL', 'https://github.com/uerax/zakoway/releases');
const envTelegramUrl = getEnv('PUBLIC_TELEGRAM_URL', 'https://t.me/zakoway_chat');
const envGithubUrl = getEnv('PUBLIC_GITHUB_URL', 'https://github.com/uerax');

const envSiteTitle = getEnv('PUBLIC_SITE_TITLE', '扎口动漫 - 在线播放与客户端下载 ｜ 高清追番·弹幕·视频超分');
const envSiteDescription = getEnv('PUBLIC_SITE_DESCRIPTION', '扎口动漫 官方发布页与主导航。提供 扎口动漫 Web 网页端在线追番与 Zakoway 多平台客户端下载。支持多视频源聚合、实时弹幕播放、WebGPU 画质超分、智能跳过 OP/ED 与去广告切片，随时获取最新可用域名与更新通道。');
const envBrandName = getEnv('PUBLIC_BRAND_NAME', '扎口动漫');
const envBrandSlogan = getEnv('PUBLIC_BRAND_SLOGAN', '连接你的 二次元世界');
const envBrandDescription = getEnv('PUBLIC_BRAND_DESCRIPTION', '在线弹幕追番平台，支持在线观看，支持弹幕播放，支持 OP / ED 自动跳过。');
const envPillText = getEnv('PUBLIC_PILL_TEXT', '官方认证');

const envNoticeText = getEnv('PUBLIC_TOP_NOTICE', '');
const envNoticeUrl = getEnv('PUBLIC_TOP_NOTICE_URL', envBackupUrl || '#');

/**
 * 智能解析备用线路列表：
 * 支持 Cloudflare 环境变量 PUBLIC_BACKUP_LINES：
 * 格式1（每行一条）：名称|链接（如：香港高速线路|https://hk.bakasine.eu.org/）
 * 格式2（JSON数组）：[{"name": "...", "url": "..."}]
 */
function parseBackupLines(defaultLines: BackupLine[]): BackupLine[] {
  const envVal = getEnv('PUBLIC_BACKUP_LINES');
  if (!envVal) return defaultLines;

  // JSON 解析
  if (envVal.startsWith('[') && envVal.endsWith(']')) {
    try {
      const parsed = JSON.parse(envVal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          name: String(item.name || `线路 ${idx + 1}`),
          url: String(item.url || '#'),
          status: String(item.status || (idx === 0 ? '主线路' : '备用线路')),
          type: (item.type as 'main' | 'backup' | 'cdn') || (idx === 0 ? 'main' : 'backup'),
        }));
      }
    } catch {}
  }

  // 换行分隔解析
  const lines = envVal.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return defaultLines;

  return lines.map((line, idx) => {
    const parts = line.split(/[|,｜，]/);
    if (parts.length >= 2) {
      return {
        name: parts[0].trim(),
        url: parts.slice(1).join(',').trim(),
        status: idx === 0 ? '主线路' : '备用线路',
        type: idx === 0 ? 'main' : 'backup',
      };
    }
    return {
      name: idx === 0 ? '扎口动漫 官方主线' : `扎口动漫 备用线路 ${idx}`,
      url: line,
      status: idx === 0 ? '主线路' : '备用线路',
      type: idx === 0 ? 'main' : 'backup',
    };
  });
}

const defaultBackupLines: BackupLine[] = [
  {
    name: '扎口动漫 官方主线',
    url: envMainUrl,
    status: '主线路',
    type: 'main',
  },
  {
    name: '扎口动漫 备用线路',
    url: envBackupUrl,
    status: '备用线路',
    type: 'backup',
  },
  {
    name: 'zakoway App 更新发布源',
    url: envAppDownloadUrl,
    status: '发布下载通道',
    type: 'cdn',
  },
];

export const siteConfig: SiteConfig = {
  brand: {
    name: envBrandName,
    logoText: 'A',
    slogan: envBrandSlogan,
    description: envBrandDescription,
    pillText: envPillText,
  },

  // 0. 核心 SEO 元数据配置
  seo: {
    title: envSiteTitle,
    description: envSiteDescription,
    keywords: [
      // 品牌与项目
      'ZAKOWAY', '扎口动漫', 'Animaku', 'zakoway app', 'ZAKOWAY HUB',
      // 核心功能与技术
      '动漫', '番剧', '日漫', '新番', '追番', '在线动漫', '动漫网站', '弹幕动漫', '免费看动漫',
      '画质超分', 'Anime4K', '弹幕播放', '跳过OPED', '视频源去广告', 'Bangumi', '动漫APP下载', '安卓动漫客户端',
      // 行业高频与二次元引流词
      '二次元', 'cycani', 'girigiri', 'girigirilove', 'bimi', 'bimi动漫', '樱花动漫', 'omofun', '稀饭动漫'
    ],
    author: envBrandName,
    siteUrl: envMainUrl,
    ogImage: '/og-image.svg',
  },

  // 1. 顶部通知 / 赞助横幅位（若设置了 PUBLIC_TOP_NOTICE 环境变量会自动启用）
  topNoticeBanner: {
    enabled: Boolean(envNoticeText),
    tag: '公告推荐',
    text: envNoticeText || '二次元周边商城限时特惠，新用户首单享 8 折专属优惠',
    url: envNoticeUrl,
    actionLabel: '前往查看',
  },

  // 2. 核心产品列表
  products: [
    {
      id: 'animaku',
      name: '扎口动漫',
      type: 'web',
      badge: 'Web 网页在线端',
      subtext: '无需安装 · 即开即看',
      description: '在线弹幕追番web平台，支持在线观看，支持视频源广告过滤，支持 OP / ED 自动跳过，支持弹幕。',
      features: [
        '多源聚合和在线播放',
        '实时的多平台弹幕',
        '自适应平板与电脑全屏'
      ],
      themeColor: '#00f2fe',
      themeColorAlt: '#38bdf8',
      primaryAction: {
        label: '立即进入 扎口动漫 网页端',
        url: envMainUrl,
        isPrimary: true,
      },
      secondaryActions: [
        { label: '备用线路', url: envBackupUrl },
        { label: '开源代码', url: 'https://github.com/uerax/Animaku' },
      ],
      mockupImage: '/screenshots/animaku-preview.webp',
    },
    {
      id: 'zakoway',
      name: 'zakoway',
      type: 'app',
      badge: '客户端',
      subtext: '更强的兼容性 · 视频超分播放',
      description: '多平台客户端，比 Web 端有更高的权限，能支持更多的源和视频超分播放。',
      features: [
        '权限更高，支持更多源',
        '视频超分播放与画质增强',
        '手势控光控音与倍速连播'
      ],
      themeColor: '#ff3388',
      themeColorAlt: '#7928ca',
      primaryAction: {
        label: '下载地址',
        url: envAppDownloadUrl,
        isPrimary: true,
      },
      secondaryActions: [],
      mockupImage: '/screenshots/zakoway-preview.webp',
    },
  ],

  // 3. 原生卡片广告位（设 enabled: false 即可完全隐藏，不留空白）
  cardAds: [
    {
      id: 'ad-game-rpg',
      enabled: false,
      type: 'card',
      title: '某某二次元抽卡大作',
      subtext: '超人气日系 RPG 手游',
      description: '豪华声优阵容加盟，今日上线免费领取新手百抽福利礼包与限定 SSR 角色。带你沉浸式领略奇幻冒险故事。',
      tag: '赞助合作 · AD',
      targetUrl: 'https://game-sponsor.example.com',
      themeColor: '#f59e0b',
      themeColorAlt: '#fbbf24',
      actionText: '前往领取专属礼包',
      features: [
        '登录即领 SSR 与 100 连抽',
        '全角色 Live2D 动态交互'
      ],
    },
  ],

  // 4. 备用线路与防失联列表（优先读取 PUBLIC_BACKUP_LINES）
  backupLines: parseBackupLines(defaultBackupLines),

  // 5. 官方防失联与社群支持
  socials: {
    telegramUrl: envTelegramUrl,
    githubUrl: envGithubUrl,
  },

  // 6. 底部赞助商与友情链接
  sponsors: [],

  // 7. 模块显隐控制
  showMockupStage: false,        // 设为 false 隐藏产品实机视窗展台（有截图时改为 true 即可）
  showFuturePlaceholder: false,  // 设为 false 隐藏“更多生态正在孵化”卡片
};

// 导出吉祥物配置
export * from './mascot';
