'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../../../components/admin/Admin.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role === 'USER') {
      router.replace('/');
      return;
    }

    if (session?.user?.role === 'ADMIN_ASSISTANT') {
      router.replace('/admin/assistant');
      return;
    }

    if (session?.user?.canAccessAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [router, session]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch('/api/auth/session');
    const nextSession = await sessionResponse.json();
    const nextRole = nextSession?.user?.role;

    setLoading(false);

    if (nextRole === 'ADMIN_ASSISTANT') {
      router.push('/admin/assistant');
    } else {
      router.push('/admin/dashboard');
    }

    router.refresh();
  }

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginPanel}>
        <div className={styles.loginHeader}>
          <h1>AQO Admin</h1>
          <p>Staff sign-in only</p>
        </div>

        {error ? <div className={styles.loginError}>{error}</div> : null}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading} className={styles.primaryAction}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.loginHelp}>
          <p>Demo accounts:</p>
          <p>`admin@airqualityorange.org`</p>
          <p>`assistant@airqualityorange.org`</p>
          <p>Regular users should use `/login`.</p>
        </div>
      </div>
    </div>
  );
}
