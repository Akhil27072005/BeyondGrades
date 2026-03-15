import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import LandingHeader from '../../components/LandingHeader'
import './RecruiterSignupFlow.css'

const COMPANY_TYPES = ['Corp.', 'LLC', 'Partnership', 'Sole proprietorship', 'Non-profit']
const STATES = [
  'Delaware', 'Nevada', 'Wyoming', 'Florida', 'New York', 'California', 'Washington', 'Texas'
]
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

const RecruiterSignupFlow = () => {
  const navigate = useNavigate()
  const { signupRecruiterFull } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    companyType: '',
    state: '',
    companyName: '',
    companySize: '',
    address: '',
    country: '',
    city: '',
    companyWebsite: '',
    companyDescription: '',
    team: [{ firstName: '', lastName: '', email: '' }],
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateTeamMember = (index, field, value) => {
    setForm((prev) => {
      const team = [...prev.team]
      team[index] = { ...team[index], [field]: value }
      return { ...prev, team }
    })
  }

  const addTeamMember = () => {
    setForm((prev) => ({
      ...prev,
      team: [...prev.team, { firstName: '', lastName: '', email: '' }]
    }))
  }

  const removeTeamMember = (index) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }))
  }

  const canProceedStep1 = () => !!form.companyType
  const canProceedStep2 = () => !!form.state
  const canProceedStep3 = () =>
    !!form.companyName?.trim()
  const canProceedStep4 = () => true
  const canProceedStep5 = () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.password) return false
    if (form.password.length < 6) return false
    if (form.password !== form.confirmPassword) return false
    return true
  }

  const handleNext = () => {
    setError('')
    if (currentStep < 5) setCurrentStep((s) => s + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const teamPayload = form.team
        .filter((m) => (m.firstName?.trim() || m.lastName?.trim()) && m.email?.trim())
        .map((m) => ({
          firstName: m.firstName?.trim() || '',
          lastName: m.lastName?.trim() || '',
          email: m.email?.trim().toLowerCase()
        }))

      await signupRecruiterFull({
        companyType: form.companyType,
        state: form.state,
        companyName: form.companyName.trim(),
        companySize: form.companySize || undefined,
        address: form.address?.trim() || undefined,
        country: form.country?.trim() || undefined,
        city: form.city?.trim() || undefined,
        companyWebsite: form.companyWebsite?.trim() || undefined,
        companyDescription: form.companyDescription?.trim() || undefined,
        team: teamPayload,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      setCurrentStep(6)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    navigate('/recruiter/dashboard')
  }

  const steps = [
    { num: 1, label: 'Company type' },
    { num: 2, label: 'State' },
    { num: 3, label: 'Business details' },
    { num: 4, label: 'Team' },
    { num: 5, label: 'Personal details' }
  ]

  return (
    <div className="recruiter-signup-flow">
      <LandingHeader />
      <div className="recruiter-signup-flow-body">
        <div className="recruiter-signup-flow-card">
        <aside className="flow-sidebar">
          <div className="flow-sidebar-logo">Beyond Grades</div>
          <ol className="flow-steps">
            {steps.map(({ num, label }) => {
              let state = 'pending'
              if (num < currentStep || (currentStep === 6 && num <= 5)) state = 'completed'
              else if (num === currentStep) state = 'active'
              return (
                <li key={num} className={`flow-step-item ${state}`}>
                  <span className="flow-step-icon">
                    {state === 'completed' ? (
                      <span aria-hidden>✓</span>
                    ) : (
                      num
                    )}
                  </span>
                  <span>{label}</span>
                </li>
              )
            })}
          </ol>
        </aside>

        <main className="flow-main">
        {currentStep === 6 ? (
          <div className="flow-success">
            <div className="flow-success-icon" aria-hidden>🎉</div>
            <h1 className="flow-success-title">Company registered successfully!</h1>
            <p className="flow-success-text">
              Congratulations! Your company has been created successfully. Expect a confirmation email soon. Thank you!
            </p>
            <button type="button" className="flow-btn-next" onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              <>
                <h1 className="flow-title">Choose the company type</h1>
                <p className="flow-subtitle">
                  Select the legal structure for your business.
                </p>
                <div className="flow-card-grid">
                  {COMPANY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`flow-card-option ${form.companyType === type ? 'selected' : ''}`}
                      onClick={() => updateForm('companyType', type)}
                    >
                      <span className="flow-card-label">{type}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h1 className="flow-title">Choose the state</h1>
                <p className="flow-subtitle">
                  Choose the state where you plan to register your new business.
                </p>
                <div className="flow-card-grid">
                  {STATES.map((state) => (
                    <button
                      key={state}
                      type="button"
                      className={`flow-card-option ${form.state === state ? 'selected' : ''}`}
                      onClick={() => updateForm('state', state)}
                    >
                      <span className="flow-card-label">{state}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h1 className="flow-title">About your company</h1>
                <p className="flow-subtitle">Enter detailed information about your company.</p>
                <Form className="flow-form">
                  <Form.Group className="mb-3">
                    <Form.Label>Company name</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.companyName}
                      onChange={(e) => updateForm('companyName', e.target.value)}
                      placeholder="e.g. Acme"
                      required
                    />
                  </Form.Group>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                          value={form.companyType}
                          onChange={(e) => updateForm('companyType', e.target.value)}
                        >
                          <option value="">Select type</option>
                          {COMPANY_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Company size</Form.Label>
                        <Form.Select
                          value={form.companySize}
                          onChange={(e) => updateForm('companySize', e.target.value)}
                          placeholder="Choose the size of your company"
                        >
                          <option value="">Choose the size of your company</option>
                          {COMPANY_SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      placeholder="Street address"
                    />
                  </Form.Group>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Select
                          value={form.country}
                          onChange={(e) => updateForm('country', e.target.value)}
                        >
                          <option value="">Select a country</option>
                          <option value="United States">United States</option>
                          <option value="India">India</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.city}
                          onChange={(e) => updateForm('city', e.target.value)}
                          placeholder="City"
                        />
                      </Form.Group>
                    </div>
                  </div>
                </Form>
              </>
            )}

            {currentStep === 4 && (
              <>
                <h1 className="flow-title">Team members list</h1>
                <p className="flow-subtitle">Share information about your business team.</p>
                {form.team.map((member, index) => (
                  <div key={index} className="flow-team-row">
                    <Form.Group className="flow-form">
                      <Form.Label>First name</Form.Label>
                      <Form.Control
                        type="text"
                        value={member.firstName}
                        onChange={(e) => updateTeamMember(index, 'firstName', e.target.value)}
                        placeholder="First name"
                      />
                    </Form.Group>
                    <Form.Group className="flow-form">
                      <Form.Label>Last name</Form.Label>
                      <Form.Control
                        type="text"
                        value={member.lastName}
                        onChange={(e) => updateTeamMember(index, 'lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </Form.Group>
                    <Form.Group className="flow-form" style={{ flex: 1.2 }}>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                        placeholder="email@company.com"
                      />
                    </Form.Group>
                    <button
                      type="button"
                      className="flow-team-remove"
                      onClick={() => removeTeamMember(index)}
                      aria-label="Remove member"
                      title="Remove member"
                    >
                      −
                    </button>
                  </div>
                ))}
                <button type="button" className="flow-add-member" onClick={addTeamMember}>
                  Add member
                </button>
              </>
            )}

            {currentStep === 5 && (
              <>
                <h1 className="flow-title">Personal details</h1>
                <p className="flow-subtitle">Create your account to manage the company.</p>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <Form className="flow-form">
                  <Form.Group className="mb-3">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="Enter your corporate email"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={form.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      placeholder="Create a password (min 6 characters)"
                      required
                      minLength={6}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm password</Form.Label>
                    <Form.Control
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                  </Form.Group>
                </Form>
              </>
            )}

            <div className="flow-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="flow-btn-prev"
                  onClick={() => setCurrentStep((s) => s - 1)}
                >
                  Previous step
                </button>
              )}
              <button
                type="button"
                className="flow-btn-next"
                disabled={
                  (currentStep === 1 && !canProceedStep1()) ||
                  (currentStep === 2 && !canProceedStep2()) ||
                  (currentStep === 3 && !canProceedStep3()) ||
                  (currentStep === 5 && !canProceedStep5()) ||
                  loading
                }
                onClick={handleNext}
              >
                {loading ? 'Creating...' : currentStep === 5 ? 'Create account' : 'Next step'}
              </button>
            </div>
          </>
        )}
        </main>
        </div>
      </div>
    </div>
  )
}

export default RecruiterSignupFlow
