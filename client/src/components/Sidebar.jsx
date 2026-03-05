import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const defaultLogo = (
  <div className="app-sidebar-logo-icon" aria-hidden>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="14" y="14" width="8" height="8" rx="1" fill="currentColor" opacity="0.9" />
    </svg>
  </div>
)

const defaultPromo = (
  <div className="app-sidebar-promo-inner">
    <p className="app-sidebar-promo-title">Now available on your phone</p>
    <div className="app-sidebar-promo-visual" aria-hidden>
      <div className="app-sidebar-promo-placeholder">
        <i className="bi bi-phone" />
      </div>
    </div>
  </div>
)

/**
 * Reusable sidebar with header (logo + app name), nav links (icon + label), and optional bottom section.
 * @param {Object} props
 * @param {string} [props.appName='BeyondGrades'] - Application name in header
 * @param {React.ReactNode} [props.logo] - Logo element; defaults to grid icon
 * @param {Array<{ to: string, icon: string, label: string }>} props.items - Nav items (to, icon class e.g. 'bi-house', label)
 * @param {React.ReactNode} [props.bottomContent] - If provided, renders at bottom instead of promo (e.g. Profile + Logout)
 * @param {React.ReactNode} [props.promoContent] - Bottom promo card content when bottomContent not provided
 * @param {boolean} [props.showPromo=true] - Set false to hide the promo when bottomContent is not provided
 */
const Sidebar = ({
  appName = 'BeyondGrades',
  logo = defaultLogo,
  items = [],
  bottomContent = null,
  promoContent = defaultPromo,
  showPromo = true
}) => {
  const location = useLocation()
  const showBottom = bottomContent != null || showPromo
  const bottomSectionContent = bottomContent != null ? bottomContent : promoContent

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-header">
        <div className="app-sidebar-logo">
          {logo}
        </div>
        <span className="app-sidebar-app-name">{appName}</span>
      </div>

      <nav className="app-sidebar-nav">
        {items.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
          const className = `app-sidebar-nav-item ${isActive ? 'app-sidebar-nav-item-active' : ''}`
          const linkContent = (
            <>
              <i className={`bi ${item.icon}`} aria-hidden />
              <span className="app-sidebar-nav-label">{item.label}</span>
            </>
          )
          if (item.to.startsWith('http')) {
            return (
              <a key={item.to} className={className} href={item.to} target="_blank" rel="noopener noreferrer">
                {linkContent}
              </a>
            )
          }
          return (
            <Link key={item.to} className={className} to={item.to}>
              {linkContent}
            </Link>
          )
        })}
      </nav>

      {showBottom && (
        <div className="app-sidebar-bottom">
          {bottomSectionContent}
        </div>
      )}
    </aside>
  )
}

export default Sidebar
