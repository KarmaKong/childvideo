# 自建部署（Jellyfin 方案）

架构：**Jellyfin** 管存储/转码/进度同步，**nginx** 同源反代绕开 CORS，**儿童前端**是静态包。
所有东西跑在你自己的国内服务器 / NAS 上，网络无障碍。

```
浏览器 ── https://your-domain ──► nginx(cv-web:80)
                                   ├─ /            → 儿童前端 dist/
                                   └─ /jf/*        → cv-jellyfin:8096（剥掉 /jf 前缀）
入库 CLI(host) ── http://localhost:8096 ──► cv-jellyfin      写 ./media/<分类>/*.mp4
```

## 目录

```
deploy/
  docker-compose.yml
  nginx.conf
  .env.example        # PUID/PGID/TZ
  media/              # 你自己建；挂到 Jellyfin 只读的 /media
  jellyfin/config/    # 容器自动生成
  jellyfin/cache/
```

## 步骤

### 1. 起服务

```bash
cd deploy
cp .env.example .env
mkdir -p media jellyfin/config jellyfin/cache
docker compose up -d
```

`cv-jellyfin` 的 8096 只绑在 `127.0.0.1`，公网访问不到。

### 2. Jellyfin 首次设置（走 SSH 隧道）

```bash
ssh -L 8096:localhost:8096 user@你的服务器
# 浏览器打开 http://localhost:8096
```

在管理台里：

1. **新建媒体库**：类型选「家庭视频」（Home videos），文件夹填 `/media`。
   - 进「库设置 → 元数据保存器」勾上 **Nfo**，并把 **Nfo** 拉到元数据读取器最前面
     （这样入库 CLI 写的 `<genre>` 才会被当成分类）。
2. **新建用户** `kid`：
   - 取消所有管理权限；「媒体库访问」只勾刚建的儿童库；
   - 关掉「允许媒体下载」「允许远程连接」。
3. **生成 API Key**：管理 → API 密钥 → 新建，应用名随便填。
4. 记下 **用户 ID**：管理 → 用户 → 点开 `kid`，浏览器地址栏 `userId=` 后面那串。
5. （可选）记下**媒体库 ID**：点开该库编辑，地址栏 `id=` 那串；不填则前端读取 `kid` 能看到的全部库。

### 3. 配置并构建前端

回项目根目录：

```bash
cp .env.example .env
```

编辑 `.env`：

```
VITE_SOURCE=jellyfin
VITE_JELLYFIN_BASE=/jf
VITE_JELLYFIN_KEY=<第3步的 API Key>
VITE_JELLYFIN_USER_ID=<第4步的用户 ID>
VITE_JELLYFIN_LIBRARY_ID=<第5步的库 ID，可留空>
VITE_JELLYFIN_CATEGORY_MODE=genre
VITE_JELLYFIN_STREAM=direct
```

```bash
npm run build          # 产物 dist/ 被 cv-web 挂载
cd deploy && docker compose restart web
```

打开 `http://你的服务器` 就是儿童界面。家长设置（时长上限、就寝锁定、分类白名单、
按年龄过滤）在前端，数据存浏览器本地；播放进度 / 续播会同步回 Jellyfin，换设备继续看。

### 4. 加内容

见 [`../tools/ingest`](../tools/ingest)。示例：

```bash
cd tools/ingest
cp .ingestrc.example.json .ingestrc.json   # 填 JELLYFIN_URL/TOKEN/MEDIA_ROOT
node ingest.mjs check
node ingest.mjs add "https://www.bilibili.com/video/BVxxxx" -c 动画 -t "小兔子的一天 第1集"
node ingest.mjs add ./local.mp4 -c 儿歌 --copy
```

`-c` 是分类；`genre` 模式下它写进 NFO 的 `<genre>`，前端据此分行展示。
标题里带「第N集 / EpN」的，前端会自动识别为同系列并支持「自动播下一集」。

## 生产注意

- **HTTPS**：本 compose 只有 80。前面再套 Caddy / 云 SLB / Nginx+证书。
- **管理台加固**：`/jf/web`、`/jf/dashboard` 已在 nginx 里 404。日常管理走 SSH 隧道。
- **Token 暴露**：`VITE_JELLYFIN_KEY` 会打进前端 JS，家庭内网可接受。要对公网严格隔离，
  就在 nginx 后加一个极薄代理，由它注入 Token，浏览器侧不带 Key。
- **OSS 当冷存储**：把 `deploy/media` 用 `ossfs`/`rclone mount` 挂成阿里云 OSS / 腾讯 COS 目录即可；
  为避免转码时随机 seek 卡顿，入库时就用 `ingest add`（默认转成 web 友好 mp4）走 direct play。
- **升级 Jellyfin**：改 `docker-compose.yml` 里的镜像 tag，`docker compose pull && up -d`。
