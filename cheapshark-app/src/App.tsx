import { lazy, Suspense } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import sharkLogo from './assets/shark.png'

// Chart.js тяжёлый, поэтому страница аналитики грузится отдельным чанком
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`

export default function App() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4">
      <header className="mb-6 flex h-12 items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={sharkLogo}
            alt="CheapShark logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold">CheapShark Explorer</span>
        </div>
        
        <nav className="flex gap-1">
          <NavLink to="/" end className={linkClass}>Поиск</NavLink>
          <NavLink to="/analytics" className={linkClass}>Аналитика</NavLink>
        </nav>
      </header>

      <main>
        <Suspense fallback={<p className="py-8 text-center text-gray-500">Загрузка…</p>}>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}