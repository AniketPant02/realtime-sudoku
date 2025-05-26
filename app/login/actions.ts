'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals
} from 'unique-names-generator';
import { generateRandomColor } from '@/utils/colors';

// for vercel deployment
const redirectToURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth/callback'
    : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/auth/callback`

export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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

export async function signInAnonymously() {
    const supabase = await createClient()

    const randomHandle = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        length: 3,
        separator: '-',
        style: 'capital'
    });

    const { error } = await supabase.auth.signInAnonymously({
        options: {
            data: {
                username: randomHandle,
                color: generateRandomColor(),
            }
        }
    })
    if (error) { redirect('/error') }
    else {
        revalidatePath('/', 'layout')
        redirect("/")
    }
}