import { createContext } from 'react'

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'expired'
  | 'forbidden'

export interface AuthSession {
  userId: string
  email: string
  displayName: string
  expiresAt: string | null
  provider: 'backend' | 'demo'
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AuthContextValue {
  status: AuthStatus
  session: AuthSession | null
  isAuthenticated: boolean
  isBackendReady: boolean
  error: string | null
  signIn: (payload: SignInRequest) => Promise<void>
  signOut: () => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
