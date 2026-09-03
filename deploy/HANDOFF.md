# 小小影院 · 部署交接单（在 NAS 上跑，给执行 agent）

## 目标

在 **TerraMaster NAS** 上用 Docker Compose 一次起两个容器：
`cv-jellyfin`（媒体服务器）+ `cv-web`（儿童前端 + 同源反代）。
完成后局域网访问 `http://<NAS内网IP>:8080/` 是儿童界面，
`http://<NAS内网IP>:8096` 是 Jellyfin 管理台。

前端在**容器内构建**（`Dockerfile.web` 多阶段），NAS **不需要装 Node**——`docker compose` 加 `--build` 即可。
Jellyfin 的 Key / userId 通过编辑 `deploy/config.json` 生效，**改完只 restart，不用重建**。

范围：把服务跑起来。**不要**把端口映射到公网；**不要**改 `src/` 代码；
遇到需要抉择或缺信息就**停下回报**，不要猜。

---

## 阶段 0 · 摸情况（把每项结果都写进回报，然后按下面判断走）

1. **你能不能操作 NAS？**
   - 若你在 NAS 上直接有 shell：继续。
   - 若你在别的机器上：`ssh <nas用户>@<NAS内网IP>` 能进吗？不能就**停**，
     回报「无法访问 NAS，需要用户开 SSH / 给账号」。
2. **NAS 上有 Docker 吗？** 在 NAS 上执行：
   ```
   docker version
   docker compose version   # 或 docker-compose version
   ```
   都没有就**停**，回报「NAS 无 Docker，需要用户在 TOS 应用中心装 Docker」。
3. **NAS 上的存储路径**：`ls /` 看有没有 `/Volume1`（TerraMaster 常见，也可能是 `/Volume-1` / `/Volumes/...`）。
   选一个可写目录做工作区，记为 `<WORKDIR>`，例如 `/Volume1/docker/childvideo`。
4. **NAS 用户的 uid/gid**：在 NAS 上 `id`，记下 `uid=` 和 `gid=`（后面填进 `.env` 的 PUID/PGID）。
5. **仓库怎么到 NAS**：`ls <WORKDIR>/package.json` 有没有？
   - 有：跳到阶段 1。
   - 没有：仓库要从有它的机器传过来。用户侧命令（在有仓库的那台机器上跑）：
     ```
     rsync -av --exclude node_modules --exclude dist --exclude .env --exclude 'deploy/config.json' \
       <仓库路径>/ <nas用户>@<NAS内网IP>:<WORKDIR>/
     ```
     你无法自己完成这步就**停**，回报「仓库未就位，需用户 rsync，目标 <WORKDIR>」。

---

## 阶段 1 · 起容器

```bash
cd <WORKDIR>/deploy
cp .env.example .env
cp config.example.json config.json
mkdir -p media jellyfin/config jellyfin/cache
```

编辑 `<WORKDIR>/deploy/.env`：

```
WEB_PORT=8080
JF_UPSTREAM=http://jellyfin:8096
JELLYFIN_BIND=0.0.0.0:8096
PUID=<阶段0 第4步的 uid>
PGID=<阶段0 第4步的 gid>
TZ=Asia/Shanghai
```

`config.json` 先不用动（等阶段 3 拿到 Key 再填）。

起服务（**注意 `--profile bundled`** 带上 Jellyfin，**`--build`** 在容器里构建前端，首次约 1–3 分钟）：

```bash
docker compose --profile bundled up -d --build
docker compose ps
docker compose logs --tail=50 jellyfin
docker compose logs --tail=30 web
```

构建失败（拉不到 npm 包 / node 镜像）就**停**回报，别自己找 workaround。

自测：

```bash
curl -s -o /dev/null -w "jf=%{http_code}\n"    http://localhost:8096/System/Info/Public
curl -s -o /dev/null -w "front=%{http_code}\n" http://localhost:8080/
```

`jf=200` 且 `front=200` → 阶段 1 完成。

---

## 阶段 2 · 停下，交回给用户做 Jellyfin 设置

Jellyfin 首次设置是网页向导，你做不了。**在回报里明确写**：

> Jellyfin 已在 `http://<NAS内网IP>:8096` 启动，请完成：
> 1. 首次向导：建管理员账号（语言选中文）。
> 2. 控制台 → 媒体库 → 添加：内容类型「家庭视频」，文件夹填 `/media`；
>    展开高级，勾「Nfo」元数据保存器并拖到最前。
> 3. 控制台 → 用户 → 新建 `kid`：取消所有管理权限，媒体库只勾儿童库，关「允许媒体下载」。
> 4. 控制台 → API 密钥 → 新建，复制 **Key**。
> 5. 控制台 → 用户 → 点开 `kid`，地址栏 `userId=` 后面那串是 **用户 ID**。
> 把 Key 和 用户 ID 发我。

拿到这两个值后进入阶段 3。（用户也可能选择把 Mac mini 上已配好的 Jellyfin
config 目录拷进 `<WORKDIR>/deploy/jellyfin/config/` 来跳过 1–5，那样直接要 Key/userId 即可。）

---

## 阶段 3 · 填运行时配置（拿到 Key / userId 后）

编辑 `<WORKDIR>/deploy/config.json`：

```json
{
  "source": "jellyfin",
  "appName": "小小影院",
  "jellyfin": {
    "base": "/jf",
    "key": "<粘贴 API Key>",
    "userId": "<粘贴 用户 ID>",
    "libraryId": "",
    "categoryMode": "genre",
    "stream": "direct"
  }
}
```

让 `cv-web` 重新读取（config.json 是只读挂载，重启即可）：

```bash
cd <WORKDIR>/deploy
docker compose restart web
```

验证：

```bash
curl -s http://localhost:8080/config.json                              # 应回显你写的 JSON
curl -s -o /dev/null -w "proxy=%{http_code}\n" http://localhost:8080/jf/System/Info/Public   # 期望 200
```

浏览器开 `http://<NAS内网IP>:8080/`：应显示儿童首页。
儿童库还没视频时首页提示为空，属正常（加视频见 `../tools/ingest`，用户回来后做）。

---

## 回报模板

```
阶段0：
  NAS 访问=<直接shell / ssh ok / 不能>
  docker=<版本 / 无>   compose=<版本 / 无>
  WORKDIR=<路径>   uid/gid=<..>
  仓库就位=<是 / 否，已请用户 rsync>
阶段1：
  docker compose ps = <粘贴>
  jf=<code>  front=<code>
  异常日志 = <无 / 摘录>
阶段2：
  已把 Jellyfin 设置清单发回用户，等 Key / userId
阶段3（若已拿到值）：
  config.json 已写（key 打码）
  restart web = <ok>
  proxy=<code>   /config.json 回显 = <ok>
  访问地址：http://<NAS内网IP>:8080/
下一步 / 卡点：<...>
```

---

## 明确不要做

- 不加公网端口转发 / DDNS / UPnP；只在局域网可达
- 不改 `src/`；只写 `deploy/.env` 和 `deploy/config.json` 两个文件
- 不删除 / 覆盖 NAS 上已有的其它数据
- `docker compose` 必须带 `--profile bundled`（否则不起 Jellyfin）
- 缺信息或要做选择 → 停下回报

## 回滚

```bash
cd <WORKDIR>/deploy && docker compose --profile bundled down
```

容器删除，`deploy/media`、`deploy/jellyfin/` 里的数据保留。
