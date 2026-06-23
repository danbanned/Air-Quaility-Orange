'use client';

import { useEffect, useState } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../components/admin/Admin.module.css';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  function getUserDestination() {
    const callbackUrl = searchParams.get('callbackUrl');
    return callbackUrl && callbackUrl !== '/' ? callbackUrl : '/voices';
  }

  useEffect(() => {
    const callbackUrl = getUserDestination();

    if (session?.user?.role === 'ADMIN_ASSISTANT') {
      router.replace('/admin/assistant');
      return;
    }

    if (session?.user?.canAccessAdmin) {
      router.replace('/admin/dashboard');
      return;
    }

    if (session?.user?.role === 'USER') {
      router.replace(callbackUrl);
    }
  }, [router, searchParams, session]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const callbackUrl = getUserDestination();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    let nextSession = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      nextSession = await getSession();

      if (nextSession?.user?.role) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    const nextRole = nextSession?.user?.role;

    setLoading(false);

    if (nextRole === 'ADMIN') {
      router.replace('/admin/dashboard');
    } else if (nextRole === 'ADMIN_ASSISTANT') {
      router.replace('/admin/assistant');
    } else {
      router.replace(callbackUrl);
    }

    router.refresh();
  }

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginPanel}>
        <div className={styles.loginHeader}>
          <h1>AQO Login</h1>
          <p>Sign in to access your account</p>
        </div>

        {error ? <div className={styles.loginError}>{error}</div> : null}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <label className={styles.field}>
            <span>Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          <button type="submit" disabled={loading} className={styles.primaryAction}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
