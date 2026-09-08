'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ProfileForm({
  initialUsername,
  initialAvatarUrl,
  userId
}: any) {
  const [username, setUsername] = useState(initialUsername ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAvatarUrl ?? null
  )
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setUploading(true)
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ id: userId, username, avatar_url: avatarUrl })
        .select()

      if (error) throw error
      setMessage('Saved')
      router.refresh()
    } catch (err: any) {
      setMessage(err.message ?? String(err))
    } finally {
      setUploading(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage(null)

    try {
      const bucket = 'avatar' // Supabase 上のバケット名に合わせる
      const path = `${userId}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      // store the storage path (not a public url) so we can use signed URLs for private buckets
      const storagePath = path
      setAvatarUrl(storagePath)

      // show immediate local preview using a blob URL
      const localPreview = URL.createObjectURL(file)
      setDisplayUrl(localPreview)

      // 自動で users テーブルの avatar_url を更新（path を保存）
      const { data: updateData, error: updateErr } = await supabase
        .from('users')
        .update({ avatar_url: storagePath })
        .eq('id', userId)

      if (updateErr) throw updateErr
      setMessage('Uploaded')
    } catch (err: any) {
      setMessage(err.message ?? String(err))
    } finally {
      setUploading(false)
    }
  }

  // If avatarUrl is a storage path (not a full URL), fetch a signed URL from server
  useEffect(() => {
    if (!avatarUrl) {
      setDisplayUrl(null)
      return
    }

    // If displayUrl is a local blob preview, keep it (instant feedback).
    if (displayUrl && displayUrl.startsWith('blob:')) return

    // If avatarUrl already looks like a full URL, use it directly for display
    if (avatarUrl.startsWith('http')) {
      setDisplayUrl(avatarUrl)
      return
    }

    // Otherwise treat avatarUrl as a storage path and point to the stream API
    setDisplayUrl(`/api/avatar/stream?path=${encodeURIComponent(avatarUrl)}`)
  }, [avatarUrl])

  // revoke blob URL when displayUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (displayUrl && displayUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(displayUrl)
        } catch (_) {
          /* ignore */
        }
      }
    }
  }, [displayUrl])

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">表示名</span>
        <input
          className="border rounded p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="表示名を入力"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">アバター</span>
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100" />
        )}
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-4 py-2 border rounded"
        >
          リセット
        </button>
      </div>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  )
}

export default ProfileForm
