'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        router.push('/dashboard');
      } else {
        // Auto-login after registration could be done, or just switch to login
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-gradient-animate">
      <div className="w-full max-w-md p-8 rounded-2xl glass text-white">
        <h1 className="text-4xl font-bold text-center mb-8 drop-shadow-lg">
          KodbankApp
        </h1>

        <div className="flex mb-6 bg-white/10 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md font-medium transition-all ${isLogin ? 'bg-white text-blue-900 shadow' : 'text-white/80 hover:text-white'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-md font-medium transition-all ${!isLogin ? 'bg-white text-blue-900 shadow' : 'text-white/80 hover:text-white'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/50 border border-red-500 rounded-lg text-sm text-center font-medium backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-white/90">Customer Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Customer Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Customer Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-white text-blue-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </main>
  );
}
