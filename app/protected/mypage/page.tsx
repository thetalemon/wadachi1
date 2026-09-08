import ProfileForm from '@/components/profile-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

async function ProfileContent() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  const user = userData?.user
  if (userError || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id,username,avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Normalize avatar_url: if a signed URL was accidentally saved, extract the
  // storage path (bucket-relative) so the client can request a fresh signed
  // URL or use the server stream endpoint. Example signed URL path:
  // /storage/v1/object/sign/avatar/<path>?token=...
  let initialAvatarUrl: string | null = profile?.avatar_url ?? null
  if (initialAvatarUrl && initialAvatarUrl.startsWith('http')) {
    try {
      const m = initialAvatarUrl.match(
        /\/storage\/v1\/object\/sign\/avatar\/([^?]+)/
      )
      if (m && m[1]) initialAvatarUrl = decodeURIComponent(m[1])
    } catch (e) {
      // leave as-is if parsing fails
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      <ProfileForm
        initialUsername={profile?.username ?? ''}
        initialAvatarUrl={initialAvatarUrl}
        userId={user.id}
      />
    </div>
  )
}

export default function MyPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      {/* ProfileContent is a server component that performs data fetching */}
      {/* It is intentionally wrapped in Suspense to avoid blocking prerender */}
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <ProfileContent />
    </Suspense>
  )
}
