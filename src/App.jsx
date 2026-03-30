import { Menu } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/layout/sidebar'
import { Topbar } from './components/layout/topbar'
import { Button } from './components/ui/button'
import { Skeleton } from './components/ui/skeleton'
import { useAuth } from './context/AuthContext'
import { useLifeFlowData } from './hooks/use-lifeflow-data'
import { ProtectedRoute } from './routes/ProtectedRoute'

const LoginPage = lazy(() => import('./pages/Login').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/Register').then((module) => ({ default: module.RegisterPage })))
const HospitalDashboardPage = lazy(() =>
  import('./pages/HospitalDashboard').then((module) => ({ default: module.HospitalDashboardPage })),
)
const ConsumerDashboardPage = lazy(() =>
  import('./pages/ConsumerDashboard').then((module) => ({ default: module.ConsumerDashboardPage })),
)
const HospitalsPage = lazy(() => import('./pages/hospitals-page').then((module) => ({ default: module.HospitalsPage })))
const InsightsPage = lazy(() => import('./pages/insights-page').then((module) => ({ default: module.InsightsPage })))
const EmergencyPage = lazy(() => import('./pages/emergency-page').then((module) => ({ default: module.EmergencyPage })))
const DonorFinderPage = lazy(() => import('./pages/DonorFinder').then((module) => ({ default: module.DonorFinderPage })))

function RouteSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[220px] rounded-[34px]" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-[320px]" />
        <Skeleton className="h-[320px]" />
      </div>
    </div>
  )
}

function AppShell({ data, darkMode, onToggleDarkMode }) {
  const { currentUser, role, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.22),transparent_30%),radial-gradient(circle_at_right,rgba(251,146,60,0.15),transparent_25%),linear-gradient(180deg,#fff7f8,#fffdfd_45%,#fff7f8)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_30%),radial-gradient(circle_at_right,rgba(249,115,22,0.10),transparent_25%),linear-gradient(180deg,#130f17,#18111e_45%,#110f16)]" />

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
        <Sidebar
          role={role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 bg-slate-950/40 xl:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="h-full w-[300px] p-4" onClick={(event) => event.stopPropagation()}>
              <Sidebar className="block w-full" role={role} />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between xl:hidden">
            <Button variant="secondary" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-5" />
            </Button>
          </div>

          <Topbar
            notifications={data.notifications}
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            currentUser={currentUser}
            role={role}
            onLogout={logout}
          />

          <Outlet />
        </main>
      </div>
    </div>
  )
}

function App() {
  const { data, loading, error } = useLifeFlowData()
  const { currentUser, role } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const homeRoute = role === 'hospital' ? '/hospital' : '/consumer'

  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Routes>
        <Route path="/" element={<Navigate to={currentUser ? homeRoute : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell data={data} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} />}>
            <Route path="/hospitals" element={<HospitalsPage fallbackHospitals={data.hospitalSummaries} />} />
            <Route path="/emergency" element={<EmergencyPage fallbackMatches={data.emergencyMatches} />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
          <Route element={<AppShell data={data} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} />}>
            <Route path="/hospital" element={<HospitalDashboardPage data={data} loading={loading} />} />
            <Route
              path="/insights"
              element={<InsightsPage predictions={data.predictions} suggestions={data.redistributionSuggestions} />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
          <Route element={<AppShell data={data} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} />}>
            <Route path="/consumer" element={<ConsumerDashboardPage data={data} loading={loading} />} />
            <Route path="/donors" element={<DonorFinderPage fallbackDonors={data.donors} />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={currentUser ? homeRoute : '/login'} replace />} />
      </Routes>

      {error && currentUser ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[24px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-900 backdrop-blur dark:text-amber-200">
          {error}
        </div>
      ) : null}
    </Suspense>
  )
}

export default App
