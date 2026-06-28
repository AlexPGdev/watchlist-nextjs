'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { signOutAction } from '@/app/auth/actions';

export function NavAuth() {
  const { user, loading, refreshAuth } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded bg-gray-700" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {user.firstName || user.email}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void refreshAuth({ ensureSignedIn: true })}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      Sign in
    </button>
  );
}
