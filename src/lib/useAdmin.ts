import { useEffect, useState } from 'react';
import { checkAdmin, onAdminChange } from './admin';

/** React hook: true only when Ashok is signed in. Drives admin-only UI. */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    checkAdmin().then(setIsAdmin);
    return onAdminChange(setIsAdmin);
  }, []);
  return isAdmin;
}
