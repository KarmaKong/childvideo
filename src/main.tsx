import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './pages/Home'
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
        { path: 'c/:categoryId', element: <CategoryPage /> },
        { path: 'watch/:videoId', element: <Player /> },
        { path: 'parent', element: <ParentSettings /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
