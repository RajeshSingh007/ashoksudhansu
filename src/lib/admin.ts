import { supabase } from './supabase';

// Ashok's auth user id (Auth → Users). Admin UI state is pinned to this so that
// even if public signup is ever enabled, other accounts aren't treated as admin.
// (Server-side writes are independently enforced by the RLS policies.)
export const ADMIN_UID = '99131b13-2d7f-4c30-9923-5b4000683ac4';

export async function login(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function checkAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id === ADMIN_UID;
}

/** Subscribe to admin/login state changes. Returns an unsubscribe function. */
export function onAdminChange(cb: (isAdmin: boolean) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.id === ADMIN_UID);
  });
  return () => data.subscription.unsubscribe();
}
