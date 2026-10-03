import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Navbar onMenuToggle={() => setMobileOpen(v => !v)} />
      <main className="sc-main">
        <Outlet />
      </main>
    </>
  )
}
