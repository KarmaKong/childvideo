# 小小影院 · 从零到孩子能看的完整执行手册

> 交给另一台机器上的 agent 执行。目标：在现有 NAS Jellyfin 之上，跑起儿童前端，
> 加几个视频，让孩子的平板点一个图标就能全屏看。
>
> 仓库（公开，直接 clone）：`https://github.com/KarmaKong/childvideo`

---

## 0. 现状与目标

**现状**（用户已完成）：NAS（TerraMaster）上 Jellyfin 已安装并能访问，媒体库已连上。

**还没做**：儿童 Jellyfin 账号、API Key、儿童前端 `cv-web`、加内容、孩子设备接入。

**做完后**：局域网设备打开 `http://<HOST>:8080/` 是大色块儿童界面；
`<HOST>` 是跑 `cv-web` 的机器。家长控制（每日时长、就寝锁、分类白名单）在前端；
播放进度回写 Jellyfin，多设备续播。

---

## 1. 需要用户提供 / 你去确认的输入

| 项 | 谁给 | 备注 |
|---|---|---|
| NAS 内网 IP | 用户 | 例 `192.168.1.50`，下面记作 `<NAS_IP>` |
| Jellyfin 地址 | 你验证 | 一般 `http://<NAS_IP>:8096` |
| Jellyfin **管理员 API Key** | 用户（可选，走 3-B1 快路径要它） | 控制台 → API 密钥。没有就走 3-B2 |
| 跑 `cv-web` 的机器 | 你判断 | 见第 2 节。记作 `<HOST>` / `<HOST_IP>` |
| 你能操作 `<HOST>` 的方式 | 用户 | 直接 shell / SSH（给账号 IP） |

缺 API Key 时：先做能做的（第 2、4、5 步铺好），到第 3 步停下，把网页操作清单交回用户，
拿到 **API Key** 和 **kid 用户 ID** 再继续。

---

## 2. 选一台机器跑 cv-web（`<HOST>`）

`cv-web` 是个 nginx 容器：发前端静态页 + 把 `/jf/*` 反代到 NAS 的 Jellyfin。
要求：有 Docker、常开、和 NAS 同一局域网。

- **首选：NAS 本机**（数据近、天生常开）。前提是 NAS 的 Docker 你能用命令行操作。
- **备选：这台/另一台 Mac mini**（有 Docker Desktop / OrbStack、会一直开着）。

确认：在 `<HOST>` 上
```bash
docker version && docker compose version
```
都没有 → 停，回报「`<HOST>` 无 Docker」。NAS 上没有就让用户在 TOS 应用中心装 Docker，
或改用有 Docker 的 Mac mini 当 `<HOST>`。

---

## 3. Jellyfin 里建儿童库 + kid 用户 + API Key

先确认 Jellyfin 在跑：
```bash
curl -s http://<NAS_IP>:8096/System/Info/Public
```
返回 JSON 即正常。

### 3-B1　有管理员 API Key（快，全命令行）

设 `ADMIN=<管理员 API Key>`，`JF=http://<NAS_IP>:8096`。

