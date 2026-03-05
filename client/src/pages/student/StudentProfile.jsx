import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap'
import { studentsAPI } from '../../api/students'
import './StudentProfile.css'

// Simple brand logos as inline SVG (display only)
const GitHubLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)
const LinkedInLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const GlobeLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const StudentProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    githubUrl: '',
    portfolioUrl: '',
    visibility: { public: true, contactAllowed: true }
  })

  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'beginner',
    years: 0,
    confidence: 0.5
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentsAPI.getProfile()
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          visibility: data.visibility || { public: true, contactAllowed: true }
        })
        setSkills(data.skills || [])
      } catch (err) {
        setError('Failed to load profile')
        console.error('Profile error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('visibility.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        visibility: { ...prev.visibility, [field]: type === 'checkbox' ? checked : value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await studentsAPI.updateProfile(formData)
      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      setError('Failed to update profile')
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills(prev => [...prev, { ...newSkill }])
      setNewSkill({ name: '', level: 'beginner', years: 0, confidence: 0.5 })
    }
  }

  const handleRemoveSkill = (index) => {
    setSkills(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveSkills = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await studentsAPI.updateSkills(skills)
      setSuccess('Skills updated successfully!')
    } catch (err) {
      setError('Failed to update skills')
      console.error('Skills error:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return null
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const subtitle = () => {
    const parts = []
    if (profile?.degree) parts.push(profile.degree)
    if (profile?.branch) parts.push(profile.branch)
    if (profile?.yearOfGraduation) parts.push(`Class of ${profile.yearOfGraduation}`)
    if (profile?.collegeId?.name) parts.push(`@ ${profile.collegeId.name}`)
    return parts.length ? parts.join(' · ') : 'Student'
  }

  if (loading) {
    return (
      <div className="student-profile-page">
        <div className="loading-spinner d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  const socialLinks = [
    {
      key: 'github',
      name: 'GitHub',
      url: formData.githubUrl || profile?.githubUrl,
      Logo: GitHubLogo,
      color: '#24292f'
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      url: profile?.linkedInUrl,
      Logo: LinkedInLogo,
      color: '#0A66C2'
    },
    {
      key: 'portfolio',
      name: 'Portfolio',
      url: formData.portfolioUrl || profile?.portfolioUrl,
      Logo: GlobeLogo,
      color: '#333'
    }
  ]

  return (
    <div className="student-profile-page">
      {error && <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" className="mb-3" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row className="g-4 mb-4">
            <Col lg={5} xl={4}>
              <Card className="sp-summary-card shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-end mb-2">
                    <button type="button" className="btn btn-sm btn-link sp-link-primary p-0" onClick={() => setEditing(!editing)}>
                      {editing ? 'Cancel' : 'Edit profile'}
                    </button>
                  </div>
                  <div className="text-center mb-4">
                    <div className="sp-avatar-lg mb-3">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h5 className="fw-bold mb-1">{profile?.name}</h5>
                    <p className="text-muted small mb-0">{subtitle()}</p>
                  </div>

                  <h6 className="text-uppercase fw-semibold text-muted small mb-2">Contact Information</h6>
                  <ul className="list-unstyled small mb-4">
                    <li className="mb-2">
                      <span className="text-muted">Email:</span>{' '}
                      <a href={`mailto:${profile?.email}`}>{profile?.email}</a>
                    </li>
                    <li className="mb-2">
                      <span className="text-muted">Phone:</span>{' '}
                      {profile?.phone || formData.phone || '—'}
                    </li>
                    <li className="mb-2">
                      <span className="text-muted">College:</span>{' '}
                      {profile?.collegeId?.name && (
                        <span>{profile.collegeId.name}{profile.collegeId.address ? `, ${profile.collegeId.address}` : ''}</span>
                      )}
                      {!profile?.collegeId?.name && '—'}
                    </li>
                    {(profile?.degree || profile?.branch || profile?.cgpa != null) && (
                      <li className="mb-2">
                        <span className="text-muted">Details:</span>{' '}
                        {[profile?.degree, profile?.branch, profile?.cgpa != null && `CGPA ${profile.cgpa}`].filter(Boolean).join(' · ') || '—'}
                      </li>
                    )}
                  </ul>

                  {(profile?.roleTags?.length > 0 || editing) && (
                    <>
                      <h6 className="text-uppercase fw-semibold text-muted small mb-2">Tags</h6>
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {(profile?.roleTags || []).map((tag, i) => (
                          <Badge key={i} bg="light" text="dark" className="fw-normal px-2 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}

                  {editing && (
                    <Form onSubmit={handleSaveProfile} className="mt-3 pt-3 border-top">
                      <Form.Group className="mb-2">
                        <Form.Label className="small">Name</Form.Label>
                        <Form.Control size="sm" type="text" name="name" value={formData.name} onChange={handleInputChange} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label className="small">Phone</Form.Label>
                        <Form.Control size="sm" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label className="small">GitHub URL</Form.Label>
                        <Form.Control size="sm" type="url" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="https://github.com/username" />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label className="small">Portfolio URL</Form.Label>
                        <Form.Control size="sm" type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} placeholder="https://..." />
                      </Form.Group>
                      <Form.Check type="checkbox" name="visibility.public" checked={formData.visibility.public} onChange={handleInputChange} label="Public profile" className="small" />
                      <Form.Check type="checkbox" name="visibility.contactAllowed" checked={formData.visibility.contactAllowed} onChange={handleInputChange} label="Allow recruiter contact" className="small" />
                      <Button type="submit" size="sm" variant="primary" className="mt-2" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7} xl={8}>
              <Card className="sp-skills-card shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-semibold">Skills ({skills.length})</h5>
                  </div>
                  <Row>
                    <Col md={8}>
                      <div className="mb-3">
                        {skills.length === 0 ? (
                          <p className="text-muted small mb-0">No skills added yet. Add skills below.</p>
                        ) : (
                          skills.map((skill, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center py-2 px-3 bg-light rounded mb-2">
                              <div>
                                <strong>{skill.name}</strong>
                                <span className="text-muted small ms-2">{skill.level}</span>
                                {skill.years > 0 && <span className="text-muted small ms-1">({skill.years} yr)</span>}
                              </div>
                              <Button variant="outline-danger" size="sm" onClick={() => handleRemoveSkill(index)}>Remove</Button>
                            </div>
                          ))
                        )}
                      </div>
                    </Col>
                    <Col md={4}>
                      <h6 className="small fw-semibold mb-2">Add skill</h6>
                      <Form.Group className="mb-2">
                        <Form.Control size="sm" type="text" placeholder="Skill name" value={newSkill.name} onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Select size="sm" value={newSkill.level} onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value }))}>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control size="sm" type="number" placeholder="Years" value={newSkill.years || ''} onChange={(e) => setNewSkill(prev => ({ ...prev, years: parseInt(e.target.value, 10) || 0 }))} />
                      </Form.Group>
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={handleAddSkill}>Add</Button>
                      <Button size="sm" variant="primary" onClick={handleSaveSkills} disabled={saving}>{saving ? 'Saving...' : 'Save skills'}</Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Bottom row: social widgets */}
          <Row className="g-3">
            {socialLinks.map(({ key, name, url, Logo, color }) => (
              <Col key={key} md={6} lg={4}>
                <Card className="sp-social-widget h-100 shadow-sm border-0">
                  <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div className="sp-social-widget-icon rounded d-flex align-items-center justify-content-center" style={{ backgroundColor: `${color}15`, color }}>
                        <Logo />
                      </div>
                      <div>
                        <div className="fw-semibold small">{name}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: 140 }}>
                          {url ? (url.replace(/^https?:\/\//, '').replace(/\/$/, '')) : 'Not set'}
                        </div>
                      </div>
                    </div>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-circle p-1" title={`Open ${name}`}>
                        <i className="bi bi-box-arrow-up-right" />
                      </a>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
    </div>
  )
}

export default StudentProfile
