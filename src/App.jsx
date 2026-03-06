import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, ChevronRight } from 'lucide-react'
import ApprovalStatusVisibility from './pages/ApprovalStatusVisibility'

const NAV = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Approvals', path: '/feature', icon: ChevronRight },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-sky-500 rounded-md flex items-center justify-center text-white font-bold text-sm">V</div>
          <span className="font-semibold text-sm">Varicon</span>
          <span className="ml-auto text-xs text-white/30 bg-white/10 px-1.5 py-0.5 rounded">proto</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-white/30">Client Prototype</p>
      </div>
    </aside>
  )
}

function Header() {
  const loc = useLocation()
  const current = NAV.find(n => n.path === loc.pathname) || NAV[0]
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 gap-4">
      <h1 className="text-sm font-semibold text-gray-900">{current.label}</h1>
      <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Prototype — not production</span>
      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold">V</div>
    </header>
  )
}

function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome to the prototype</h2>
      <p className="text-sm text-gray-500 mb-6">This prototype was generated from a Varicon discovery session.</p>
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sm text-sky-800">
        <strong>What was built:</strong> Bishwas Shrestha met with Jess to understand pain points for the Financial Integrity Team, where Jess expressed frustration that issues raised since May of the previous year still lack resolution. Key problems include a broken three-phase approval visibility system, a dysfunctional approval filter, GST rounding discrepancies, bill syncing failures with Xero, and Day Works limitations around notes and charge rate visibility. The team acknowledged all issues and committed to mocking up designs for the highest priority items before development.
        <br/><br/>Navigate to <strong>Approvals</strong> in the sidebar to see the prototype.
      </div>
    </div>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-400 mt-1">Not part of this prototype.</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/feature" element={<ApprovalStatusVisibility />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
