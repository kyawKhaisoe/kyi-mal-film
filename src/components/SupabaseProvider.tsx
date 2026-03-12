"use client";

import { createContext, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const SupabaseContext = createContext({});

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setIsLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);

            if (event === 'SIGNED_OUT') {
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setIsLoading, router]);

    return (
        <SupabaseContext.Provider value={{}}>
            {children}
        </SupabaseContext.Provider>
    );
}

export const useSupabase = () => useContext(SupabaseContext);
