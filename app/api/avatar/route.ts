import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    if (!path) {
      return NextResponse.json({ error: 'path is required' }, { status: 400 })
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'server misconfigured' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const bucket = 'avatar'
    const expiresIn = 60 * 60 // 1 hour for debugging

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ url: data.signedUrl, path, expiresIn })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