```bash
# 1) 看现有媒体库，拿到给孩子看的那个库的 ItemId
curl -s -H "X-Emby-Token: $ADMIN" "$JF/Library/VirtualFolders" \
  | python3 -m json.tool
#   记下目标库的 "ItemId" -> 记作 <LIB_ID>
#   （没有合适的库就让用户在网页建，或用 POST /Library/VirtualFolders 建，路径要用
#    Jellyfin 容器内可见的路径，如 /media 或 /media/kids）

# 2) 建 kid 用户
curl -s -X POST -H "X-Emby-Token: $ADMIN" -H "Content-Type: application/json" \
  -d '{"Name":"kid","Password":""}' "$JF/Users/New" | python3 -m json.tool
#   记下返回里的 "Id" -> 这就是 <USER_ID>

# 3) 收紧 kid 权限：取默认 Policy，改几项再写回
curl -s -H "X-Emby-Token: $ADMIN" "$JF/Users/<USER_ID>" \
  | python3 -c 'import sys,json;u=json.load(sys.stdin);p=u["Policy"];p.update({"IsAdministrator":False,"IsHidden":True,"EnableAllFolders":False,"EnabledFolders":["<LIB_ID>"],"EnableContentDownloading":False,"EnableContentDeletion":False,"EnableLiveTvAccess":False,"EnableRemoteControlOfOtherUsers":False});print(json.dumps(p))' > /tmp/kid_policy.json
curl -s -X POST -H "X-Emby-Token: $ADMIN" -H "Content-Type: application/json" \
  --data @/tmp/kid_policy.json "$JF/Users/<USER_ID>/Policy" -w "policy=%{http_code}\n"

# 4) 给前端建一个 API Key
curl -s -X POST -H "X-Emby-Token: $ADMIN" "$JF/Auth/Keys?app=xiaoxiao" -w "\ncreate=%{http_code}\n"
curl -s -H "X-Emby-Token: $ADMIN" "$JF/Auth/Keys" | python3 -m json.tool
#   找 AppName/App == "xiaoxiao" 的那条，取 "AccessToken" -> 这就是 <KEY>
```

产出：`<LIB_ID>`、`<USER_ID>`、`<KEY>`。→ 跳第 4 步。

> 可选：想按分类分行展示，需要该库开启 NFO 元数据读取（网页：库 → 管理 → 勾 Nfo 保存器并拖到最前）。
> 不开也能用，只是所有视频归到一个「精选」分类。

### 3-B2　没有 API Key（把这段原样回报给用户）

> 请在 `http://<NAS_IP>:8096` 控制台里完成，然后把 **API Key** 和 **kid 用户 ID** 发我：
> 1. **媒体库**：确保有一个给孩子看的库（类型「家庭视频」）。想按分类分行就进该库设置，
>    勾「Nfo」元数据保存器并拖到最前（可选）。
> 2. **用户 → 新建** `kid`：取消全部管理权限；「媒体库访问」只勾这个儿童库；关掉「允许媒体下载」。
> 3. **API 密钥 → 新建**，应用名填 `xiaoxiao`，复制 **Key**。
> 4. **用户 → 点开 `kid`**，浏览器地址栏 `userId=` 后面那串 = **用户 ID**。
> 5. （可选）点开儿童库编辑，地址栏 `id=` 那串 = **库 ID**（不给就留空，前端读 kid 能看到的全部库）。

---

## 4. 拉代码 + 起 cv-web

在 `<HOST>` 上：

```bash
git clone https://github.com/KarmaKong/childvideo.git
cd childvideo/deploy
cp .env.example .env
cp config.example.json config.json
```

编辑 `deploy/.env`：
```
WEB_PORT=8080
JF_UPSTREAM=http://<NAS_IP>:8096
```
- 若 `<HOST>` 就是 NAS：也可以用 `http://host.docker.internal:8096`；用 `<NAS_IP>` 最稳。
- 8080 被占就换，并在回报里说明。

起容器（**场景 A：已有 Jellyfin，不带 `--profile bundled`**；`--build` 在容器里打包前端，首次 1–3 分钟）：
```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=40 web
```

自测：
```bash
curl -s -o /dev/null -w "front=%{http_code}\n" http://localhost:8080/
docker exec cv-web wget -qO- "$JF_UPSTREAM/System/Info/Public" >/dev/null 2>&1 \
  && echo "upstream ok" || echo "upstream FAIL（JF_UPSTREAM 不对，别用 127.0.0.1）"
```

---

## 5. 填运行时配置 + 验证

编辑 `childvideo/deploy/config.json`：
```json
{
  "source": "jellyfin",
  "appName": "小小影院",
  "jellyfin": {
    "base": "/jf",
    "key": "<KEY>",
    "userId": "<USER_ID>",
    "libraryId": "<LIB_ID 或留空>",
    "categoryMode": "genre",
    "stream": "direct"
  }
}
```

