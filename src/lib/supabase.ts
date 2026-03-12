import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                flowType: 'pkce',
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            },
            cookieOptions: {
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                domain: typeof window !== 'undefined' ? window.location.hostname : '',
                secure: process.env.NODE_ENV === 'production',
            }
        }
    )

export const supabase = createClient();
