#!/usr/bin/env bash
# 从 public/lumo-src.png（建议 1024×1024 的 LUMO Box logo）生成全部图标尺寸。
# 用法：把 logo 存成 public/lumo-src.png，然后 bash scripts/gen-icons.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=public/lumo-src.png
[ -f "$SRC" ] || { echo "缺 $SRC —— 先把 LUMO Box logo 存成这个文件（1024×1024 PNG）"; exit 1; }

gen() { sips -s format png -z "$2" "$2" "$SRC" --out "public/$1" >/dev/null && echo "  public/$1  ${2}px"; }

echo "生成图标："
gen favicon-16x16.png 16
gen favicon-32x32.png 32
gen apple-touch-icon.png 180
gen icon-192.png 192
gen icon-512.png 512
gen lumo-mark.png 96      # 顶栏用

echo "完成。commit public/ 里这几个文件。"