```bash
cd childvideo/deploy && docker compose restart web
curl -s http://localhost:8080/config.json                                   # 回显你写的
curl -s -o /dev/null -w "proxy=%{http_code}\n" http://localhost:8080/jf/System/Info/Public   # 200
```

浏览器开 `http://<HOST_IP>:8080/`：应出现儿童首页。库里还没视频时首页提示为空，正常。

---

## 6. 加内容

在有 `ffmpeg` 和 `yt-dlp` 的机器上（`<HOST>` 或你本机；媒体目录需能写到 Jellyfin 那个库的实际路径）：

```bash
cd childvideo/tools/ingest
cp .ingestrc.example.json .ingestrc.json
#   JELLYFIN_URL  = http://<NAS_IP>:8096
#   JELLYFIN_TOKEN= <KEY>（或管理员 Key）
#   MEDIA_ROOT    = 儿童库对应的宿主目录（SMB 挂载 / SSH 到 NAS 上跑均可）
node ingest.mjs check
node ingest.mjs add "<视频链接或本地文件>" -c 动画 -t "小兔子的一天 第1集"
node ingest.mjs add "<...>" -c 儿歌 --copy
```
- `-c` 是分类。标题带「第N集 / EpN」会自动串成系列，支持「自动播下一集」。
- 加完刷新一下（`node ingest.mjs scan`），回前端首页应能看到。

> 内容版权：只放你有权使用的（自己拍的 / 买的 / CC 授权 / 公版）。

---

## 7. 孩子设备接入

**网址**：`http://<HOST_IP>:8080/`

让它稳定好记：
1. 路由器给 `<HOST>` 做 **DHCP 保留**（固定内网 IP）。
2. 或用主机名 `http://<主机名>.local:8080/`（TerraMaster 默认名类似 `TNAS`）。

每台孩子的平板/手机：
1. 浏览器打开该网址一次 → **「添加到主屏幕」**（iOS Safari / Android Chrome）→ 桌面出图标，点开全屏无地址栏。
2. **锁在应用里**，防止切去别的 App：
   - iPad：设置 → 辅助功能 → **引导式访问**；进 App 后三击侧键锁定。
   - Android：设置 → 安全 → **固定屏幕 / 应用固定**。
3. App 内还有家长锁（算术题）控制"进设置 / 退儿童模式"；两层一起用。

---

## 8.（可选）在外面也能看

`<HOST>` 装 **Tailscale**，孩子设备也装并登录同账号，网址换成 Tailscale 给的地址
`http://<tailscale名>:8080/`。不用域名、不用备案、不用端口转发。

---

## 回报模板

```
2. HOST = <NAS 本机 / Mac mini>，docker=<版本>，你的访问方式=<...>
3. 走的是 B1 / B2。
   B1：LIB_ID=<..> USER_ID=<..> KEY=<打码> policy=<code>
   B2：已把清单交回用户，等 KEY + USER_ID
4. docker compose ps=<粘贴>  front=<code>  upstream=<ok/FAIL>
5. config.json 已写（key 打码）；restart=<ok>；proxy=<code>；/config.json 回显=<ok>
6. 已入库 <N> 个视频：<标题列表>
7. 孩子入口网址：http://<HOST_IP 或 主机名.local>:8080/
卡点 / 待用户：<...>
```

---

## 明确不要做

- 不动 NAS 上 Jellyfin 已有的媒体、用户、配置（只**新增** kid 用户和一个 API Key）
- 不加公网端口转发 / DDNS / UPnP；只局域网可达（外网用第 8 节 Tailscale）
- 不改仓库 `src/` 代码；只写 `deploy/.env` 和 `deploy/config.json`
- 场景 A 不要带 `--profile bundled`（那会再起一个 Jellyfin）
- 缺信息或要做选择 → 停下回报，不要猜

## 回滚

```bash
cd childvideo/deploy && docker compose down     # 仅删 cv-web 容器
```
Jellyfin 里若已建 kid 用户 / API Key，不影响现有内容；要撤就在控制台删掉那个用户和那个 Key。
