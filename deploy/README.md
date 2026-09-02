# 自建部署（Jellyfin 方案）

架构：**Jellyfin** 管存储/转码/进度同步，**nginx** 同源反代绕开 CORS，**儿童前端**是静态包。
全部跑在自家 NAS 上，纯内网，不用域名、不用备案。

```
家里设备 ── http://NAS内网IP:8080 ──► nginx(cv-web)
                                      ├─ /        → 儿童前端 dist/
                                      └─ /jf/*    → Jellyfin:8096（剥掉 /jf 前缀）
入库 CLI ── http://NAS内网IP:8096 ──► Jellyfin      写 media/<分类>/*.mp4
```

## 目录

```
deploy/
  docker-compose.yml
  nginx.conf.template   # ${JF_UPSTREAM} 由 compose 注入
  .env.example
  media/               # 片库根目录；1T 够放几千个 720p 视频
```

---

## 场景 A：NAS 上已经有 Jellyfin（TerraMaster / 群晖 应用中心）

只需要跑一个 nginx 容器，反代到现有 Jellyfin。

### 1. 把项目放到 NAS

在**笔记本**上：

```bash
npm install
npm run build          # 产出 dist/
```

把整个 `childvideo/` 目录（含 `dist/`）拷进 NAS 共享文件夹，例如 `/Volume1/docker/childvideo`
（TerraMaster 一般是 `/Volume1` 或 `/Volume-01`）。File Station 拖或 `rsync` 都行。

### 2. 起 nginx 容器

```bash
cd /Volume1/docker/childvideo/deploy
cp .env.example .env
```

编辑 `.env`，把 `JF_UPSTREAM` 指向现有 Jellyfin（用 NAS 的内网 IP，别用 127.0.0.1）：

```
WEB_PORT=8080
JF_UPSTREAM=http://192.168.1.50:8096      # ← 换成你 NAS 的内网 IP
```

- **TerraMaster**：应用中心装的 **Docker Manager** → 用「Compose」/「创建应用」导入 `docker-compose.yml`。
- 命令行能用就：`docker compose up -d`（`jellyfin` 服务在 `bundled` profile 里，不加 `--profile bundled` 不会启动，正好）。

> NAS 的 80/443 被管理界面占用，儿童端走 `8080`；被占就改 `.env` 里 `WEB_PORT`。

### 3. 在现有 Jellyfin 里建儿童库和账号

浏览器开你现在的 `http://NAS内网IP:8096`：

1. **准备一个儿童片库目录**。在现有 Jellyfin **已经映射进容器**的某个路径下建子目录，
   例如宿主 `/Volume1/video/kids`（容器里对应 `/媒体/kids` 之类）。
   记住这个**宿主路径**，第 6 步 `ingest` 的 `MEDIA_ROOT` 就填它。
   （不确定现有映射：Jellyfin 控制台 → 控制台 → 媒体库 里看已有库的路径。）
2. **新建媒体库**：类型「家庭视频」（Home videos），文件夹选第 1 步那个目录。
   - 库设置 → 元数据：勾 **Nfo** 保存器，并把 **Nfo** 拉到「元数据下载器」最前
     （这样入库 CLI 写的 `<genre>` 才会当成分类）。
3. **新建用户** `kid`：取消全部管理权限；「媒体库访问」只勾儿童库；关掉「允许媒体下载」。
4. **生成 API Key**：控制台 → API 密钥 → 新建。
5. 记 **用户 ID**：控制台 → 用户 → 点开 `kid`，地址栏 `userId=` 后面那串。
6. （可选）记 **媒体库 ID**：点开该库编辑，地址栏 `id=` 那串。留空则读 `kid` 能看到的全部库。

### 4. 配前端并重建

回**笔记本**项目根目录：

```bash
cp .env.example .env
```

编辑 `.env`：

```
VITE_SOURCE=jellyfin
VITE_JELLYFIN_BASE=/jf
VITE_JELLYFIN_KEY=<第3步-4 的 API Key>
VITE_JELLYFIN_USER_ID=<第3步-5 的用户 ID>
VITE_JELLYFIN_LIBRARY_ID=<第3步-6 的库 ID，可留空>
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
#   JELLYFIN_TOKEN= 第3步-4 的 API Key
#   MEDIA_ROOT    = 第3步-1 那个儿童片库的宿主路径（SMB 挂载到笔记本，或 SSH 进 NAS 跑）
node ingest.mjs check
node ingest.mjs add "https://www.bilibili.com/video/BVxxxx" -c 动画 -t "小兔子的一天 第1集"
node ingest.mjs add ./local.mp4 -c 儿歌 --copy
```

`-c` 是分类（`genre` 模式下写进 NFO 的 `<genre>`，前端据此分行）。
标题带「第N集 / EpN」会自动识别为同系列，支持「自动播下一集」。

---

## 场景 B：NAS 上还没有 Jellyfin

用 compose 把 Jellyfin 一起起。步骤同场景 A，差别只在：

```bash
cd deploy && cp .env.example .env
#   JF_UPSTREAM 保持默认 http://jellyfin:8096
#   JELLYFIN_BIND=0.0.0.0:8096   （内网可直连管理台）
mkdir -p media jellyfin/config jellyfin/cache

docker compose --profile bundled up -d      # ← 注意 --profile bundled
```

- 儿童片库目录固定是 `deploy/media`（已挂进容器 `/media`）；第 3 步媒体库文件夹填 `/media`，
  `ingest` 的 `MEDIA_ROOT` 填宿主的 `.../deploy/media`。
- 其余（建库 / 建 kid / API Key / 填前端 `.env` / build / 回拷）与场景 A 完全一致。

## 想在外面也能看

不折腾域名 / 备案的做法：**Tailscale**（或 WireGuard）。NAS 装 Tailscale，手机也装，
用 tailnet IP `http://100.x.x.x:8080/` 访问，等于随身把家里内网带在身上。

## 其它说明

- **改了 `.env` 里的 `JF_UPSTREAM` / `WEB_PORT`**：要 `docker compose up -d --force-recreate web`
  才生效（只 `restart` 不会重读环境变量）。只换了 `dist/` 文件则 `restart web` 就够。
- **502 / 界面加载不出**：多半是 `JF_UPSTREAM` 不对。在 NAS 上 `docker exec cv-web wget -qO- $JF_UPSTREAM/System/Info`
  能通才行；用 NAS 内网 IP，不要用 `127.0.0.1`（那是容器自己）。
- **场景 B 升级 Jellyfin**：改 `docker-compose.yml` 镜像 tag，`docker compose --profile bundled pull && up -d`。
- **1T 容量**：720p 儿童视频一个约 200–500MB，1T 放几千个没问题。想更省用 `ingest add --height 480`。
- **Token 暴露**：`VITE_JELLYFIN_KEY` 会打进前端 JS。纯内网无所谓；真要对公网严格隔离，
  在 nginx 后加个极薄代理注入 Token，浏览器侧不带 Key。
- **公网访问**：优先 Tailscale（上面那节）。非要域名裸奔，`cv-web` 前面套一层 HTTPS（Caddy / 云 SLB），
  `/jf/web`、`/jf/dashboard` 已在 nginx 里 404。
