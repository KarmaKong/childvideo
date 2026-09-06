import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import { initRuntimeConfig } from './runtime-config'
import App from './App'
import Home from './pages/Home'
import Discover from './pages/Discover'
import Learn from './pages/Learn'
import Vip from './pages/Vip'
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
        { path: 'vip', element: <Vip /> },
        { path: 'me', element: <Profile /> },
        { path: 'search', element: <Discover /> },
        { path: 'c/:categoryId', element: <CategoryPage /> },
        { path: 'watch/:videoId', element: <Player /> },
        { path: 'parent', element: <ParentSettings /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

initRuntimeConfig().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
})
