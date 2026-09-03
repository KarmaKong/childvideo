# 小小影院 · 儿童视频播放器

面向儿童的 Web 视频播放器，预置精选片库。两种数据源，切 `.env` 里的 `VITE_SOURCE` 即可，
页面代码不变：

| 数据源 | 片库与存储 | 进度同步 | 适合 |
|---|---|---|---|
| `static`（默认） | `catalog.json` + 对象存储 / CDN（阿里云 OSS、腾讯云 COS、七牛，不绑定厂商） | 浏览器本地 | 纯静态托管、零后端 |
| `jellyfin` | 自建 Jellyfin 的「儿童」媒体库 | 回写 Jellyfin，多设备继续看 | 有一台 NAS / 服务器，见 [`deploy/`](deploy/) |

数据源抽象在 [`src/lib/source/`](src/lib/source/)：`CatalogSource` 接口 + `StaticSource` / `JellyfinSource` 两实现。

**配置有两层**：`npm run dev` / `npm run build` 用根目录 `.env`（`VITE_*`）；
正式部署用 [`deploy/config.json`](deploy/config.example.json)（浏览器启动时 fetch，运行时生效，改完不用重新打包）。
`config.json` 优先，缺省回退 `.env`。NAS 部署时前端在容器内构建（`Dockerfile.web`），NAS 本身不用装 Node。

## 特性

- **儿童模式界面**：大色块卡片、大点击区、极少文字
- **精选片库**：按分类浏览（儿歌 / 动画 / 科普 / 故事…）
- **播放页**：自绘大控件、进度记忆、锁屏防误触、系列自动播下一集、看完推荐
- **家长锁**：随机算术题（或 4 位 PIN）验证才能进入家长设置
- **家长控制**：每日观看时长上限、到点锁定、分类白名单、按年龄过滤、自动续播开关
- **本地数据**：观看进度 / 继续观看 / 收藏，存于浏览器 `localStorage`
  （多设备同步为 v2，可接 LeanCloud 国内版或自建后端）

## 技术栈

Vite + React + TypeScript + Tailwind CSS + React Router + Zustand，`hls.js` 按需加载支持 HLS。
产物为纯静态文件，可直接部署到对象存储静态托管或任意国内主机。

## 本地开发

```bash
npm install
npm run dev
```

`public/media/*.mp4` 为 ffmpeg 生成的占位测试片，仅供本地预览，请替换为真实内容。

## 方案 A：static 源（对象存储 / CDN）

复制 `.env.example` 为 `.env` 并填写：

```
VITE_SOURCE=static
VITE_CDN_BASE=https://cdn.example.com/childvideo   # 资源根地址，末尾不要带斜杠
VITE_CATALOG_PATH=catalog.json                     # 片库目录文件名（可选）
VITE_PUBLIC_BASE=/                                  # 部署到子路径时改，如 /childvideo/
```

- `catalog.json` 里视频的 `src` / `poster` 写**相对路径**（相对 `VITE_CDN_BASE`），
  或直接写 `https://` 绝对地址。
- 未设置 `VITE_CDN_BASE` 时，一切相对 `public/` 解析（当前示例即此模式）。

### 目录结构（对象存储桶内）

```
childvideo/
  catalog.json
  media/
    bunny1.mp4
    ...
  posters/
    bunny1.jpg        # 可选，缺省用标题生成的彩色占位图
```

## 片库目录格式 `catalog.json`

```jsonc
{
  "version": 1,
  "categories": [
    { "id": "cartoon", "name": "动画", "icon": "🐰", "color": "#4dabf7" }
  ],
  "videos": [
    {
      "id": "bunny1",
      "title": "小兔子的一天 第1集",
      "category": "cartoon",       // 对应 categories[].id
      "src": "media/bunny1.mp4",   // 相对 CDN_BASE 或 http(s) 绝对地址
      "kind": "mp4",               // 可选，缺省按后缀推断（.m3u8 -> hls）
      "poster": "posters/bunny1.jpg", // 可选
      "duration": 480,             // 秒，用于显示时长与进度
      "series": "bunny",           // 可选，同 series + episode 实现自动下一集
      "episode": 1,
      "minAge": 3                  // 可选，家长「按年龄过滤」用
    }
  ]
}
```

## 构建与部署

```bash
npm run build           # 产物在 dist/
```

把 `dist/` 上传到静态托管即可。若托管不支持 SPA 回退（history 路由），
将 404 页指向 `index.html`，或把 `VITE_PUBLIC_BASE` 设为实际子路径。

### 上传到阿里云 OSS（示例）

```bash
# 需先安装并配置 ossutil
ossutil cp -r dist/ oss://your-bucket/childvideo/ --update
# 视频与封面
ossutil cp -r media/ oss://your-bucket/childvideo/media/ --update
```

腾讯云 COS 用 `coscmd`，七牛用 `qshell`，命令类似。建议为存储桶挂 CDN 域名并开启
视频防盗链 / Range 回源。

## 方案 B：jellyfin 源（自建媒体服务器）

Jellyfin 管存储 / 转码 / 封面刮削 / 进度同步，nginx 同源反代绕开 CORS，前端只是静态包。
家长控制（时长上限、就寝锁定、分类白名单、按年龄过滤）仍在前端。

- **从零到孩子能看的完整执行手册（交给 agent 跑）**：见 [`deploy/RUNBOOK.md`](deploy/RUNBOOK.md)
  ——已有 Jellyfin，端到端：建 kid 用户/Key → 起 cv-web → 加内容 → 孩子设备接入
- 一键起服务、Jellyfin 首次设置、`config.json` 填法：见 [`deploy/README.md`](deploy/README.md)
- 连 Jellyfin 一起起（NAS 上没有 Jellyfin 时）的 agent 清单：见 [`deploy/HANDOFF.md`](deploy/HANDOFF.md)
- 往库里加内容（yt-dlp / 本地文件 → ffmpeg → 落库 → 触发扫描）：见 [`tools/ingest/README.md`](tools/ingest/README.md)

```
浏览器 ─► nginx ─┬─ /            → 儿童前端 dist/
                 ├─ /config.json → deploy/config.json（运行时配置）
                 └─ /jf/*        → Jellyfin
```

`deploy/config.json` 关键项：`source: "jellyfin"`、`jellyfin.key`、`jellyfin.userId`、
`jellyfin.categoryMode`（`genre` 用视频 Genre 当分类，入库 CLI 会写好）、
`jellyfin.stream`（`direct` 直连 / `hls` 让 Jellyfin 转码）。改完 `docker compose restart web` 即生效。

本地对接远端 Jellyfin 开发时，`.env` 里设 `VITE_JELLYFIN_ORIGIN=http://host:8096`，dev server 会把 `/jf` 代理过去。

## 后续（v3 建议）

- 家长设置也上云（Jellyfin 自定义 DisplayPreferences 或独立小服务），换设备同步限额
- 视频转码为 HLS 多码率，弱网自适应
- Service Worker 缓存「最近观看」离线可看
- 内容审核后台，上架/下架精选片
