'use client'
import { useEffect } from 'react'

export default function LogTest() {
  useEffect(() => {
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])
  return null
}
