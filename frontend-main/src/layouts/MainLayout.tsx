import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
