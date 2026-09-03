# 小小影院 · 部署交接单（给 hermes 执行）

## 目标

在**这台 Mac mini** 上用一个 nginx 容器（`cv-web`）把「小小影院」儿童视频前端跑起来。
它反向代理到本机**已经装好并配置好**的 Jellyfin（同源，绕开 CORS）。
完成后局域网任意设备访问 `http://<Mac-mini-局域网IP>:8080/` 即儿童界面。

范围就这一件事。**不要**动现有 Jellyfin 的数据/配置；**不要**把 Jellyfin 迁到 NAS
（那是用户回来后再决定）；**不要**把任何端口暴露到公网。

---

## 需要的输入（3 个值）

用户会随任务给出。**缺任何一个 → 做到第 3 步为止，然后停下并在回报里列出缺什么。**

| 变量 | 说明 | 自查方式 |
|---|---|---|
| `JELLYFIN_URL` | 本机 Jellyfin 地址，通常 `http://localhost:8096` | `curl -s http://localhost:8096/System/Info/Public` 返回 JSON 即在跑 |
| `JELLYFIN_KEY` | Jellyfin API Key | 用它试：`curl -s -H "X-Emby-Token: <KEY>" "<JELLYFIN_URL>/Users"` 返回用户数组即有效 |
| `JELLYFIN_USER_ID` | 儿童账号 `kid` 的用户 Id | 上一条返回里，找 `"Name":"kid"`（或用户指定的名字）对应的 `"Id"` |

---

## 环境检查（任一不满足 → 回报并停，不要自行安装/改系统）

```bash
ls /Users/dokwan/childvideo/package.json /Users/dokwan/childvideo/deploy
node -v            # 需 ≥ 18
docker version     # daemon 要在跑（Docker Desktop / OrbStack / colima 均可）
docker compose version   # 需 v2
```

**若 `/Users/dokwan/childvideo` 不存在**：仓库还没传到这台 Mac mini（它是本地仓库，没有 git 远程）。
不要自己找、不要 `git clone`。回报「仓库缺失」并停，由用户从另一台机器传过来
（用户侧命令：`rsync -av --exclude node_modules --exclude dist /Users/jiawaycheung/childvideo/ dokwan@<mac-mini-IP>:/Users/dokwan/childvideo/`）。
用户也可能已用别的方式放到别处 —— 那就让用户告知确切路径，并把下面所有 `/Users/dokwan/childvideo` 替换成该路径。

---

## 步骤

### 1. 依赖

```bash
cd /Users/dokwan/childvideo
npm install
```

### 2. 前端配置

若已存在 `.env`，先 `cp .env .env.bak`。然后写 `/Users/dokwan/childvideo/.env`：

```
VITE_SOURCE=jellyfin
VITE_JELLYFIN_BASE=/jf
VITE_JELLYFIN_KEY=<JELLYFIN_KEY>
VITE_JELLYFIN_USER_ID=<JELLYFIN_USER_ID>
VITE_JELLYFIN_CATEGORY_MODE=genre
VITE_JELLYFIN_STREAM=direct
```

`VITE_JELLYFIN_LIBRARY_ID` 不用填。

### 3. 打包

```bash
npm run build
```

产出 `dist/`。失败就贴完整报错并停。

### 4. nginx 容器配置

```bash
cd /Users/dokwan/childvideo/deploy
cp .env.example .env
```

编辑 `deploy/.env`，只改这两行（其余保持默认）：

```
WEB_PORT=8080
JF_UPSTREAM=http://host.docker.internal:8096
```

- `host.docker.internal` 在 Docker Desktop / OrbStack 上解析到宿主机。
- 若用 colima 且该域名不通，改成 Mac mini 的局域网 IP，例如 `http://192.168.1.20:8096`。
- 若 `JELLYFIN_URL` 端口不是 8096，这里同步改。
- 若 8080 被占，换个端口并在回报里说明。

### 5. 起容器

```bash
docker compose up -d          # 只会起 cv-web；不要加 --profile bundled
docker compose ps
docker compose logs --tail=40 web
```

### 6. 验证（在 Mac mini 上）

```bash
curl -s -o /dev/null -w "front=%{http_code}\n" http://localhost:8080/
curl -s -o /dev/null -w "proxy=%{http_code}\n" http://localhost:8080/jf/System/Info/Public
ipconfig getifaddr en0 || ipconfig getifaddr en1     # 取局域网 IP
```

`front=200` 且 `proxy=200` 即基本成功。用局域网 IP 开 `http://<IP>:8080/` 应看到儿童首页
（若 Jellyfin 儿童库还没有视频，首页会提示空，属正常）。

---

## 回报模板（做完贴给用户）

```
环境：node <版本> / docker <ok?> / compose <ok?>
输入：URL=<..>  KEY=<打码>  USER_ID=<..>   （缺失的写“缺”）
build：<成功 / 失败+报错>
deploy/.env：WEB_PORT=<..>  JF_UPSTREAM=<..>
docker compose ps：<粘贴>
验证：front=<code>  proxy=<code>
访问地址：http://<局域网IP>:8080/
卡点/报错：<无 / 详情>
```

---

## 明确不要做

- 不修改 / 迁移 / 删除现有 Jellyfin 的任何数据或配置
- 不加 `--profile bundled`（不要再起第二个 Jellyfin）
- 不映射端口到公网、不配端口转发 / DDNS
- 不改动 `src/` 代码；只按上面写 `.env` 两个文件
- 遇到需要抉择或缺信息 → 停下回报，不要猜

## 回滚

```bash
cd /Users/dokwan/childvideo/deploy && docker compose down
```

只删 `cv-web` 容器，其它一概不动。
