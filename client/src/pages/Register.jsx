import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { miscAPI } from '../api/misc'
import LandingHeader from '../components/LandingHeader'

const Register = () => {
  const [activeTab, setActiveTab] = useState('student')
  const [colleges, setColleges] = useState([])
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: '',
    yearOfGraduation: '',
    phone: '',
    degree: '',
    branch: '',
    dateOfBirth: '',
    cgpa: '',
    linkedInUrl: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signupStudent } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await miscAPI.getColleges()
        setColleges(response.colleges || [])
      } catch (error) {
        console.error('Failed to fetch colleges:', error)
      }
    }
    fetchColleges()
  }, [])

  const handleStudentChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    })
  }

  const handleStudentSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signupStudent(studentData)
      navigate('/student/dashboard')
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed')
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
        <Container className="w-100">
          <Row className="justify-content-center">
            <Col md={10} lg={8} xl={7}>
              <Card className="shadow border-0 rounded-4 overflow-hidden auth-form-card" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <Card.Body className="p-5 p-md-5">
                  <div className="text-center mb-5">
                    <h3 className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '1.75rem' }}>Join Beyond Grades</h3>
                    <p className="text-muted mb-0">Create your account to get started</p>
                  </div>

                  {error && <Alert variant="danger" className="rounded-3 mb-4">{error}</Alert>}

                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-5 register-tabs"
                >
                  <Tab eventKey="student" title="Student">
                    <Form onSubmit={handleStudentSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={studentData.name}
                              onChange={handleStudentChange}
                              required
                              placeholder="Enter your full name"
                              className="rounded-3 border-secondary border-opacity-25"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={studentData.email}
                              onChange={handleStudentChange}
                              required
                              placeholder="Enter your college email"
                              className="rounded-3 border-secondary border-opacity-25"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={studentData.password}
                              onChange={handleStudentChange}
                              required
                              placeholder="Create a password"
                              className="rounded-3 border-secondary border-opacity-25"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={studentData.phone}
                              onChange={handleStudentChange}
                              placeholder="Enter your phone number"
                              className="rounded-3 border-secondary border-opacity-25"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>College</Form.Label>
                            <Form.Select
                              name="collegeId"
                              value={studentData.collegeId}
                              onChange={handleStudentChange}
                              required
                              className="rounded-3 border-secondary border-opacity-25"
                            >
                              <option value="">Select your college</option>
                              {colleges.map((college) => (
                                <option key={college._id} value={college._id}>
                                  {college.name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Graduation Year</Form.Label>
                            <Form.Select
                              name="yearOfGraduation"
                              value={studentData.yearOfGraduation}
                              onChange={handleStudentChange}
                              required
                              className="rounded-3 border-secondary border-opacity-25"
                            >
                              <option value="">Select year</option>
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Degree</Form.Label>
                            <Form.Select
                              name="degree"
                              value={studentData.degree}
                              onChange={handleStudentChange}
                              className="rounded-3 border-secondary border-opacity-25"
                            >
                              <option value="">Select degree</option>
                              <option value="B.Tech">B.Tech</option>
                              <option value="B.E.">B.E.</option>
                              <option value="M.Tech">M.Tech</option>
                              <option value="M.E.">M.E.</option>
                              <option value="B.Sc.">B.Sc.</option>
                              <option value="M.Sc.">M.Sc.</option>
                              <option value="BCA">BCA</option>
                              <option value="MCA">MCA</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Branch / Department</Form.Label>
                            <Form.Control
                              type="text"
                              name="branch"
                              value={studentData.branch}
                              onChange={handleStudentChange}
                              placeholder="e.g. Computer Science, ECE"
                              className="rounded-3 border-secondary border-opacity-25"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={studentData.dateOfBirth}
                              onChange={handleStudentChange}
                              className="rounded-3 border-secondary border-opacity-25"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: '#334155' }}>Current CGPA (out of 10)</Form.Label>
                            <Form.Control
                              type="number"
                              name="cgpa"
                              value={studentData.cgpa}
                              onChange={handleStudentChange}
                              min="0"
                              max="10"
                              step="0.01"
                              placeholder="e.g. 8.5"
                              className="rounded-3 border-secondary border-opacity-25"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold" style={{ color: '#334155' }}>LinkedIn Profile</Form.Label>
                        <Form.Control
                          type="url"
                          name="linkedInUrl"
                          value={studentData.linkedInUrl}
                          onChange={handleStudentChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="rounded-3 border-secondary border-opacity-25"
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-100 rounded-3 fw-semibold border-0"
                        style={{
                          backgroundColor: '#2563eb',
                          padding: '0.65rem 1rem',
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Sign Up as Student'}
                      </Button>
                    </Form>
                  </Tab>

                  <Tab eventKey="recruiter" title="Recruiter">
                    <div className="text-center py-3">
                      <p className="text-muted mb-4">
                        Set up your company and create your recruiter account in a few steps.
                      </p>
                      <Button
                        as={Link}
                        to="/register/recruiter"
                        size="lg"
                        className="rounded-3 fw-semibold border-0"
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          padding: '0.65rem 1.5rem',
                        }}
                      >
                        Set up company & create account
                      </Button>
                    </div>
                  </Tab>
                </Tabs>

                <div className="text-center pt-4">
                  <p className="text-muted mb-0">
                    Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign in</Link>
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

export default Register
