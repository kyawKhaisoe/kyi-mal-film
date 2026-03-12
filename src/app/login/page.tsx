"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAuthStore();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
                });
                if (error) throw error;
                setMessage("Check your email for the password reset link");
            } else if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setUser(data.user); // Update global state immediately
                router.push("/"); // Instant soft redirect via next/navigation
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage("Success! If email confirmation is required, check your email. Otherwise, you can now sign in.");
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
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
                    {isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Sign Up"}
                </h2>

                {error && (
                    <div className="mb-6 p-3 bg-[#e87c03] rounded text-white text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="mb-6 p-3 bg-green-600 rounded text-white text-sm">
                        {message}
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
                    {!isForgotPassword && (
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
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-6 flex items-center justify-center bg-[#00ADFF] hover:bg-[#008FCC] text-white font-semibold rounded transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Please wait...
                            </>
                        ) : (
                            isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up"
                        )}
                    </button>
                    {!isForgotPassword && (
                        <div className="flex items-center justify-between text-sm text-zinc-400 mt-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="mr-2 rounded bg-zinc-700 border-none cursor-pointer" />
                                Remember me
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(true)}
                                className="hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}
                    {!isForgotPassword && (
                        <div className="mt-4 flex flex-col space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-black/80 sm:bg-black/90 text-zinc-400">OR</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full py-3 px-4 flex items-center justify-center bg-white text-black font-medium rounded hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        </div>
                    )}
                </form>

                <div className="mt-16 text-zinc-400">
                    {isForgotPassword ? (
                        <>
                            Remembered your password?{" "}
                            <button
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="text-white hover:underline transition-colors focus:outline-none"
                            >
                                Sign in
                            </button>
                        </>
                    ) : (
                        <>
                            {isLogin ? "New to Kyi Mal?" : "Already have an account?"}{" "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="text-white hover:underline transition-colors focus:outline-none"
                            >
                                {isLogin ? "Sign up now" : "Sign in"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
