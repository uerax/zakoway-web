# Anime Hub Portal - 二次元官方发布页与主导航枢纽

专为二次元项目（如 `animaku` 网页端、`zakoway` 移动客户端）打造的现代化官方发布与主导航落地页系统。

✨ **核心特性**：
- **静态零服务端架构**：基于现代前端静态网站生成器 **Astro**，构建产物为纯静态文件，完美适配 **GitHub Pages** 与 **Cloudflare Pages**（全球 CDN 加速、自带防 DDoS 与免费 SSL）。
- **配置驱动架构 (Config-Driven)**：页面视觉与业务数据彻底解耦，后续增加新产品（漫画/小说/社区）、调整线路或开启/关闭广告位，只需编辑 `src/config/site.ts` 配置文件，无需修改排版代码。
- **现代化暗黑二次元视觉**：高透毛玻璃拟态（Glassmorphism）、微渐变光晕背景、支持明暗主题切换。
- **实机视窗展台**：内置仿浏览器窗口（展示 animaku 网页播放器）与手机真机模型（展示 zakoway 客户端）。
- **防失联与备用线路**：内置一键复制官方主线、备用 CDN 线路与官方 TG / GitHub 社区入口。
- **原生广告/赞助位预留**：提供与原生卡片融为一体的原生卡片广告位、顶部通告栏及底部赞助商 Logo 墙，均支持独立一键开关。

---

## 快速查看与开发

### 方式 1：免安装直接双击查看（即开即用）
在项目根目录提供了 `index.html`：
- 直接在电脑中用 Chrome、Edge 或任意浏览器双击打开 `index.html` 即可预览完整视觉效果。
- 顶部贴心提供了调试工具栏，可勾选/取消勾选实时体验“原生广告位开启/关闭”、“顶部通告栏开启/关闭”时的动态排版表现。

### 方式 2：使用 Astro 本地开发服务
```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发热重载服务
npm run dev

# 3. 打包生产静态资源 (输出到 dist/ 目录)
npm run build

# 4. 本地预览打包产物
npm run preview
```

---

## 业务配置指引 (`src/config/site.ts`)

所有业务修改均集中在 `src/config/site.ts` 文件内：

### 1. 修改或增加产品（如 animaku / zakoway / 后续漫画端）
```typescript
products: [
  {
    id: 'animaku',
    name: 'animaku',
    type: 'web',
    badge: 'Web 网页在线端',
    subtext: '无需安装 · 即开即看',
    description: '全平台免安装在线追番站点...',
    features: ['1080P/4K 高清低延迟源', '实时弹幕与多格式字幕'],
    themeColor: '#00f2fe',
    primaryAction: { label: '立即进入 animaku 网页端', url: 'https://animaku.example.com' },
    secondaryActions: [
      { label: '备用线路 1', url: 'https://line1.animaku.example.com' }
    ]
  },
  // 想要新增产品，只需在数组内 push 一个新对象即可自动在前端生成对应卡片！
]
```

### 2. 广告与赞助位开关
```typescript
// 顶部通告栏广告
topNoticeBanner: {
  enabled: true, // 设为 false 即可隐藏
  tag: '赞助推荐',
  text: '二次元周边商城限时特惠...',
  url: 'https://sponsor.example.com',
  actionLabel: '前往查看'
},

// 原生卡片广告位（伪装在产品流中，带小号“赞助合作”角标，不破坏页面美感）
cardAds: [
  {
    id: 'ad-game-rpg',
    enabled: true, // 设为 false 即可隐藏，网格自动重新紧凑排列
    title: '某某二次元抽卡大作',
    description: '豪华声优阵容加盟...',
    tag: '赞助合作 · AD',
    targetUrl: 'https://game-sponsor.example.com'
  }
]
```

---

## 零成本一键部署指南

### 选项 A：部署到 Cloudflare Pages（强烈推荐）
1. 将当前项目推送到你个人的 GitHub 或 GitLab 私有/公开仓库。
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**。
3. 选择你的项目仓库，配置项如下：
   - **Framework preset**：`Astro`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
4. 点击 **Save and Deploy**，1分钟内即可部署完成并分配一个类似 `xxx.pages.dev` 的二级域名（可随时免费绑定自己的顶级域名）。

### 选项 B：部署到 GitHub Pages
本项目已内置 `.github/workflows/deploy.yml` 自动化工作流：
1. 推送代码至 GitHub 仓库的主分支（`main`）。
2. 在仓库页面点击 **Settings** → **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 选择 **`GitHub Actions`**。
4. 每次 push 代码，GitHub 会自动完成构建并自动发布。
