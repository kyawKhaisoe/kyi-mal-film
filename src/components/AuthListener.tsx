"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AuthListener() {
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
            // Refresh on significant events like login or logout securely via hard reload to prevent browser cache bugs
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                window.location.reload();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setIsLoading, router]);

    return null;
}
