import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Briefcase, 
  Code2, 
  GraduationCap,
  User,
  Settings,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Jobs', href: '/jobs' },
  { icon: Code2, label: 'Practice', href: '/practice' },
  { icon: GraduationCap, label: 'Learn', href: '/learn' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
]

const bottomItems = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-900/50 border-r border-gray-800 hidden lg:flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
