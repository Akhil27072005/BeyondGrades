import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'
import './CompanyRegistration.css'

const RecruiterProfile = () => {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    contactPhone: '',
    linkedInUrl: ''
  })
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await recruitersAPI.getProfile()
        setProfile(data)
        const initial = {
          name: data.name || '',
          jobTitle: data.jobTitle || '',
          contactPhone: data.contactPhone || '',
          linkedInUrl: data.linkedInUrl || ''
        }
        setFormData(initial)
        setInitialData(initial)
      } catch (err) {
        setError('Failed to load profile')
        console.error('Profile error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSuccess('')
    setError('')
  }

  const isDirty = () => {
    if (!initialData) return false
    return (
      formData.name !== initialData.name ||
      formData.jobTitle !== initialData.jobTitle ||
      formData.contactPhone !== initialData.contactPhone ||
      formData.linkedInUrl !== initialData.linkedInUrl
    )
  }

  const handleCancel = () => {
    if (initialData) setFormData({ ...initialData })
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    if (!isDirty()) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await recruitersAPI.updateProfile({
        name: formData.name || undefined,
        jobTitle: formData.jobTitle || undefined,
        contactPhone: formData.contactPhone || undefined,
        linkedInUrl: formData.linkedInUrl || undefined
      })
      const nextInitial = {
        name: updated.recruiter?.name ?? formData.name,
        jobTitle: updated.recruiter?.jobTitle ?? formData.jobTitle,
        contactPhone: updated.recruiter?.contactPhone ?? formData.contactPhone,
        linkedInUrl: updated.recruiter?.linkedInUrl ?? formData.linkedInUrl
      }
      setFormData(nextInitial)
      setInitialData(nextInitial)
      if (updated.recruiter) setProfile(prev => (prev ? { ...prev, ...updated.recruiter } : updated.recruiter))
      setSuccess('Profile saved successfully.')
    } catch (err) {
      setError('Failed to save profile.')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="company-details-page">
        <div className="company-details-container">
          <div className="company-details-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="company-details-page">
      <div className="company-details-container">
        {/* Hero: avatar + name + email */}
        <div className="company-details-hero">
          <div className="company-details-hero-logo" aria-hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="company-details-hero-text">
            <div className="company-details-hero-title-row">
              <h1 className="company-details-hero-name">
                {formData.name || profile?.name || 'Your name'}
              </h1>
            </div>
            <p className="company-details-hero-url">
              {profile?.email || ''}
            </p>
          </div>
          <Link to="/recruiter/dashboard" className="company-details-view-profile">
            View dashboard
          </Link>
        </div>

        {isDirty() && (
          <div className="company-details-toolbar">
            <div className="company-details-actions">
              <button type="button" className="company-details-btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="company-details-btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )}
        {error && <div className="company-details-message company-details-error" role="alert">{error}</div>}
        {success && <div className="company-details-message company-details-success" role="status">{success}</div>}

        {/* Personal information */}
        <section className="company-details-section">
          <h2 className="company-details-section-title">Personal information</h2>
          <p className="company-details-section-desc">Your name, email and contact details.</p>
          <div className="company-details-field">
            <label className="company-details-label">Full name</label>
            <input
              type="text"
              className="company-details-input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="company-details-field">
            <label className="company-details-label">Email</label>
            <input
              type="email"
              className="company-details-input"
              value={profile?.email || ''}
              readOnly
              disabled
              aria-readonly="true"
            />
            <p className="company-details-hint">Email cannot be changed here. Contact support if you need to update it.</p>
          </div>
          <div className="company-details-field">
            <label className="company-details-label">Job title</label>
            <input
              type="text"
              className="company-details-input"
              value={formData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="e.g. Talent Lead, HR Manager"
            />
          </div>
          <div className="company-details-field">
            <label className="company-details-label">Contact phone</label>
            <input
              type="tel"
              className="company-details-input"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="company-details-field">
            <label className="company-details-label">LinkedIn profile</label>
            <input
              type="url"
              className="company-details-input"
              value={formData.linkedInUrl}
              onChange={(e) => handleChange('linkedInUrl', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </section>

        {/* Company reference */}
        <section className="company-details-section">
          <h2 className="company-details-section-title">Company</h2>
          <p className="company-details-section-desc">You are part of this company. Edit company details separately.</p>
          <div className="company-details-field">
            <label className="company-details-label">Company name</label>
            <p className="company-details-readonly-value">
              {profile?.companyName || '—'}
            </p>
            <Link to="/recruiter/company" className="company-details-link">
              Edit company details →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RecruiterProfile
