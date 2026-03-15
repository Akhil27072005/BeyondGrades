import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { profilesAPI } from '../api/profiles'
import './ViewCompanyProfile.css'

const ViewCompanyProfile = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profilesAPI.getCompanyPublic(id)
        setProfile(data)
      } catch (err) {
        setError('Company not found.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="view-company-profile-page">
        <div className="view-company-profile-container">
          <div className="view-company-profile-loading">
            <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="view-company-profile-page">
        <div className="view-company-profile-container">
          <p className="view-company-profile-error">{error || 'Company not found.'}</p>
          <Link to="/student/search" className="view-company-profile-back">← Back to search</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="view-company-profile-page">
      <div className="view-company-profile-container">
        <Link to="/student/search" className="view-company-profile-back">← Back to search</Link>

        <div className="view-company-profile-hero">
          <div className="view-company-profile-icon" aria-hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div className="view-company-profile-hero-text">
            <h1 className="view-company-profile-name">{profile.name}</h1>
            {profile.size && (
              <p className="view-company-profile-meta">{profile.size} employees</p>
            )}
            {profile.type && (
              <p className="view-company-profile-meta">{profile.type}</p>
            )}
          </div>
        </div>

        {profile.description && (
          <section className="view-company-profile-section">
            <h2 className="view-company-profile-section-title">About</h2>
            <p className="view-company-profile-description">{profile.description}</p>
          </section>
        )}

        <section className="view-company-profile-section">
          <h2 className="view-company-profile-section-title">Details</h2>
          <div className="view-company-profile-readonly">
            {profile.website && (
              <p>
                <strong>Website:</strong>{' '}
                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="view-company-profile-link">
                  {profile.website}
                </a>
              </p>
            )}
            {profile.address && <p><strong>Address:</strong> {profile.address}</p>}
            {(profile.city || profile.country) && (
              <p><strong>Location:</strong> {[profile.city, profile.country].filter(Boolean).join(', ')}</p>
            )}
            {!profile.website && !profile.address && !profile.city && !profile.country && (
              <p className="view-company-profile-muted">No additional details available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ViewCompanyProfile
