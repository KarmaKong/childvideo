# cv-ingest · 入库工具

把「yt-dlp 支持的链接」或「本地视频文件」规范化后放进 Jellyfin 媒体库，并触发扫描。
精简自 civideo 的下载 CLI，只保留：下载 → ffmpeg 转 web 友好 mp4 → 落到 `MEDIA_ROOT/<分类>/` → 写 NFO → 触发扫描。

## 依赖

- Node ≥ 20（用系统自带 `fetch` / `parseArgs`，无 npm 依赖）
- `ffmpeg`（必需）
- `yt-dlp`（处理链接时必需；只处理本地文件可不装）

## 配置

`cp .ingestrc.example.json .ingestrc.json` 后填写，或用环境变量（优先级：命令行 > 环境变量 > 文件）：

| 键 | 说明 |
|---|---|
| `JELLYFIN_URL` | 例 `http://localhost:8096`（在部署机上本地直连） |
| `JELLYFIN_TOKEN` | Jellyfin 管理台生成的 API Key |
| `MEDIA_ROOT` | compose 里挂到 Jellyfin `/media` 的宿主目录，默认 `../../deploy/media` |

## 用法

```bash
node ingest.mjs check                     # 检查 ffmpeg/yt-dlp/Jellyfin 连通

node ingest.mjs add <url|文件> -c 动画 -t "小兔子的一天 第1集"
node ingest.mjs add ./raw.mkv       -c 科普 --copy      # 只 remux 不重编码
node ingest.mjs add <url> -c 动画 --series 小兔子的一天 --episode 2

node ingest.mjs scan                      # 仅触发媒体库扫描
```

### 选项

| 选项 | 默认 | 说明 |
|---|---|---|
| `-c, --category` | 必填 | 分类；`genre` 模式下写进 NFO 的 `<genre>` |
| `-t, --title` | 从文件名 / yt-dlp 推断 | 展示标题；同时决定落地文件名 |
| `--series` / `--episode` | — | 写进 NFO 的 `<set>`；实际「自动下一集」靠标题里的「第N集/EpN」识别 |
| `--copy` | 关 | 不重编码，仅换容器（源已是 h264/aac mp4 时最快） |
| `--height` | 720 | 最大高度，超过则等比缩小 |
| `--crf` | 20 | x264 质量，越小越清晰越大 |
| `--force` | 关 | 覆盖同名文件 |
| `--no-scan` | 关 | 不自动触发 Jellyfin 扫描 |

## 说明

- 落地结构是扁平的 `MEDIA_ROOT/<分类>/<标题>.mp4` + 同名 `.nfo`，配合 Jellyfin「家庭视频」库。
- NFO 里的 `<genre>` 需要在 Jellyfin 库设置里**启用 Nfo 元数据读取器**才生效（见 `../../deploy/README.md`）。
- 转码统一加 `-movflags +faststart`，让前端 direct play 能边下边播。
