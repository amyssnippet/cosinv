import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const JobBoard = lazy(() => import('@/pages/JobBoard'))
const JobDetail = lazy(() => import('@/pages/JobDetail'))
const PracticeArena = lazy(() => import('@/pages/PracticeArena'))
const UserProfile = lazy(() => import('@/pages/UserProfile'))
const LMSPath = lazy(() => import('@/pages/LMSPath'))
const InterviewSetup = lazy(() => import('@/pages/InterviewSetup'))
const InterviewRoom = lazy(() => import('@/pages/InterviewRoom'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
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
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/practice" element={<PracticeArena />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/learn" element={<LMSPath />} />
        </Route>
        
        {/* Interview routes (fullscreen) */}
        <Route path="/interview/setup/:id" element={<InterviewSetup />} />
        <Route path="/interview/room/:id" element={<InterviewRoom />} />
      </Routes>
    </Suspense>
  )
}

export default App
