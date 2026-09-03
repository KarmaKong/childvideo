# 自建部署（Jellyfin 方案）

**Jellyfin** 管存储/转码/进度同步，**nginx** 同源反代绕开 CORS，**儿童前端**是预构建静态包。
全部跑在自家 NAS 上，纯内网，不用域名、不用备案。

```
家里设备 ── http://NAS内网IP:8080 ──► nginx(cv-web)
                                      ├─ /            → 儿童前端（容器内构建）
                                      ├─ /config.json → 运行时配置（挂载 deploy/config.json）
                                      └─ /jf/*        → Jellyfin:8096（剥掉 /jf 前缀）
入库 CLI ── http://NAS内网IP:8096 ──► Jellyfin       写 media/<分类>/*.mp4
```

两个关键点，省掉了在 NAS 上装 Node / 反复打包：

- `cv-web` 是**多阶段镜像**（[`Dockerfile.web`](Dockerfile.web)）：`docker compose ... --build` 会在容器里
  用 Node 打包前端，NAS 本身不用装 Node。
- Jellyfin 的 Key / userId 写在 **`deploy/config.json`**（运行时读取），改完 `docker compose restart web` 即生效，**不用重建镜像**。

## 目录

```
deploy/
  docker-compose.yml
  Dockerfile.web          # 多阶段：Node 构建前端 → nginx
  nginx.conf.template     # ${JF_UPSTREAM} 由 compose 注入
  .env.example            # WEB_PORT / JF_UPSTREAM / JELLYFIN_BIND / PUID / PGID / TZ
  config.example.json     # 复制成 config.json 填 Key/userId
  media/                  # 片库根目录；1T 够放几千个 720p 视频
```

---

## 场景 B：NAS 上还没有 Jellyfin —— 一起起（推荐，全在 NAS）

> 交给 agent 执行的完整手册见 [RUNBOOK.md](RUNBOOK.md)。

### 1. 仓库放到 NAS

把 `childvideo/` 目录放进 NAS，例如 `/Volume1/docker/childvideo`
（TerraMaster 一般 `/Volume1`，也可能 `/Volume-1`）。File Station 拖，或：

```bash
rsync -av --exclude node_modules --exclude dist --exclude .env --exclude deploy/config.json \
  childvideo/ <nas用户>@<NAS内网IP>:/Volume1/docker/childvideo/
```

### 2. 起容器

```bash
cd /Volume1/docker/childvideo/deploy
cp .env.example .env          # 默认值已适合 NAS；PUID/PGID 填 NAS 上 `id` 的结果
cp config.example.json config.json
mkdir -p media jellyfin/config jellyfin/cache

docker compose --profile bundled up -d --build   # --build 在容器里打包前端（首次 1–3 分钟）
```

TerraMaster 也可在 **应用中心 → Docker** 里导入 `docker-compose.yml`（记得启用 `bundled` profile）。

> NAS 的 80/443 被管理界面占用，儿童端走 `8080`；被占改 `.env` 的 `WEB_PORT`。

### 3. Jellyfin 首次设置

浏览器开 `http://NAS内网IP:8096`：

1. 首次向导建管理员账号（语言选中文）。
2. **控制台 → 媒体库 → 添加媒体库**：内容类型「家庭视频」，文件夹填 `/media`。
   展开「高级」勾 **Nfo** 元数据保存器并拖到最前（入库 CLI 写的 `<genre>` 才会当分类）。
3. **控制台 → 用户 → 新建** `kid`：取消全部管理权限，「媒体库访问」只勾儿童库，关「允许媒体下载」。
4. **控制台 → API 密钥 → 新建**，复制 **Key**。
5. **控制台 → 用户 → 点开 `kid`**，地址栏 `userId=` 后面那串是 **用户 ID**。

### 4. 填运行时配置

编辑 `/Volume1/docker/childvideo/deploy/config.json`：

```json
{
  "source": "jellyfin",
  "appName": "小小影院",
  "jellyfin": {
    "base": "/jf",
    "key": "<第4步的 API Key>",
    "userId": "<第5步的用户 ID>",
    "libraryId": "",
    "categoryMode": "genre",
    "stream": "direct"
  }
}
```

```bash
cd /Volume1/docker/childvideo/deploy && docker compose restart web
```

