import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './RecruiterHeader.css'

const RecruiterHeader = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="recruiter-header">
      <div className="recruiter-header-inner">
        <Link to="/recruiter/dashboard" className="recruiter-header-logo">
          <span className="recruiter-header-logo-icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fill="currentColor" opacity="0.9"/>
            </svg>
          </span>
          <span className="recruiter-header-logo-text">Beyond Grades</span>
        </Link>

        <nav className="recruiter-header-nav">
          <Link
            to="/recruiter/dashboard"
            className={`recruiter-header-nav-link ${location.pathname === '/recruiter/dashboard' ? 'active' : ''}`}
          >
            <span className="recruiter-header-nav-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            Dashboard
          </Link>
          <Link
            to="/recruiter/jobs"
            className={`recruiter-header-nav-link ${location.pathname === '/recruiter/jobs' ? 'active' : ''}`}
          >
            <span className="recruiter-header-nav-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </span>
            Jobs Posted
          </Link>
          <Link
            to="/recruiter/skills"
            className={`recruiter-header-nav-link ${location.pathname.startsWith('/recruiter/skills') ? 'active' : ''}`}
          >
            <span className="recruiter-header-nav-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            Skills Available
          </Link>
        </nav>

        <div className="recruiter-header-right">
          <div className="recruiter-header-user" ref={userMenuRef}>
            <button
              type="button"
              className="recruiter-header-user-trigger"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="recruiter-header-avatar" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </span>
              <span className="recruiter-header-user-name">{user?.name || 'User'}</span>
              <span className={`recruiter-header-chevron ${userMenuOpen ? 'open' : ''}`} aria-hidden>▼</span>
            </button>
            <div className={`recruiter-header-dropdown ${userMenuOpen ? 'open' : ''}`}>
              <Link to="/recruiter/profile" className="recruiter-header-dropdown-item" onClick={() => setUserMenuOpen(false)}>Profile</Link>
              <Link to="/recruiter/company" className="recruiter-header-dropdown-item" onClick={() => setUserMenuOpen(false)}>Company details</Link>
              <button type="button" className="recruiter-header-dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default RecruiterHeader
