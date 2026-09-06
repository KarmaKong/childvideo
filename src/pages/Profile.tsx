import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import PageHeader from '../components/PageHeader'
import {
  SectionHeader,
  SectionGrid,
  VideoGrid,
  LoadingState,
  EmptyState,
  ProfileAvatar,
} from '../components/lumo'
import { IconButton } from '../components/lumo/Button'
import { Lock, HeartFill, ClockIcon } from '../components/icons'
import ParentalGate from '../components/ParentalGate'
import { useProgressStore } from '../store/useProgressStore'
import type { Video } from '../types'

export default function Profile() {
  const nav = useNavigate()
  const { catalog } = useCatalog()
  const history = useProgressStore((s) => s.history)
  const favorites = useProgressStore((s) => s.favorites)
  const [gate, setGate] = useState(false)

  if (!catalog) return <LoadingState />

  const byId = new Map(catalog.videos.map((v) => [v.id, v]))
  const recent = history.map((id) => byId.get(id)).filter((v): v is Video => !!v)
  const favs = favorites.map((id) => byId.get(id)).filter((v): v is Video => !!v)

  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeader
        title="我的"
        subtitle="Mia"
        pose="happy"
        right={
          <>
            <ProfileAvatar name="Mia" size={44} />
            <IconButton label="家长中心" onClick={() => setGate(true)}>
              <Lock className="h-5 w-5" />
            </IconButton>
          </>
        }
      />

      <div className="flex flex-col gap-6 px-4 pt:px-6 ipad:px-8">
        {recent.length > 0 && (
          <section>
            <SectionHeader title="最近看过" icon={<ClockIcon className="h-5 w-5 text-lumo-blue" />} />
            <div className="mt-3">
              <SectionGrid videos={recent.slice(0, 8)} />
            </div>
          </section>
        )}

        <section>
          <SectionHeader title="我的收藏" icon={<HeartFill className="h-5 w-5 text-lumo-coral" />} />
          <div className="mt-3">
            {favs.length > 0 ? (
              <VideoGrid videos={favs} />
            ) : (
              <EmptyState
                pose="box"
                title="这里还没有收藏的视频哦"
                hint="看视频时点右上角的星星就能收藏"
              />
            )}
          </div>
        </section>
      </div>

      {gate && (
        <ParentalGate
          onPass={() => {
            setGate(false)
            nav('/parent')
          }}
          onCancel={() => setGate(false)}
        />
      )}
    </div>
  )
}
