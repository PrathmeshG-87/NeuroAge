import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { appConfig } from '@/config/env'

import { AuthContext, type AuthSession, type AuthStatus } from './auth-context'

const SESSION_STORAGE_KEY = 'neuroage.auth.session'

const isSessionExpired = (session: AuthSession | null): boolean => {
  if (!session?.expiresAt) {
    return false
  }

  return new Date(session.expiresAt).getTime() <= Date.now()
}

const readStoredSession = (): AuthSession | null => {
  try {
    const rawValue = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<AuthSession>
    if (!parsed.userId || !parsed.email) {
      return null
    }

    const nextSession: AuthSession = {
      userId: String(parsed.userId),
      email: String(parsed.email),
      displayName: String(parsed.displayName ?? parsed.email),
      expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : null,
      provider: parsed.provider === 'demo' ? 'demo' : 'backend',
    }

    return isSessionExpired(nextSession) ? null : nextSession
  } catch {
    return null
  }
}

const persistSession = (session: AuthSession | null) => {
  if (!session) {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  const payload: Partial<AuthSession> = {
    userId: session.userId,
    email: session.email,
    displayName: session.displayName,
    expiresAt: session.expiresAt,
    provider: session.provider,
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload))
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initialSession = readStoredSession()
  const [status, setStatus] = useState<AuthStatus>(
    initialSession ? 'authenticated' : 'unauthenticated',
  )
  const [session, setSession] = useState<AuthSession | null>(initialSession)
  const [error, setError] = useState<string | null>(null)

  const isBackendReady = Boolean(appConfig.apiBaseUrl) && !appConfig.isDemoMode

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setError(null)

      if (!email.trim() || !password) {
        setStatus('unauthenticated')
        setError('Email and password are required to continue.')
        return
      }

      if (!isBackendReady) {
        setStatus('unauthenticated')
        setError(
          'Authentication is intentionally disabled until the backend team confirms the sign-in, token, and session contract. This UI will not invent registration fields or token behavior.',
        )
        return
      }

      throw new Error(
        'The backend authentication contract is not yet confirmed. Replace this placeholder with the live sign-in request once the exact API contract is available.',
      )
    },
    [isBackendReady],
  )

  const signOut = useCallback(() => {
    setSession(null)
    setStatus('unauthenticated')
    setError(null)
    persistSession(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  useEffect(() => {
    if (status === 'authenticated' && session) {
      persistSession(session)
      return
    }

    if (
      status === 'unauthenticated' ||
      status === 'expired' ||
      status === 'forbidden'
    ) {
      persistSession(null)
    }
  }, [session, status])

  const value = useMemo(
    () => ({
      status,
      session,
      isAuthenticated: status === 'authenticated' && Boolean(session),
      isBackendReady,
      error,
      signIn,
      signOut,
      clearError,
    }),
    [clearError, error, isBackendReady, session, signIn, signOut, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
