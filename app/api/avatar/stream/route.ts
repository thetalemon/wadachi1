import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    if (!path)
      return NextResponse.json({ error: 'path required' }, { status: 400 })

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

    const { data, error } = await supabase.storage.from(bucket).download(path)
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    const arrayBuffer = await data.arrayBuffer()
    const headers = new Headers()
    headers.set('Content-Type', 'application/octet-stream')
    headers.set('Cache-Control', 'public, max-age=3600')

    return new NextResponse(Buffer.from(arrayBuffer), { headers })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
