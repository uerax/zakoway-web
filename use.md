# ZAKOWAY HUB - 二次元官方发布页与主导航枢纽

专为二次元项目 **`扎口动漫`** 网页端与 **`zakoway`** 客户端打造的现代化官方发布与主导航落地页系统。

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

### 1. 修改或增加产品（如 扎口动漫 / zakoway / 后续漫画端）
```typescript
products: [
  {
    id: 'animaku',
    name: '扎口动漫',
    type: 'web',
    badge: 'Web 网页在线端',
    subtext: '无需安装 · 即开即看',
    description: '在线弹幕追番web平台...',
    features: ['多源聚合和在线播放', '实时的多平台弹幕'],
    themeColor: '#00f2fe',
    primaryAction: { label: '立即进入 扎口动漫 网页端', url: 'https://zakoway.com/' },
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

### 4. 吉祥物 / 看板娘台词与语音配置 (`src/config/mascot.ts`)
- **双模运作（在线优先 + 本地兜底）**：
  * **在线实时反代**：部署到 Cloudflare Pages 时，会自动启用 `functions/meme/random.ts` 边缘函数，实时拉取 `https://sbhzm.cn/` 当天最新发布的烂梗（走专用 `/meme/random` 路由，彻底避开默认 `/api/` 缓存规则）。
  * **本地全量兜底**：内置 **191 条全量语音** 与 **136 条精选经典烂梗**（位于 `src/data/sbhzm-fallback.json`），0 延迟瞬时加载，断网或离线秒级回退。
  * **点击发声**：点击看板娘随机播放语音（包含语音标题动态提示），音量严格设为 **50%**。
  * **一键更新词库与语音**：可在终端运行 `npm run update:sbhzm` 自动爬取同步最新数据。
- **公共 API 开放接口 (`GET /meme/random`)**：
  * 支持跨域 CORS (`*`)，彻底绕开 `/api/` 缓存，可供手机端 App、小程序或外部系统随时调用：
  * 返回格式：`{ "quote": "语录文本", "voice": { "title": "...", "url": "https://..." }, "volume": 0.5 }`
- **Cloudflare Pages 环境变量修改**：
  若在 Cloudflare Pages 设置了 `PUBLIC_MASCOT_QUOTES`，优先展示您自定义的专属台词。


---

## ⚡ Cloudflare Pages 环境变量快速自定义（紧急换源/改名/发通知）

项目原生支持通过 **Cloudflare Pages 环境变量**在后台直接修改备用链接、主站域名、站点标题、标语及紧急通知，**改完后点击重新部署即可秒级生效，无需拉取或修改任何本地代码**！

进入 Cloudflare Pages 项目后台 $\rightarrow$ **Settings** $\rightarrow$ **Environment variables** 添加以下变量：

| 变量名称 | 作用说明 | 示例 / 说明 |
| :--- | :--- | :--- |
| **`PUBLIC_MAIN_URL`** | **官方主线域名** | `https://zakoway.com/`（自动同步主线卡片、网页端进入按钮与 SEO 链接） |
| **`PUBLIC_BACKUP_URL`** | **官方备用线路** | `https://bakasine.eu.org/`（自动同步备用线路列表与卡片按钮） |
| **`PUBLIC_BACKUP_LINES`** | **全量自定义线路列表** | 支持每行一条 `线路名称\|链接`，或者 JSON 数组（随时追加第3条、第4条线路） |
| **`PUBLIC_APP_DOWNLOAD_URL`** | **客户端下载地址** | `https://github.com/uerax/zakoway/releases` |
| **`PUBLIC_SITE_TITLE`** | **网站页面标题** | `扎口动漫 - 在线播放与客户端下载 ｜ 高清追番` |
| **`PUBLIC_SITE_DESCRIPTION`**| **网站 SEO 描述** | 自定义搜索引擎展示简介 |
| **`PUBLIC_BRAND_NAME`** | **品牌名称** | `扎口动漫` |
| **`PUBLIC_BRAND_SLOGAN`** | **Hero 首页标语** | `连接你的 二次元世界` |
| **`PUBLIC_BRAND_DESCRIPTION`**| **Hero 介绍文案** | `在线弹幕追番平台，支持在线观看...` |
| **`PUBLIC_PILL_TEXT`** | **首页徽章文字** | `官方认证` 或 `2026 最新线路` |
| **`PUBLIC_TOP_NOTICE`** | **顶部紧急通知横幅** | 只要填入文字，**顶部通知栏会自动开启展示**！留空则隐藏 |
| **`PUBLIC_TOP_NOTICE_URL`** | **顶部通知跳转链接** | 点击通知后跳转的地址 |
| **`PUBLIC_TELEGRAM_URL`** | **Telegram 社群群聊** | `https://t.me/zakoway_chat` |
| **`PUBLIC_GITHUB_URL`** | **GitHub 地址** | `https://github.com/uerax` |
| **`PUBLIC_MASCOT_QUOTES`** | **吉祥物看板娘台词** | 每行一句，或分号隔开 |

> 💡 **小贴士**：
> 例如当遇到主站域名被污染时，只需要在 Cloudflare 环境变量里把 `PUBLIC_MAIN_URL` 改成新域名，然后在 **Deployments** 页面点击 **Retry deployment**，整站的导航与按钮瞬间全部切换为新主线！



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
