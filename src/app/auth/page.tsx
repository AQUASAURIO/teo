"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Use window.location for a full page reload to ensure session is set
        window.location.href = "/";
        return;
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 shadow-2xl shadow-[#1DB954]/20">
            <Image src="/teo-logo.png" alt="Teo" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Teo</h1>
          <p className="text-[#B3B3B3] text-sm mt-1">Music for everyone</p>
        </div>

        {/* Form */}
        <div className="bg-[#181818] rounded-xl p-8 shadow-xl border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg p-3 mb-4">
              <p className="text-[#1DB954] text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Full name" className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#1DB954] transition-colors" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" required className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#1DB954] transition-colors" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required minLength={6} className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#1DB954] transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLogin ? "Log in" : "Sign up"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#B3B3B3] text-xs uppercase">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-white/90 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>

          <p className="text-center text-[#B3B3B3] text-sm mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }}
              className="text-white hover:underline font-medium">{isLogin ? "Sign up" : "Log in"}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
