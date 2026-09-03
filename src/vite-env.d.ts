/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOURCE?: 'static' | 'jellyfin'

  // --- static 源 ---
  readonly VITE_CDN_BASE?: string
  readonly VITE_CATALOG_PATH?: string
  readonly VITE_PUBLIC_BASE?: string

  // --- jellyfin 源 ---
  readonly VITE_JELLYFIN_BASE?: string
  readonly VITE_JELLYFIN_KEY?: string
  readonly VITE_JELLYFIN_USER_ID?: string
  readonly VITE_JELLYFIN_LIBRARY_ID?: string
  readonly VITE_JELLYFIN_CATEGORY_MODE?: 'genre' | 'collection' | 'folder'
  readonly VITE_JELLYFIN_STREAM?: 'direct' | 'hls'
  readonly VITE_JELLYFIN_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
