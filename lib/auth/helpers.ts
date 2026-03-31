// STATUS: done | CHAT.0
/**
 * lib/auth/helpers.ts
 * Thin auth wrappers for API route handlers.
 * Server-only. Do not import from client components.
 */

import { auth } from '@/lib/auth'
import type { Session } from 'next-auth'

/**
 * Returns the current NextAuth session for use in API routes.
 * Throws if the user is not authenticated — caller catches and returns 401.
 */
export async function getRequiredSession(): Promise<Session & { user: NonNullable<Session['user']> & { id: string } }> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthenticated')
  }
  return session as Session & { user: NonNullable<Session['user']> & { id: string } }
}
