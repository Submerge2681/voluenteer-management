'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const head = await headers()
  const origin = await head.get('origin')

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Redirect to our callback route to handle cookies
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/auth/login?message=Could not authenticate user')
  }

  return redirect('/auth/login?message=Check your email for the magic link!')
}