import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Skeleton } from '../components/ui/skeleton'

export function ProtectedRoute({ allowedRoles = [] }) {
  const { currentUser, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-64 rounded-[32px]" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'hospital' ? '/hospital' : '/consumer'} replace />
  }

  return <Outlet />
}
