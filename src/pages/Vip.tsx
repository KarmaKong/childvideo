import PageHeader from '../components/PageHeader'
import { EmptyState } from '../components/lumo'

export default function Vip() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="会员" subtitle="更多精选内容，敬请期待" pose="happy" />
      <EmptyState pose="box" title="会员功能还在打包中" hint="之后这里会有专属精选片单和离线缓存" />
    </div>
  )
}
