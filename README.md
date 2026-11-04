# ZAKOWAY HUB - 二次元官方发布页与主导航枢纽

专为二次元项目 **`animaku (杂口动漫)`** 网页端与 **`zakoway`** 客户端打造的现代化官方发布与主导航落地页系统。

✨ **核心特性**：
- **静态零服务端架构**：基于现代前端静态网站生成器 **Astro**，构建产物为纯静态文件，完美适配 **Cloudflare Pages** 与 **GitHub Pages**（全球 Anycast CDN 加速、自带防 DDoS 与免费 SSL）。
- **配置驱动架构 (Config-Driven)**：页面视觉与业务数据彻底解耦，后续增加新产品（漫画/小说/社区）、调整线路或开启/关闭广告位，只需编辑 `src/config/site.ts` 配置文件，无需修改排版代码。
- **现代化暗黑二次元视觉**：高透毛玻璃拟态（Glassmorphism）、微渐变光晕背景、支持明暗主题切换。
- **SEO 深度优化**：预置 TDK、二次元高频引流关键词、社交分享卡片（Open Graph & Twitter Card）与 Schema 软件结构化微数据。
- **防失联与备用线路**：内置一键复制官方主线、备用 CDN 线路与官方 TG / GitHub 社区入口。
- **原生广告/赞助位预留**：提供与原生卡片融为一体的原生卡片广告位、顶部通告栏及底部赞助商 Logo 墙，均支持独立一键开关。

---

## 本地开发与打包

```bash
# 1. 安装项目依赖
npm install

# 2. 启动本地开发热重载服务 (访问 http://127.0.0.1:4321)
npm run dev

# 3. 本地打包静态产物 (输出到 dist/ 目录，耗时约 600ms)
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
    name: 'animaku (杂口动漫)',
    type: 'web',
    badge: 'Web 网页在线端',
    subtext: '无需安装 · 即开即看',
    description: '在线弹幕追番web平台...',
    features: ['多源聚合和在线播放', '实时的多平台弹幕'],
    themeColor: '#00f2fe',
    primaryAction: { label: '立即进入 杂口动漫 网页端', url: 'https://web.zakoway.com/' },
    secondaryActions: [
      { label: '备用线路', url: 'https://bakasine.eu.org/' }
    ]
  },
  // 想要新增产品，只需在数组内追加一个对象即可自动在前端生成对应卡片！
]
```

### 2. 广告与赞助位开关
```typescript
// 顶部通告栏广告（设 enabled: false 即可完全隐藏）
topNoticeBanner: {
  enabled: false,
  tag: '赞助推荐',
  text: '二次元周边商城限时特惠...',
  url: 'https://sponsor.example.com',
  actionLabel: '前往查看'
},

// 原生卡片广告位（伪装在产品流中，带小号“赞助合作”角标，不破坏页面美感）
cardAds: [
  {
    id: 'ad-game-rpg',
    enabled: false, // 设为 false 自动隐藏，产品卡片会自动重排，不留空隙
    title: '某某二次元抽卡大作',
    description: '豪华声优阵容加盟...',
    tag: '赞助合作 · AD',
    targetUrl: 'https://game-sponsor.example.com'
  }
]
```

### 3. 模块显隐控制
```typescript
showMockupStage: false,        // 设为 false 隐藏产品实机视窗展台（有截图时改为 true 即可）
showFuturePlaceholder: false,  // 设为 false 隐藏“更多生态正在孵化”卡片
```

---

## 零成本部署到 Cloudflare Pages

Cloudflare Pages 拥有全球优质 CDN 节点与强大的抗 DDoS 攻击能力，非常适合二次元发布页。

### 推荐方案 A：直接打包上传（无需授权 GitHub，最隐私安全）

如果你不想给 Cloudflare 授权 GitHub 账号权限，直接上传本地打包好的 `dist/` 文件夹即可：

#### 步骤 1：本地执行打包
```bash
npm run build
```
打包完成后会在根目录下生成 `dist/` 文件夹。

#### 步骤 2：网页端拖拽上传
1. 打开并登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 左侧点击 **Workers 和 Pages (Workers & Pages)**。
3. 点击 **创建应用程序 (Create application)**。
4. 选择 **Pages** 标签，点击右侧的 **直接上传 (Upload assets)**（不要点“连接到 Git”）。
5. 输入项目名称（如 `zakoway-web`），点击 **创建项目**。
6. 将电脑里的 **`dist` 文件夹直接拖拽入虚线框中**。
7. 点击 **部署站点 (Deploy site)**，约 5 秒内即可完成全球部署并分配一个 `*.pages.dev` 域名。

#### 步骤 3（可选）：使用命令行一键部署
后续更新如果不想每次打开网页拖拽，可直接在终端运行 Cloudflare 官方 CLI 工具：
```bash
# 打包并自动推送到 Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name zakoway-web
```

---

### 备选方案 B：关联 GitHub 仓库自动部署（推送自动更新）

如果你希望每次 `git push` 代码后 Cloudflare 自动完成编译与发布：
1. 打开 [Cloudflare 控制台](https://dash.cloudflare.com/) → **Workers 和 Pages** → **创建应用程序** → **Pages** → **连接到 Git**。
2. 授权并选择你的 GitHub 仓库（`uerax/zakoway-web`）。
3. 配置参数：
   - **Framework preset (框架预设)**：选择 **`Astro`**
   - **Build command (构建命令)**：`npm run build`
   - **Build output directory (输出目录)**：`dist`
   - **Environment variables (环境变量)**：添加 `NODE_VERSION` = `20`
4. 点击 **保存并部署** 即可。

---

### 备选方案 C：部署到 GitHub Pages

项目已内置 `.github/workflows/deploy.yml` 自动化工作流：
1. 将代码推送到 GitHub 仓库的 `master` 分支。
2. 在仓库页面点击 **Settings** → **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 选择 **`GitHub Actions`**。
4. 每次 push 代码，GitHub 会自动完成构建并发布。

---

## 自定义域名绑定

无论使用哪种部署方案，在 Cloudflare Pages 项目后台中点击 **自定义域 (Custom domains)** → **设置自定义域**，填入你的主域名（例如 `zakoway.com` 或 `hub.zakoway.com`），Cloudflare 会自动完成 DNS 解析配置并自动签发免费 SSL 证书。
