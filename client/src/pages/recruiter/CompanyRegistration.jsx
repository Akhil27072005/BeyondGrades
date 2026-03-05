import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { recruitersAPI } from '../../api/recruiters'

const CompanyRegistration = () => {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companyDescription: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await recruitersAPI.getProfile()
        setProfile(data)
        setFormData({
          companyName: data.companyName || '',
          companyWebsite: data.companyWebsite || '',
          companyDescription: ''
        })
      } catch (error) {
        setError('Failed to load profile')
        console.error('Profile error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await recruitersAPI.registerCompany(formData)
      setSuccess('Company registration submitted successfully!')
    } catch (error) {
      setError('Failed to register company')
      console.error('Registration error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="py-4">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Company Registration</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Company Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your company name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    placeholder="https://yourcompany.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    placeholder="Tell us about your company, its mission, and what makes it unique..."
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Registration Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="mb-3">
                  <i className="bi bi-building text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h6>{profile?.companyName || 'No company registered'}</h6>
                <p className="text-muted">
                  {profile?.verified ? (
                    <span className="badge bg-success">Verified</span>
                  ) : (
                    <span className="badge bg-warning">Pending Verification</span>
                  )}
                </p>
                {!profile?.verified && (
                  <p className="text-muted small">
                    Your company registration is under review. You'll be notified once verified.
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h5 className="mb-0">Next Steps</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <small>• Complete company registration</small>
                </li>
                <li className="mb-2">
                  <small>• Wait for admin verification</small>
                </li>
                <li className="mb-2">
                  <small>• Start posting jobs</small>
                </li>
                <li className="mb-2">
                  <small>• Access candidate database</small>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default CompanyRegistration
