import { useState } from 'react';
import type { FormEvent } from 'react';
import { login, logout } from '../../lib/admin';
import { useIsAdmin } from '../../lib/useAdmin';

const field =
  'w-full rounded-[14px] border border-cloud bg-snow px-3.5 py-2.5 text-[15px] text-obsidian outline-none transition-colors focus:border-obsidian';

export default function AdminAuth() {
  const isAdmin = useIsAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  if (isAdmin) {
    return (
      <div className="card p-7 text-center sm:p-8">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-obsidian">
          You're signed in
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-steel">
          Write, edit and delete controls are now visible across the site.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/ideas/new/"
            className="inline-flex items-center justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-2.5 text-[15px] font-medium text-snow transition-colors hover:bg-graphite"
          >
            Write a thought
          </a>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center justify-center rounded-[14px] border border-cloud bg-snow px-5 py-2.5 text-[15px] font-medium text-graphite transition-colors hover:border-mist"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-5 p-7 sm:p-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-obsidian">
          Author sign in
        </h1>
        <p className="mt-1 text-[14px] text-steel">Only the author can write and manage content.</p>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-graphite">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          placeholder="you@example.com"
          autoComplete="username"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-graphite">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </label>
      {error && <p className="text-[13px] text-ember">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-2.5 text-[15px] font-medium text-snow transition-colors hover:bg-graphite disabled:opacity-60"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
