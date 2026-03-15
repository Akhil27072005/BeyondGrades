import React, { useState, useEffect } from 'react'
import { Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { recruitersAPI } from '../../api/recruiters'
import CustomSelect from '../../components/CustomSelect'
import './CreateJob.css'

const DOMAINS = [
  'web development',
  'mobile development',
  'data science',
  'cloud computing',
  'blockchain',
  'cybersecurity'
]

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Intern',
  'Contract',
  'Freelance'
]

const JOB_DURATIONS = [
  '3 months',
  '6 months',
  '1 year',
  'Ongoing',
  'Other'
]

const CreateJob = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    contactPerson: user?.name || '',
    contactEmail: '',
    contactPhone: '',
    requiredSkills: [],
    optionalSkills: [],
    minExperienceYears: 0,
    locationType: 'onsite',
    batchTarget: [],
    jobType: '',
    jobDuration: '',
    location: '',
    shortlistSettings: {
      topN: 10,
      weights: { domain: 0.30, skill: 0.45, expertise: 0.25 }
    }
  })

  const [newSkill, setNewSkill] = useState({
    name: '',
    requiredLevel: 'intermediate',
    weight: 1.0
  })
  const [newOptionalSkill, setNewOptionalSkill] = useState('')

  useEffect(() => {
    if (user?.name && !formData.contactPerson) {
      setFormData(prev => ({ ...prev, contactPerson: user.name }))
    }
  }, [user?.name])

  useEffect(() => {
    try {
      const draft = localStorage.getItem('createJobDraft')
      if (draft) {
        const parsed = JSON.parse(draft)
        setFormData(prev => ({ ...prev, ...parsed }))
      }
    } catch (e) {
      /* ignore */
    }
  }, [])

  const update = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const updateNested = (path, value) => {
    if (path === 'shortlistSettings.topN') {
      setFormData(prev => ({
        ...prev,
        shortlistSettings: {
          ...prev.shortlistSettings,
          topN: typeof value === 'string' ? parseInt(value, 10) : value
        }
      }))
    } else if (path.startsWith('shortlistSettings.weights.')) {
      const field = path.split('.')[2]
      setFormData(prev => ({
        ...prev,
        shortlistSettings: {
          ...prev.shortlistSettings,
          weights: {
            ...prev.shortlistSettings.weights,
            [field]: parseFloat(value)
          }
        }
      }))
    }
  }

  const handleAddRequiredSkill = () => {
    if (newSkill.name.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, { ...newSkill }]
      }))
      setNewSkill({ name: '', requiredLevel: 'intermediate', weight: 1.0 })
    }
  }

  const handleRemoveRequiredSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
    }))
  }

  const handleAddOptionalSkill = () => {
    if (newOptionalSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        optionalSkills: [...prev.optionalSkills, newOptionalSkill.trim()]
      }))
      setNewOptionalSkill('')
    }
  }

  const handleRemoveOptionalSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      optionalSkills: prev.optionalSkills.filter((_, i) => i !== index)
    }))
  }

  const toggleBatchYear = (year) => {
    setFormData(prev => ({
      ...prev,
      batchTarget: prev.batchTarget.includes(year)
        ? prev.batchTarget.filter(y => y !== year)
        : [...prev.batchTarget, year]
    }))
  }

  const canSubmit = () =>
    formData.title?.trim().length >= 3 &&
    formData.description?.trim().length >= 20 &&
    !!formData.domain &&
    formData.requiredSkills.length >= 1

  const goToStep = (step) => {
    if (step !== currentStep) setCurrentStep(step)
  }

  const handleSaveForLater = () => {
    try {
      localStorage.setItem('createJobDraft', JSON.stringify(formData))
      setSuccess('Draft saved. You can continue later.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Could not save draft')
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    setSaving(true)
    try {
      await recruitersAPI.createJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        domain: formData.domain,
        requiredSkills: formData.requiredSkills,
        optionalSkills: formData.optionalSkills,
        minExperienceYears: formData.minExperienceYears || 0,
        locationType: formData.locationType || 'onsite',
        batchTarget: formData.batchTarget,
        shortlistSettings: formData.shortlistSettings,
        contactPerson: formData.contactPerson?.trim() || undefined,
        contactEmail: formData.contactEmail?.trim() || undefined,
        contactPhone: formData.contactPhone?.trim() || undefined,
        jobType: formData.jobType || undefined,
        jobDuration: formData.jobDuration || undefined,
        location: formData.location?.trim() || undefined
      })
      setSuccess('Job created successfully!')
      localStorage.removeItem('createJobDraft')
      setTimeout(() => navigate('/recruiter/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { num: 1, label: 'Information' },
    { num: 2, label: 'Tech Components' },
    { num: 3, label: 'Audience' },
    { num: 4, label: 'Start' }
  ]

  return (
    <div className="create-job-flow">
      <div className="create-job-flow-body">
        <div className="create-job-flow-card">
          <aside className="flow-sidebar">
            <div className="flow-sidebar-title">Create your job</div>
            <ol className="flow-steps">
              {steps.map(({ num, label }) => {
                const completed = num < currentStep
                const active = num === currentStep
                const pending = num > currentStep
                const state = completed ? 'completed' : active ? 'active' : 'pending'
                return (
                  <li
                    key={num}
                    className={`flow-step-item ${state}`}
                    onClick={() => goToStep(num)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goToStep(num)}
                  >
                    <span className="flow-step-num">{num < 10 ? `0${num}` : num}</span>
                    <span>{label}</span>
                  </li>
                )
              })}
            </ol>
          </aside>

          <main className="flow-main">
            <div className="flow-main-header">
              <h1 className="flow-main-title">Start your job here</h1>
              <button
                type="button"
                className="flow-btn-save-later"
                onClick={handleSaveForLater}
              >
                Save for later
              </button>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success py-2 mb-3" role="alert">
                {success}
              </div>
            )}

            {currentStep === 1 && (
              <>
                <div className="flow-section">
                  <h2 className="flow-section-title">Job information</h2>
                  <Form.Group className="mb-3">
                    <Form.Label>Job title</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={(e) => update('title', e.target.value)}
                      placeholder="e.g. Software Engineer"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Domain</Form.Label>
                    <CustomSelect
                      value={formData.domain}
                      onChange={(e) => update('domain', e.target.value)}
                      options={DOMAINS}
                      placeholder="Select domain"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Job description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      required
                    />
                  </Form.Group>
                </div>
                <div className="flow-section">
                  <h2 className="flow-section-title">Contact for this role</h2>
                  <p className="flow-section-sub">How can candidates get back to you?</p>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact person</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => update('contactPerson', e.target.value)}
                      placeholder="Your name"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => update('contactEmail', e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => update('contactPhone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </Form.Group>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="flow-section">
                <h2 className="flow-section-title">Tech components</h2>
                <p className="flow-section-sub">Required and optional skills for this role.</p>
                <Form.Group className="mb-3">
                  <Form.Label>Required skills</Form.Label>
                  {formData.requiredSkills.map((skill, index) => (
                    <div key={index} className="flow-skill-row">
                      <div className="form-group">
                        <Form.Control
                          size="sm"
                          value={skill.name}
                          readOnly
                          className="bg-light"
                        />
                      </div>
                      <div className="form-group custom-select-wrapper custom-select-sm" style={{ maxWidth: 120 }}>
                        <div className="custom-select-trigger bg-light" style={{ pointerEvents: 'none' }}>
                          <span>{skill.requiredLevel}</span>
                          <span className="custom-select-arrow">▼</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flow-skill-remove"
                        onClick={() => handleRemoveRequiredSkill(index)}
                        aria-label="Remove skill"
                      >
                        −
                      </button>
                    </div>
                  ))}
                  <div className="flow-skill-row">
                    <div className="form-group">
                      <Form.Control
                        size="sm"
                        placeholder="Skill name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="form-group" style={{ maxWidth: 130 }}>
                      <CustomSelect
                        size="sm"
                        value={newSkill.requiredLevel}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, requiredLevel: e.target.value }))}
                        options={['beginner', 'intermediate', 'advanced', 'expert']}
                        placeholder="Level"
                      />
                    </div>
                    <div className="form-group" style={{ maxWidth: 70 }}>
                      <Form.Control
                        size="sm"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        placeholder="Wt"
                        value={newSkill.weight}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                      />
                    </div>
                    <button
                      type="button"
                      className="flow-add-skill"
                      onClick={handleAddRequiredSkill}
                      style={{ alignSelf: 'stretch' }}
                    >
                      Add
                    </button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Optional skills</Form.Label>
                  {formData.optionalSkills.map((skill, index) => (
                    <div key={index} className="d-flex align-items-center gap-2 mb-2">
                      <Form.Control size="sm" value={skill} readOnly className="bg-light flex-grow-1" />
                      <button
                        type="button"
                        className="flow-skill-remove"
                        onClick={() => handleRemoveOptionalSkill(index)}
                        aria-label="Remove"
                      >
                        −
                      </button>
                    </div>
                  ))}
                  <div className="d-flex gap-2">
                    <Form.Control
                      size="sm"
                      placeholder="Optional skill"
                      value={newOptionalSkill}
                      onChange={(e) => setNewOptionalSkill(e.target.value)}
                      className="flex-grow-1"
                    />
                    <button type="button" className="flow-add-skill" onClick={handleAddOptionalSkill}>
                      Add
                    </button>
                  </div>
                </Form.Group>
              </div>
            )}

            {currentStep === 3 && (
              <>
                <div className="flow-section">
                  <h2 className="flow-section-title">Project delivery information</h2>
                  <Form.Group className="mb-3">
                    <Form.Label>Type of job</Form.Label>
                    <CustomSelect
                      value={formData.jobType}
                      onChange={(e) => update('jobType', e.target.value)}
                      options={JOB_TYPES}
                      placeholder="Select type"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Job duration</Form.Label>
                    <CustomSelect
                      value={formData.jobDuration}
                      onChange={(e) => update('jobDuration', e.target.value)}
                      options={JOB_DURATIONS}
                      placeholder="Select duration"
                    />
                  </Form.Group>
                </div>
                <div className="flow-section">
                  <h2 className="flow-section-title">Audience & location</h2>
                  <Form.Group className="mb-3">
                    <Form.Label>Target graduation years</Form.Label>
                    <div className="d-flex gap-3 flex-wrap">
                      {[2024, 2025, 2026, 2027].map(year => (
                        <Form.Check
                          key={year}
                          type="checkbox"
                          id={`batch-${year}`}
                          label={year}
                          checked={formData.batchTarget.includes(year)}
                          onChange={() => toggleBatchYear(year)}
                        />
                      ))}
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum experience (years)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.minExperienceYears}
                      onChange={(e) => update('minExperienceYears', parseInt(e.target.value, 10) || 0)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Location type</Form.Label>
                    <CustomSelect
                      value={formData.locationType}
                      onChange={(e) => update('locationType', e.target.value)}
                      options={[
                        { value: 'onsite', label: 'On-site' },
                        { value: 'remote', label: 'Remote' },
                        { value: 'hybrid', label: 'Hybrid' }
                      ]}
                      placeholder="Select location type"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Where are you?</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.location}
                      onChange={(e) => update('location', e.target.value)}
                      placeholder="City or region"
                    />
                  </Form.Group>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <div className="flow-section">
                <h2 className="flow-section-title">Matching settings</h2>
                <p className="flow-section-sub">Configure how candidates are shortlisted.</p>
                <Form.Group className="mb-3">
                  <Form.Label>Top N candidates</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="50"
                    value={formData.shortlistSettings.topN}
                    onChange={(e) => updateNested('shortlistSettings.topN', e.target.value)}
                  />
                </Form.Group>
                <Form.Label>Matching weights</Form.Label>
                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small">Domain</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={formData.shortlistSettings.weights.domain}
                        onChange={(e) => updateNested('shortlistSettings.weights.domain', e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small">Skills</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={formData.shortlistSettings.weights.skill}
                        onChange={(e) => updateNested('shortlistSettings.weights.skill', e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="small">Expertise</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={formData.shortlistSettings.weights.expertise}
                        onChange={(e) => updateNested('shortlistSettings.weights.expertise', e.target.value)}
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>
            )}

            <div className="flow-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="flow-btn-prev"
                  onClick={() => setCurrentStep(s => s - 1)}
                >
                  Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  className="flow-btn-next"
                  onClick={() => setCurrentStep(s => s + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="flow-btn-submit"
                  disabled={saving || !canSubmit()}
                  onClick={handleSubmit}
                >
                  {saving ? 'Creating...' : 'Create Job'}
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default CreateJob
