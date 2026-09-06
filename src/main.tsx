import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import { initRuntimeConfig } from './runtime-config'
import App from './App'
import Home from './pages/Home'
import Discover from './pages/Discover'
import Learn from './pages/Learn'
import Profile from './pages/Profile'
import CategoryPage from './pages/Category'
import Player from './pages/Player'
import ParentSettings from './pages/ParentSettings'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Home /> },
        { path: 'discover', element: <Discover /> },
        { path: 'learn', element: <Learn /> },
        { path: 'me', element: <Profile /> },
        { path: 'c/:categoryId', element: <CategoryPage /> },
        { path: 'watch/:videoId', element: <Player /> },
        { path: 'parent', element: <ParentSettings /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

// 先拉运行时配置，再渲染（数据源工厂依赖它）
initRuntimeConfig().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
})
