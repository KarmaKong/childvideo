# 小小影院 · 儿童视频播放器

面向儿童的 Web 视频播放器，预置精选片库，视频与封面托管在**国内可用的对象存储 / CDN**
（阿里云 OSS、腾讯云 COS、七牛云均可，不绑定厂商）。

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

## 配置对象存储 / CDN

复制 `.env.example` 为 `.env` 并填写：

```
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

## 后续（v2 建议）

- 家长账号 + 多设备同步（LeanCloud 国内版 / 自建 Node + MySQL）
- 视频转码为 HLS 多码率，弱网自适应
- Service Worker 缓存「最近观看」离线可看
- 内容审核后台，上架/下架精选片
