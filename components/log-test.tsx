'use client'
import { useEffect } from 'react'

export default function LogTest() {
  useEffect(() => {
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log(
      'PUBLISHABLE KEY (exists):',
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
    console.log(
      'PUBLISHABLE KEY (value):',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
  }, [])
  return null
}
