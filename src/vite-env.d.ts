/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CDN_BASE?: string
  readonly VITE_CATALOG_PATH?: string
  readonly VITE_PUBLIC_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
