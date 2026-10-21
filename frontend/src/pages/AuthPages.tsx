import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/auth/useAuth'

export const SignInPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isBackendReady, error, clearError } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const fromPath =
    (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    clearError()
    setSubmitting(true)

    try {
      await signIn({ email, password })
      navigate(fromPath, { replace: true })
    } catch (signInError) {
      const message =
        signInError instanceof Error
          ? signInError.message
          : 'Unable to sign in.'
      window.alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 py-12 text-[#ebecef]">
      <Card className="w-full max-w-xl rounded-[28px] border border-white/[0.08] bg-[#111217] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#5eead4]/25 bg-[#5eead4]/10 text-[#5eead4]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5eead4]">
              Access control
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef]">
              Sign in
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-[#c6c9d2]">
          Authentication is intentionally gated pending the backend engineer’s
          final contract. This interface does not assume tokens, roles, or
          registration fields until the live API is confirmed.
        </p>

        {!isBackendReady && (
          <div className="mt-5 rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/8 p-4 text-sm text-[#fcd34d]">
            Backend authentication is not active yet. Sign-in remains disabled
            until the backend contract and authorization model are confirmed.
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-[#ef4444]/25 bg-[#ef4444]/8 p-4 text-sm text-[#fca5a5]">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-[#c6c9d2]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="researcher@example.org"
              className="w-full rounded-xl border border-white/10 bg-[#0a0b0e] px-3 py-2.5 text-sm text-[#ebecef] placeholder:text-[#6d7280] focus:border-[#5eead4]/40 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-[#c6c9d2]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-[#0a0b0e] px-3 py-2.5 text-sm text-[#ebecef] placeholder:text-[#6d7280] focus:border-[#5eead4]/40 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !isBackendReady}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5eead4] px-4 py-3 text-sm font-medium text-[#0a0b0e] transition-all duration-150 hover:bg-[#7feee0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Waiting for backend contract...' : 'Sign in'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0a0b0e] p-4 text-sm text-[#c6c9d2]">
          <p className="font-medium text-[#ebecef]">Registration</p>
          <p className="mt-2 leading-7">
            Registration is shown only when the backend explicitly supports it.
            Until then, this page intentionally hides account creation and keeps
            the flow consistent with the confirmed API design.
          </p>
          <Link
            to="/"
            className="mt-3 inline-flex items-center text-[#5eead4] hover:text-[#7feee0]"
          >
            Return to overview
          </Link>
        </div>
      </Card>
    </div>
  )
}

export const RegistrationPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 py-12 text-[#ebecef]">
      <Card className="w-full max-w-xl rounded-[28px] border border-white/[0.08] bg-[#111217] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/8 text-[#fcd34d]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#fcd34d]">
              Registration
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef]">
              Not currently available
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-[#c6c9d2]">
          Registration is unavailable because the backend authentication design
          has not yet been confirmed. The UI intentionally avoids inventing user
          roles or profile fields before the API contract is approved.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/signin"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#0a0b0e] px-4 py-2.5 text-sm font-medium text-[#ebecef] hover:border-white/20"
          >
            Go to sign in
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#5eead4] px-4 py-2.5 text-sm font-medium text-[#0a0b0e] hover:bg-[#7feee0]"
          >
            Back to overview
          </Link>
        </div>
      </Card>
    </div>
  )
}

export const SessionExpiredPage: React.FC = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleRecover = () => {
    signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 py-12 text-[#ebecef]">
      <Card className="w-full max-w-xl rounded-[28px] border border-[#f59e0b]/25 bg-[#111217] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/8 text-[#fcd34d]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#fcd34d]">
              Session
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef]">
              Session expired
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-[#c6c9d2]">
          Your session is no longer valid or it expired before the backend
          confirmed it. Please sign in again to continue to private assessments
          and reports.
        </p>

        <button
          type="button"
          onClick={handleRecover}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#5eead4] px-4 py-3 text-sm font-medium text-[#0a0b0e] transition-all duration-150 hover:bg-[#7feee0]"
        >
          Return to sign in
        </button>
      </Card>
    </div>
  )
}

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 py-12 text-[#ebecef]">
      <Card className="w-full max-w-xl rounded-[28px] border border-[#ef4444]/25 bg-[#111217] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ef4444]/25 bg-[#ef4444]/8 text-[#fca5a5]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#fca5a5]">
              Unauthorized
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef]">
              Authentication required
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-[#c6c9d2]">
          You are not signed in and therefore cannot access private assessment
          history or protected report pages. Sign in with the
          backend-authenticated account to continue.
        </p>

        <Link
          to="/signin"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#5eead4] px-4 py-3 text-sm font-medium text-[#0a0b0e] hover:bg-[#7feee0]"
        >
          Go to sign in
        </Link>
      </Card>
    </div>
  )
}

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0e] px-4 py-12 text-[#ebecef]">
      <Card className="w-full max-w-xl rounded-[28px] border border-[#ef4444]/25 bg-[#111217] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ef4444]/25 bg-[#ef4444]/8 text-[#fca5a5]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#fca5a5]">
              Forbidden
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef]">
              Access denied
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-[#c6c9d2]">
          Your account has no access to this private resource. The backend
          remains the source of truth for authorization; if this is unexpected,
          contact the project administrator or sign in with a different account.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#0a0b0e] px-4 py-2.5 text-sm font-medium text-[#ebecef] hover:border-white/20"
          >
            Return to dashboard
          </Link>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center rounded-xl bg-[#5eead4] px-4 py-2.5 text-sm font-medium text-[#0a0b0e] hover:bg-[#7feee0]"
          >
            Sign in again
          </Link>
        </div>
      </Card>
    </div>
  )
}
