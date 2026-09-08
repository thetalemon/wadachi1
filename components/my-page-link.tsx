import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MyPageLink() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const user = data?.user
    if (!user) {
      return (
        <div className="mt-4">
          <Link href="/auth/login" className="text-sm underline">
            ログイン
          </Link>
        </div>
      )
    }

    return (
      <div className="mt-4">
        <Link href="/protected/mypage" className="text-sm underline">
          マイページ
        </Link>
      </div>
    )
  } catch (e) {
    return null
  }
}
