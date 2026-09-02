# 自建部署（Jellyfin 方案）

架构：**Jellyfin** 管存储/转码/进度同步，**nginx** 同源反代绕开 CORS，**儿童前端**是静态包。
全部跑在自家 NAS 上，纯内网，不用域名、不用备案。

```
家里设备 ── http://NAS内网IP:8080 ──► nginx(cv-web)
                                      ├─ /        → 儿童前端 dist/
                                      └─ /jf/*    → cv-jellyfin:8096（剥掉 /jf 前缀）
入库 CLI ── http://NAS内网IP:8096 ──► cv-jellyfin   写 media/<分类>/*.mp4
```

## 目录

```
deploy/
  docker-compose.yml
  nginx.conf
  .env.example        # WEB_PORT / JELLYFIN_BIND / PUID / PGID / TZ
  media/              # 片库根目录，挂到 Jellyfin 只读的 /media；1T 够放几千个视频
  jellyfin/config/    # 容器自动生成
  jellyfin/cache/
```

---

## 家庭 NAS 步骤

### 1. 把项目放到 NAS

在**笔记本**上（NAS 一般没顺手的 Node 环境）：

```bash
npm install
npm run build          # 产出 dist/
```

把整个 `childvideo/` 目录（含 `dist/`）拷进 NAS 的共享文件夹，例如
`/volume1/docker/childvideo`（群晖）。用 File Station 拖、或 `rsync -a childvideo/ nas:/volume1/docker/childvideo/`。

### 2. 起容器

```bash
cd /volume1/docker/childvideo/deploy
cp .env.example .env          # 默认 WEB_PORT=8080、JELLYFIN_BIND=0.0.0.0:8096 就适合 NAS
mkdir -p media jellyfin/config jellyfin/cache
```

- **群晖**：Container Manager → 项目 → 新增 → 选这个 `docker-compose.yml`。
- **威联通**：Container Station → 应用程序 → 从 docker-compose 建立。
- 命令行能用就 `docker compose up -d`。

> NAS 的 80/443 被管理界面占用，所以儿童端走 `8080`。若 8080 也被占，改 `.env` 里 `WEB_PORT`。

### 3. Jellyfin 首次设置

内网直接开 `http://NAS内网IP:8096`（`JELLYFIN_BIND=0.0.0.0:8096` 已放开）：

1. **新建媒体库**：类型「家庭视频」（Home videos），文件夹填 `/media`。
   - 库设置 → 元数据：勾 **Nfo** 保存器，并把 **Nfo** 拉到「元数据下载器」最前
     （这样入库 CLI 写的 `<genre>` 才会当成分类）。
2. **新建用户** `kid`：取消全部管理权限；「媒体库访问」只勾儿童库；关掉「允许媒体下载」。
3. **生成 API Key**：控制台 → API 密钥 → 新建。
4. 记 **用户 ID**：控制台 → 用户 → 点开 `kid`，地址栏 `userId=` 后面那串。
5. （可选）记 **媒体库 ID**：点开该库编辑，地址栏 `id=` 那串。留空则读 `kid` 能看到的全部库。

### 4. 配前端并重建

回**笔记本**项目根目录：

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
npm run build
```

把新的 `dist/` 回拷到 NAS 同一目录，然后在 NAS 上 `docker compose restart web`（或容器界面重启 `cv-web`）。

> `.env` 里的值是**构建时**注入的，以后每次改 `.env` 都要重新 `npm run build` + 回拷。一般设一次就不动了。

### 5. 用起来

家里任意设备浏览器开 `http://NAS内网IP:8080/` 就是儿童界面，"添加到主屏幕"当 App 用。
家长设置（时长上限、就寝锁定、分类白名单、按年龄过滤）在前端，存浏览器本地；
播放进度 / 续播同步回 Jellyfin，换设备接着看。

### 6. 加内容

见 [`../tools/ingest`](../tools/ingest)。在笔记本上跑（媒体目录用 SMB 挂载，或直接 SSH 到 NAS 上跑）：

```bash
cd tools/ingest
cp .ingestrc.example.json .ingestrc.json
#   JELLYFIN_URL  = http://NAS内网IP:8096
#   JELLYFIN_TOKEN= 第3步的 API Key
#   MEDIA_ROOT    = NAS 上 deploy/media 的路径（SMB 挂载点，或 NAS 本地路径）
node ingest.mjs check
node ingest.mjs add "https://www.bilibili.com/video/BVxxxx" -c 动画 -t "小兔子的一天 第1集"
node ingest.mjs add ./local.mp4 -c 儿歌 --copy
```

`-c` 是分类（`genre` 模式下写进 NFO 的 `<genre>`，前端据此分行）。
标题带「第N集 / EpN」会自动识别为同系列，支持「自动播下一集」。

---

## 想在外面也能看

不折腾域名 / 备案的做法：**Tailscale**（或 WireGuard）。NAS 装 Tailscale，手机也装，
用 tailnet IP `http://100.x.x.x:8080/` 访问，等于随身把家里内网带在身上。

## 其它说明

- **升级 Jellyfin**：改 `docker-compose.yml` 镜像 tag，`docker compose pull && up -d`。
- **1T 容量**：720p 儿童视频一个约 200–500MB，1T 放几千个没问题。想省空间用 `ingest add --height 480`。
- **Token 暴露**：`VITE_JELLYFIN_KEY` 会打进前端 JS。纯内网无所谓；真要对公网严格隔离，
  在 nginx 后加个极薄代理注入 Token，浏览器侧不带 Key。
- **公网服务器部署**（非 NAS）：`.env` 里 `JELLYFIN_BIND=127.0.0.1:8096`，管理台走
  `ssh -L 8096:localhost:8096 user@server`；`cv-web` 前面再套一层 HTTPS（Caddy / 云 SLB）。
  `/jf/web`、`/jf/dashboard` 已在 nginx 里 404。
