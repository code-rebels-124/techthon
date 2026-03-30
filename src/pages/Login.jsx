import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth/AuthShell'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { currentUser, role, login, demoCredentials } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (currentUser) {
    return <Navigate to={role === 'hospital' ? '/hospital' : '/consumer'} replace />
  }

  const from = location.state?.from?.pathname

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const user = await login(form.email, form.password)
      const nextRole = user.role || role
      navigate(from || (nextRole === 'hospital' ? '/hospital' : '/consumer'), { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'Unable to log in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Login to LifeFlow"
      subtitle="Use your hospital or consumer account to access the right dashboard instantly."
      alternateLabel="Create an account"
      alternateLink="/register"
      alternateText="Need a new account?"
      demoCredentials={demoCredentials}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
            placeholder="hospital@test.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={form.password}
            onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
            placeholder="••••••••"
            required
          />
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="mt-0.5 size-4" />
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Login
        </Button>
      </form>
    </AuthShell>
  )
}
