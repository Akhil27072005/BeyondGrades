import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'

const RecruiterDashboard = () => {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, jobsData] = await Promise.all([
          recruitersAPI.getProfile(),
          recruitersAPI.getJobs()
        ])
        
        setProfile(profileData)
        setJobs(jobsData)
      } catch (error) {
        setError('Failed to load dashboard data')
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Welcome back, {profile?.name}!</h2>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Stats Cards */}
        <Col md={3}>
          <div className="stats-card text-center">
            <h3>{jobs.length}</h3>
            <p>Active Jobs</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <h3>0</h3>
            <p>Applications</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <h3>0</h3>
            <p>Shortlisted</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card text-center">
            <h3>0</h3>
            <p>Hired</p>
          </div>
        </Col>

        {/* Quick Actions */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/recruiter/jobs/create" variant="primary">
                  Post New Job
                </Button>
                <Button as={Link} to="/recruiter/skills" variant="outline-primary">
                  View Skill Analytics
                </Button>
                <Button as={Link} to="/recruiter/company" variant="outline-primary">
                  Company Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Jobs */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Jobs</h5>
            </Card.Header>
            <Card.Body>
              {jobs.length > 0 ? (
                <div className="d-grid gap-3">
                  {jobs.slice(0, 3).map((job, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">{job.title}</h6>
                        <small className="text-muted">{job.domain}</small>
                      </div>
                      <Button as={Link} to={`/recruiter/jobs/${job._id}`} variant="outline-primary" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                  <Button as={Link} to="/recruiter/jobs" variant="outline-primary" size="sm">
                    View All Jobs
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted">No jobs posted yet</p>
                  <Button as={Link} to="/recruiter/jobs/create" variant="primary" size="sm">
                    Post Your First Job
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Company Status */}
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Company Status</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Company Information</h6>
                  <p><strong>Name:</strong> {profile?.companyName}</p>
                  <p><strong>Website:</strong> {profile?.companyWebsite || 'Not provided'}</p>
                  <p><strong>Status:</strong> 
                    <span className={`badge ${profile?.verified ? 'bg-success' : 'bg-warning'} ms-2`}>
                      {profile?.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Account Status</h6>
                  {profile?.verified ? (
                    <Alert variant="success">
                      <strong>Account Verified!</strong><br />
                      You can post jobs and access all features.
                    </Alert>
                  ) : (
                    <Alert variant="warning">
                      <strong>Pending Verification</strong><br />
                      Your account is under review. You'll be notified once verified.
                    </Alert>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default RecruiterDashboard
