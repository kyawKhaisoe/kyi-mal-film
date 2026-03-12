"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            alert("Password updated successfully! You will now be redirected.");
            router.replace("/");
        } catch (err: any) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/99145174-a6c4-4f12-bf88-4f5af61d3f80/web/US-en-20241223-TRIFECTA-perspective_2c0d8ac1-92be-48e0-bb82-f04bfdf245cd_large.jpg')] bg-cover bg-center opacity-40 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-0"></div>

            {/* Form Box */}
            <div className="relative z-10 w-full max-w-md p-8 sm:p-12 bg-black/80 sm:bg-black/90 rounded-md border border-zinc-800/50 shadow-2xl">
                <h1 className="text-3xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-[#00ADFF] tracking-tighter drop-shadow-md pb-1">
                    KYI MAL
                </h1>

                <h2 className="text-3xl font-bold mb-6">Reset Password</h2>

                {error && (
                    <div className="mb-6 p-3 bg-[#e87c03] rounded text-white text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-zinc-900 border border-zinc-500 rounded text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-400"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-4 bg-zinc-900 border border-zinc-500 rounded text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-6 flex items-center justify-center bg-[#00ADFF] hover:bg-[#008FCC] text-white font-semibold rounded transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
