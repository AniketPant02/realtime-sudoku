'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// for vercel deployment
const redirectToURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth/callback'
    : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/auth/callback`

export async function signInWithGitHub() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: redirectToURL,
        },
    })
    if (error) { redirect('/error') }
    if (data.url) {
        revalidatePath('/', 'layout')
        redirect(data.url)
    }
}