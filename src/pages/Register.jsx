import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth/AuthShell'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { currentUser, role, register, demoCredentials } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'hospital' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (currentUser) {
    return <Navigate to={role === 'hospital' ? '/hospital' : '/consumer'} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await register(form)
      navigate(form.role === 'hospital' ? '/hospital' : '/consumer', { replace: true })
    } catch (registerError) {
      setError(registerError.message || 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register as a hospital or consumer and LifeFlow will route you to the right experience."
      alternateLabel="Back to login"
      alternateLink="/login"
      alternateText="Already have an account?"
      demoCredentials={demoCredentials}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={form.name}
            onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
            placeholder="LifeFlow User"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={form.password}
            onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <select
            value={form.role}
            onChange={(event) => setForm((value) => ({ ...value, role: event.target.value }))}
            className="flex h-11 w-full rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm outline-none dark:border-white/10 dark:bg-white/5"
          >
            <option value="hospital">Hospital</option>
            <option value="consumer">Consumer</option>
          </select>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="mt-0.5 size-4" />
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Create account
        </Button>
      </form>
    </AuthShell>
  )
}
