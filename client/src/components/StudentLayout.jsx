import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import './StudentLayout.css'

const SIDEBAR_NAV_ITEMS = [
  { to: '/student/dashboard', icon: 'bi-house-door-fill', label: 'Dashboard' },
  { to: '/student/profile', icon: 'bi-person-fill', label: 'Profile' },
  { to: '/student/calendar', icon: 'bi-calendar3', label: 'Calendar' },
  { to: '/student/projects', icon: 'bi-folder2-open', label: 'Projects' },
  { to: '/student/jobs', icon: 'bi-briefcase-fill', label: 'Jobs' },
  { to: '/student/alumni', icon: 'bi-people-fill', label: 'Alumni' }
]

const StudentLayout = ({ children }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const bottomContent = (
    <div className="app-sidebar-bottom-actions">
      <Link to="/student/profile" className="app-sidebar-nav-item">
        <i className="bi bi-person-fill" aria-hidden />
        <span className="app-sidebar-nav-label">Profile</span>
      </Link>
      <button type="button" className="app-sidebar-nav-item" onClick={handleLogout}>
        <i className="bi bi-power" aria-hidden />
        <span className="app-sidebar-nav-label">Logout</span>
      </button>
    </div>
  )

  return (
    <div className="student-layout">
      <Sidebar
        items={SIDEBAR_NAV_ITEMS}
        appName="BeyondGrades"
        bottomContent={bottomContent}
        showPromo={false}
      />
      <main className="student-layout-main">
        {children}
      </main>
    </div>
  )
}

export default StudentLayout
