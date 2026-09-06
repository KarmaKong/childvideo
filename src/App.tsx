import { Outlet, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'

export default function App() {
  const { pathname } = useLocation()
  // 播放器全屏、家长中心独立流程：不套外壳
  const bare = pathname.startsWith('/watch/') || pathname.startsWith('/parent')
  if (bare) return <Outlet />
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
