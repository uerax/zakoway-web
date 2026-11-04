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

export const siteConfig: SiteConfig = {
  brand: {
    name: 'ZAKOWAY HUB',
    logoText: 'A',
    slogan: '连接你的 二次元世界',
    description: '在线弹幕追番平台，支持在线观看，支持弹幕播放，支持 OP / ED 自动跳过。',
    pillText: '官方认证',
  },

  // 0. 核心 SEO 元数据配置
  seo: {
    title: 'ZAKOWAY HUB - Animaku (杂口动漫) 在线播放与客户端下载 ｜ 高清追番·弹幕·视频超分',
    description: 'ZAKOWAY HUB 官方发布页与主导航。提供 Animaku (杂口动漫) Web 网页端在线追番与 Zakoway 多平台客户端下载。支持多视频源聚合、实时弹幕播放、WebGPU 画质超分、智能跳过 OP/ED 与去广告切片，随时获取最新可用域名与更新通道。',
    keywords: [
      // 品牌与项目
      'ZAKOWAY', 'Animaku', '杂口动漫', 'zakoway app', 'ZAKOWAY HUB',
      // 核心功能与技术
      '动漫', '番剧', '日漫', '新番', '追番', '在线动漫', '动漫网站', '弹幕动漫', '免费看动漫',
      '画质超分', 'Anime4K', '弹幕播放', '跳过OPED', '视频源去广告', 'Bangumi', '动漫APP下载', '安卓动漫客户端',
      // 行业高频与二次元引流词
      '二次元', 'cycani', 'girigiri', 'girigirilove', 'bimi', 'bimi动漫', '樱花动漫', 'omofun', '稀饭动漫'
    ],
    author: 'ZAKOWAY HUB',
    siteUrl: 'https://zakoway.com',
    ogImage: '/og-image.svg',
  },

  // 1. 顶部通知 / 赞助横幅位（设 enabled: false 即可完全隐藏）
  topNoticeBanner: {
    enabled: false,
    tag: '赞助推荐',
    text: '二次元周边商城限时特惠，新用户首单享 8 折专属优惠',
    url: 'https://sponsor.example.com',
    actionLabel: '前往查看',
  },

  // 2. 核心产品列表（后续如果有漫画、论坛等直接追加即可）
  products: [
    {
      id: 'animaku',
      name: 'animaku (杂口动漫)',
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
        label: '立即进入 杂口动漫 网页端',
        url: 'https://web.zakoway.com/',
        isPrimary: true,
      },
      secondaryActions: [
        { label: '备用线路', url: 'https://bakasine.eu.org/' },
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
        url: 'https://github.com/uerax/zakoway/releases',
        isPrimary: true,
      },
      secondaryActions: [
        //{ label: 'iOS / TestFlight', url: 'https://testflight.apple.com/join/example' },
        //{ label: '版本更新日志', url: 'https://app.zakoway.example.com/changelog' },
      ],
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

  // 4. 备用线路与防失联列表
  backupLines: [
    {
      name: 'animaku (杂口动漫) 官方主线',
      url: 'https://web.zakoway.com/',
      status: '主线路',
      type: 'main',
    },
    {
      name: 'animaku (杂口动漫) 备用线路',
      url: 'https://bakasine.eu.org/',
      status: '备用线路',
      type: 'backup',
    },
    {
      name: 'zakoway App 更新发布源',
      url: 'https://github.com/uerax/zakoway/releases',
      status: '发布下载通道',
      type: 'cdn',
    },
  ],

  // 5. 官方防失联与社群支持
  socials: {
    telegramUrl: 'https://t.me/zakoway_chat',
    githubUrl: 'https://github.com/uerax',
    //email: 'contact@example.com',
  },

  // 6. 底部赞助商与友情链接
  sponsors: [
    //{ name: '🌸 萌番组数据源', url: 'https://example.com' },
  ],

  // 7. 模块显隐控制
  showMockupStage: false,        // 设为 false 隐藏产品实机视窗展台（有截图时改为 true 即可）
  showFuturePlaceholder: false,  // 设为 false 隐藏“更多生态正在孵化”卡片
};
