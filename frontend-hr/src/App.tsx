import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Layouts
import MainLayout from '@/layouts/MainLayout'

// Lazy load pages
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const CreateJob = lazy(() => import('@/pages/CreateJob'))
const JobManager = lazy(() => import('@/pages/JobManager'))
const CandidateList = lazy(() => import('@/pages/CandidateList'))
const CandidateReport = lazy(() => import('@/pages/CandidateReport'))
const LiveInterview = lazy(() => import('@/pages/LiveInterview'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md p-8">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-4">
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs/create" element={<CreateJob />} />
          <Route path="/jobs" element={<JobManager />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidate/:id" element={<CandidateReport />} />
        </Route>
        
        {/* Live Interview (fullscreen) */}
        <Route path="/live/:id" element={<LiveInterview />} />
      </Routes>
    </Suspense>
  )
}

export default App