验证：`curl -s http://localhost:8080/config.json` 回显你写的内容；
`curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/jf/System/Info/Public` 是 200。

### 5. 用起来

家里任意设备开 `http://NAS内网IP:8080/`，"添加到主屏幕"当 App。
家长设置（时长上限、就寝锁定、分类白名单、按年龄过滤）在前端本地存储；
播放进度 / 续播回写 Jellyfin，换设备接着看。

### 6. 加内容

见 [`../tools/ingest`](../tools/ingest)。媒体目录固定 `deploy/media`（已挂进容器 `/media`）：

```bash
cd tools/ingest
cp .ingestrc.example.json .ingestrc.json
#   JELLYFIN_URL  = http://NAS内网IP:8096
#   JELLYFIN_TOKEN= 第4步的 API Key
#   MEDIA_ROOT    = .../childvideo/deploy/media （SMB 挂到笔记本，或 SSH 进 NAS 跑）
node ingest.mjs check
node ingest.mjs add "https://www.bilibili.com/video/BVxxxx" -c 动画 -t "小兔子的一天 第1集"
node ingest.mjs add ./local.mp4 -c 儿歌 --copy
```

`-c` 是分类；标题带「第N集 / EpN」会自动串成系列，支持「自动播下一集」。

---

## 场景 A：NAS 上已经有 Jellyfin

只跑 `cv-web`，反代到现有 Jellyfin。步骤同场景 B，差别：

- `deploy/.env` 里 `JF_UPSTREAM=http://<NAS内网IP>:8096`（指向现有实例，别用 127.0.0.1）。
- 起容器：`docker compose up -d --build`（**不加** `--profile bundled`，只起 `cv-web`）。
- 第 3 步在现有 Jellyfin 里操作；媒体库文件夹用它已映射进容器的某个路径下的子目录
  （比如宿主 `/Volume1/video/kids`），`ingest` 的 `MEDIA_ROOT` 填那个宿主路径。

---

## 运行时配置 `config.json`

`deploy/config.json` 挂载到 `cv-web` 的 `/usr/share/nginx/html/config.json`，覆盖打包进 `dist/` 的那份。
前端启动时 fetch `/config.json`，字段缺省时回退到构建时的 `.env`（`VITE_*`）。

| 字段 | 说明 |
|---|---|
| `source` | `jellyfin` 或 `static` |
| `appName` | 顶栏名称 |
| `jellyfin.base` | 反代前缀，固定 `/jf` |
| `jellyfin.key` | API Key |
| `jellyfin.userId` | kid 用户 ID |
| `jellyfin.libraryId` | 只读某个库；留空读 kid 能看到的全部 |
| `jellyfin.categoryMode` | `genre`（默认，用 Genre/NFO）/ `folder`（用顶层子文件夹名，适合整夹丢进去没 NFO）/ `collection`（用合集） |
| `jellyfin.stream` | `direct`（默认，直连原文件，浏览器放不了的自动回退转码 HLS）/ `hls`（一律让 Jellyfin 转码） |

改 `config.json` 后 `docker compose restart web` 生效。**不需要重新构建 `dist/`。**

## 其它说明

- **改了 `.env` 的 `JF_UPSTREAM` / `WEB_PORT`**：要 `docker compose up -d --force-recreate web`
  才重读；改 `config.json` 只需 `restart web`。
- **502 / 打不开**：多半 `JF_UPSTREAM` 不对。`docker exec cv-web wget -qO- $JF_UPSTREAM/System/Info/Public`
  要能通；用 NAS 内网 IP，不要 `127.0.0.1`（那是容器自己）。
- **改了 `src/` 代码**：`docker compose ... up -d --build`（或 `docker compose build web`）重建镜像。
- **升级 Jellyfin**：改 `docker-compose.yml` 镜像 tag，`docker compose --profile bundled pull && up -d`。
- **1T 容量**：720p 一个约 200–500MB，放几千个没问题；更省用 `ingest add --height 480`。
- **在外面看**：NAS 装 **Tailscale**，手机也装，用 tailnet IP `http://100.x.x.x:8080/`。不用域名不用备案。
- **Token 暴露**：`config.json` 里的 key 会被浏览器读到。纯内网无所谓；要对公网隔离，在 nginx 后加个
  注入 Token 的薄代理。`/jf/web`、`/jf/dashboard` 已在 nginx 里 404。
