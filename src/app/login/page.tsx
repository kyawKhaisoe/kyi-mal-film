"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/");
                router.refresh();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // Automatically set them to login or show message
                alert("Success! If email confirmation is required, you'll need to check your email. Otherwise, you can now sign in.");
                setIsLogin(true); // Switch to login tab
            }
        } catch (err: any) {
            setError(err.message);
            alert(`Login failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/99145174-a6c4-4f12-bf88-4f5af61d3f80/web/US-en-20241223-TRIFECTA-perspective_2c0d8ac1-92be-48e0-bb82-f04bfdf245cd_large.jpg')] bg-cover bg-center opacity-40 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-0"></div>

            {/* Login Box */}
            <div className="relative z-10 w-full max-w-md p-8 sm:p-12 bg-black/80 sm:bg-black/90 rounded-md border border-zinc-800/50 shadow-2xl">
                <h1 className="text-3xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-[#00ADFF] tracking-tighter drop-shadow-md pb-1">
                    KYI MAL
                </h1>

                <h2 className="text-3xl font-bold mb-6">
                    {isLogin ? "Sign In" : "Sign Up"}
                </h2>

                {error && (
                    <div className="mb-6 p-3 bg-[#e87c03] rounded text-white text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email or mobile number"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-zinc-900 border border-zinc-500 rounded text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-400"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-zinc-900 border border-zinc-500 rounded text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-6 bg-[#00ADFF] hover:bg-[#008FCC] text-white font-semibold rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
                    </button>
                </form>

                <div className="mt-16 text-zinc-400">
                    {isLogin ? "New to Kyi Mal?" : "Already have an account?"}{" "}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-white hover:underline transition-colors focus:outline-none"
                    >
                        {isLogin ? "Sign up now" : "Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
