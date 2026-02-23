'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient(); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Cek kalau udah login, lempar ke dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/');
    };
    checkUser();
  }, [router, supabase]); // Tambahkan supabase ke dependency array

  // Fungsi Login / Register pakai Email
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLoginMode) {
      // Proses Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Gagal login: " + error.message);
      else router.push('/');
    } else {
      // Proses Register
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert("Gagal register: " + error.message);
      else {
        alert("Berhasil register! Silakan login.");
        setIsLoginMode(true);
        setPassword('');
      }
    }
    setLoading(false);
  };

  // Fungsi Login Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) alert("Gagal login: " + error.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Flowly.</h1>
        <p className="text-slate-500 mb-8 text-sm">
          {isLoginMode ? "Welcome back! Let's track." : "Join us to track your flow."}
        </p>

        {/* --- FORM EMAIL & PASSWORD --- */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {/* --- PEMBATAS (OR) --- */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* --- TOMBOL GOOGLE --- */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          {/* Logo Google */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* --- TOGGLE LOGIN/REGISTER --- */}
        <p className="mt-8 text-sm text-slate-500">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="ml-1 text-blue-600 font-bold hover:underline focus:outline-none"
          >
            {isLoginMode ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}