import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { profilesAPI } from '../api/profiles'
import './ViewRecruiterProfile.css'

const ViewRecruiterProfile = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profilesAPI.getRecruiterPublic(id)
        setProfile(data)
      } catch (err) {
        setError('Profile not found.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="view-recruiter-profile-page">
        <div className="view-recruiter-profile-container">
          <div className="view-recruiter-profile-loading">
            <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="view-recruiter-profile-page">
        <div className="view-recruiter-profile-container">
          <p className="view-recruiter-profile-error">{error || 'Profile not found.'}</p>
          <Link to="/student/search" className="view-recruiter-profile-back">← Back to search</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="view-recruiter-profile-page">
      <div className="view-recruiter-profile-container">
        <Link to="/student/search" className="view-recruiter-profile-back">← Back to search</Link>

        <div className="view-recruiter-profile-hero">
          <div className="view-recruiter-profile-avatar" aria-hidden>
            {(profile.name || '?')[0].toUpperCase()}
          </div>
          <div className="view-recruiter-profile-hero-text">
            <h1 className="view-recruiter-profile-name">{profile.name}</h1>
            {profile.jobTitle && (
              <p className="view-recruiter-profile-meta">{profile.jobTitle}</p>
            )}
            {profile.companyName && (
              <p className="view-recruiter-profile-meta view-recruiter-profile-company">
                {profile.companyName}
              </p>
            )}
          </div>
        </div>

        <section className="view-recruiter-profile-section">
          <h2 className="view-recruiter-profile-section-title">Contact & links</h2>
          <div className="view-recruiter-profile-readonly">
            {profile.companyWebsite && (
              <p>
                <strong>Company website:</strong>{' '}
                <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" className="view-recruiter-profile-link">
                  {profile.companyWebsite}
                </a>
              </p>
            )}
            {profile.linkedInUrl && (
              <p>
                <strong>LinkedIn:</strong>{' '}
                <a href={profile.linkedInUrl.startsWith('http') ? profile.linkedInUrl : `https://linkedin.com/in/${profile.linkedInUrl}`} target="_blank" rel="noopener noreferrer" className="view-recruiter-profile-link">
                  View profile
                </a>
              </p>
            )}
            {!profile.companyWebsite && !profile.linkedInUrl && (
              <p className="view-recruiter-profile-muted">No contact links available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ViewRecruiterProfile
