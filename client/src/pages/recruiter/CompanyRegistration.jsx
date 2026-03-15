import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'
import './CompanyRegistration.css'

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

const CompanyRegistration = () => {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    companySize: '',
    linkedInUrl: '',
    logoInReports: true,
    logoInEmails: true
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
          companyName: data.companyName || '',
          companyWebsite: data.companyWebsite || '',
          companyDescription: data.companyDescription || '',
          companySize: data.companySize || '',
          linkedInUrl: data.linkedInUrl || '',
          logoInReports: true,
          logoInEmails: true
        }
        setFormData(initial)
        setInitialData(initial)
      } catch (err) {
        setError('Failed to load company details')
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
      formData.companyName !== initialData.companyName ||
      formData.companyWebsite !== initialData.companyWebsite ||
      formData.companyDescription !== initialData.companyDescription ||
      formData.companySize !== initialData.companySize ||
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
      const updated = await recruitersAPI.updateCompanyDetails({
        companyName: formData.companyName || undefined,
        companyWebsite: formData.companyWebsite || undefined,
        companyDescription: formData.companyDescription || undefined,
        companySize: formData.companySize || undefined,
        linkedInUrl: formData.linkedInUrl || undefined
      })
      const nextInitial = {
        companyName: updated.recruiter?.companyName ?? formData.companyName,
        companyWebsite: updated.recruiter?.companyWebsite ?? formData.companyWebsite,
        companyDescription: updated.recruiter?.companyDescription ?? formData.companyDescription,
        companySize: updated.recruiter?.companySize ?? formData.companySize,
        linkedInUrl: updated.recruiter?.linkedInUrl ?? formData.linkedInUrl,
        logoInReports: formData.logoInReports,
        logoInEmails: formData.logoInEmails
      }
      setFormData(prev => ({ ...prev, ...nextInitial }))
      setInitialData(nextInitial)
      if (updated.recruiter) setProfile(prev => (prev ? { ...prev, ...updated.recruiter } : updated.recruiter))
      setSuccess('Company details saved successfully.')
    } catch (err) {
      setError('Failed to save company details.')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const publicHandle = (formData.companyName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'company'

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
        {/* Hero: logo + name + public URL + View profile */}
        <div className="company-details-hero">
          <div className="company-details-hero-logo" aria-hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div className="company-details-hero-text">
            <div className="company-details-hero-title-row">
              <h1 className="company-details-hero-name">
                {formData.companyName || 'Company name'}
              </h1>
              {profile && (
                <span className={`company-details-badge company-details-badge-chip ${profile.verified ? 'verified' : 'pending'}`}>
                  {profile.verified ? 'Verified' : 'Pending verification'}
                </span>
              )}
            </div>
            <p className="company-details-hero-url">
              beyondgrades.com/
              <span className="company-details-hero-handle">{publicHandle}</span>
            </p>
            {profile && !profile.verified && (
              <p className="company-details-hero-status">Your company registration is under review. You’ll be notified once verified.</p>
            )}
          </div>
          <Link to="/recruiter/dashboard" className="company-details-view-profile">
            View profile
          </Link>
        </div>

        {/* Actions only when there are unsaved edits */}
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

        {/* Section 1: Public profile */}
        <section className="company-details-section">
          <h2 className="company-details-section-title">Public profile</h2>
          <p className="company-details-section-desc">This will be displayed on your profile.</p>
          <div className="company-details-field">
            <label className="company-details-label">Company name</label>
            <input
              type="text"
              className="company-details-input"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="e.g. Acme Inc."
            />
          </div>
          <div className="company-details-field company-details-field-prefix">
            <label className="company-details-label">Public URL</label>
            <div className="company-details-input-wrap">
              <span className="company-details-prefix">beyondgrades.com/</span>
              <input
                type="text"
                className="company-details-input company-details-input-inline"
                value={publicHandle}
                readOnly
                placeholder="company"
              />
            </div>
            <p className="company-details-hint">Derived from company name. Used in your public profile URL.</p>
          </div>
        </section>

        {/* Section 2: Company information */}
        <section className="company-details-section">
          <h2 className="company-details-section-title">Company information</h2>
          <p className="company-details-section-desc">Website, size and description.</p>
          <div className="company-details-field">
            <label className="company-details-label">Website</label>
            <input
              type="url"
              className="company-details-input"
              value={formData.companyWebsite}
              onChange={(e) => handleChange('companyWebsite', e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div className="company-details-field">
            <label className="company-details-label">Company size</label>
            <select
              className="company-details-input company-details-select"
              value={formData.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
            >
              <option value="">Select size</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>{size} employees</option>
              ))}
            </select>
          </div>
          <div className="company-details-field">
            <label className="company-details-label">Description</label>
            <textarea
              className="company-details-input company-details-textarea"
              rows={4}
              value={formData.companyDescription}
              onChange={(e) => handleChange('companyDescription', e.target.value)}
              placeholder="Tell us about your company, its mission, and what makes it unique."
            />
          </div>
        </section>

        {/* Section 3: Company logo */}
        <section className="company-details-section">
          <h2 className="company-details-section-title">Company logo</h2>
          <p className="company-details-section-desc">
            Update your company logo and then choose where you want it to display.
          </p>
          <div className="company-details-logo-row">
            <div className="company-details-logo-preview" aria-hidden>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <div className="company-details-upload">
              <div className="company-details-upload-zone">
                <svg className="company-details-upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="company-details-upload-text">
                  <span className="company-details-upload-link">Click to upload</span>
                  {' '}or drag and drop
                </p>
                <p className="company-details-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Branding */}
        <section className="company-details-section">
          <h2 className="company-details-section-title">Branding</h2>
          <p className="company-details-section-desc">Add your logo to reports and emails.</p>
          <a href="#branding-examples" className="company-details-link">View examples</a>
          <div className="company-details-checkboxes">
            <label className="company-details-checkbox">
              <input
                type="checkbox"
                checked={formData.logoInReports}
                onChange={(e) => handleChange('logoInReports', e.target.checked)}
              />
              <span className="company-details-checkbox-box" />
              <span>
                <strong>Reports</strong> — Include my logo in summary reports.
              </span>
            </label>
            <label className="company-details-checkbox">
              <input
                type="checkbox"
                checked={formData.logoInEmails}
                onChange={(e) => handleChange('logoInEmails', e.target.checked)}
              />
              <span className="company-details-checkbox-box" />
              <span>
                <strong>Emails</strong> — Include my logo in customer emails.
              </span>
            </label>
          </div>
        </section>

        {/* Section 5: Social profiles */}
        <section className="company-details-section">
          <h2 className="company-details-section-title">Social profiles</h2>
          <p className="company-details-section-desc">Links to your company’s social profiles.</p>
          <div className="company-details-field company-details-field-prefix">
            <label className="company-details-label">LinkedIn</label>
            <div className="company-details-input-wrap">
              <span className="company-details-prefix">linkedin.com/company/</span>
              <input
                type="text"
                className="company-details-input company-details-input-inline"
                value={formData.linkedInUrl}
                onChange={(e) => handleChange('linkedInUrl', e.target.value)}
                placeholder="your-company"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CompanyRegistration
