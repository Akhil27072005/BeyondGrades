import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import LandingHeader from '../components/LandingHeader'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(formData)
      if (response.user.role === 'student') {
        navigate('/student/dashboard')
      } else if (response.user.role === 'recruiter') {
        navigate('/recruiter/dashboard')
      } else {
        navigate('/')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column landing-page"
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)',
      }}
    >
      <LandingHeader />
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={7} lg={5} xl={4}>
              <Card className="shadow border-0 rounded-4 overflow-hidden auth-form-card" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <Card.Body className="p-5 p-md-5">
                  <div className="text-center mb-5">
                    <h3 className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '1.75rem' }}>Welcome Back</h3>
                    <p className="text-muted mb-0">Sign in to your account</p>
                  </div>

                  {error && <Alert variant="danger" className="rounded-3 mb-4">{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        className="rounded-3 border-secondary border-opacity-25 py-2"
                        style={{ fontSize: '1rem' }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-5">
                      <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                        className="rounded-3 border-secondary border-opacity-25 py-2"
                        style={{ fontSize: '1rem' }}
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-100 rounded-3 fw-semibold border-0 py-3 mb-4"
                      style={{
                        backgroundColor: '#2563eb',
                        fontSize: '1rem',
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </Form>

                  <div className="text-center pt-3">
                    <p className="text-muted mb-0">
                      Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Sign up</Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  )
}

export default Login
