import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: true,
            storageKey: 'supabase-auth-token',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        }
    }
);
