import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Nav, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { studentsAPI } from '../../api/students'
import './StudentDashboard.css'

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null)
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeApplicationTab, setActiveApplicationTab] = useState('all')

  // Temporary placeholder applications until application APIs exist
  const applications = [
    {
      id: '1',
      title: 'Frontend Developer Intern',
      company: 'Pixel Labs',
      location: 'Remote',
      status: 'Applied'
    },
    {
      id: '2',
      title: 'Full‑stack Developer',
      company: 'Nova Tech',
      location: 'Bengaluru',
      status: 'Interviewing'
    },
    {
      id: '3',
      title: 'Product Engineer',
      company: 'Aurora Systems',
      location: 'Hyderabad',
      status: 'Offer'
    }
  ]

  const filteredApplications =
    activeApplicationTab === 'all'
      ? applications
      : applications.filter((app) => app.status === activeApplicationTab)

  const activityStats = [
    { label: 'Week 1', value: 2 },
    { label: 'Week 2', value: 5 },
    { label: 'Week 3', value: 3 },
    { label: 'Week 4', value: 7 }
  ]

  const maxActivityValue = Math.max(...activityStats.map((item) => item.value), 1)
  const todayKey = new Date().toDateString()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, jobsData, calendarData] = await Promise.all([
          studentsAPI.getProfile(),
          studentsAPI.getRecommendedJobs(),
          studentsAPI.getCalendarEvents().catch(() => ({ events: [] }))
        ])

        setProfile(profileData)
        setRecommendedJobs(jobsData.recommendations || [])
        setCalendarEvents(calendarData.events || [])
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard error:', err)
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

  const projectsCount = profile?.projects?.length || 0
  const skillsCount = profile?.skills?.length || 0
  const matchesCount = recommendedJobs.length
  const applicationsCount = applications.length
  const todayEvents = (calendarEvents || []).filter((event) => {
    const raw =
      event?.start ||
      event?.startTime ||
      event?.date ||
      event?.datetime ||
      event?.createdAt

    if (!raw) return false
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return false
    return d.toDateString() === todayKey
  })

  return (
    <Container fluid className="py-4 student-dashboard-page">
      <Row className="mb-4">
        <Col>
          <div className="sd-header">
            <div>
              <h2 className="sd-title">Welcome back, {profile?.name}!</h2>
              <p className="sd-subtitle text-muted mb-0">
                You’re building a stronger profile every week. Keep going.
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Left column: Today strip + Applications board */}
        <Col lg={8}>
          {/* Section 1: Today overview calendar strip */}
          <Card className="sd-card sd-today-card mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <div className="sd-card-title">Today</div>
                <div className="sd-card-subtitle text-muted">
                  Your interviews, deadlines and events for today
                </div>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="sd-muted-btn"
                as={Link}
                to="/student/calendar"
              >
                View calendar
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="sd-schedule-strip">
                {todayEvents.map((event) => (
                  <div
                    key={event._id}
                    className={`sd-schedule-chip sd-schedule-chip--${event.type || 'event'}`}
                  >
                    <div className="sd-chip-time">{event.timeLabel || 'Today'}</div>
                    <div className="sd-chip-title">{event.title}</div>
                    {event.context && <div className="sd-chip-meta">{event.context}</div>}
                  </div>
                ))}
                {todayEvents.length === 0 && (
                  <div className="sd-schedule-empty text-muted">
                    No interviews, deadlines or events scheduled for today.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Applications board styled like applicants grid (Section 5) */}
          <Card className="sd-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="sd-card-title">Applications</div>
              <Nav
                variant="pills"
                className="sd-applications-tabs"
                activeKey={activeApplicationTab}
                onSelect={(key) => setActiveApplicationTab(key || 'all')}
              >
                <Nav.Item>
                  <Nav.Link eventKey="all">All</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="Applied">Applied</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="Interviewing">Interviewing</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="Offer">Offers</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {filteredApplications.length === 0 ? (
                <div className="sd-empty-state text-center py-4">
                  <h5 className="mb-2">No applications yet</h5>
                  <p className="text-muted mb-3">
                    Start applying to recommended roles to see them tracked here.
                  </p>
                  <Button as={Link} to="/student/jobs" variant="primary" size="sm">
                    Browse jobs
                  </Button>
                </div>
              ) : (
                <Row className="g-3">
                  {filteredApplications.map((app) => (
                    <Col md={6} key={app.id}>
                      <Card className="sd-application-card h-100">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-start gap-3">
                              <div className="sd-app-avatar" aria-hidden>
                                {app.company.charAt(0)}
                              </div>
                              <div>
                                <h6 className="mb-1 sd-app-title">{app.title}</h6>
                                <p className="mb-0 sd-app-company text-muted">
                                  {app.company} · {app.location}
                                </p>
                              </div>
                            </div>
                            <Badge bg="light" text="dark" className={`sd-status-badge sd-status-${app.status.toLowerCase()}`}>
                              {app.status}
                            </Badge>
                          </div>
                          <div className="mt-auto d-flex justify-content-between align-items-center">
                            <span className="text-muted small">Last updated recently</span>
                            <div className="d-flex gap-2">
                              <Button variant="outline-primary" size="sm" className="sd-btn-compact sd-btn-outline">
                                View job
                              </Button>
                              <Button variant="primary" size="sm" className="sd-btn-compact sd-btn-primary">
                                View application
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right column: analytics, activity, recommended jobs */}
        <Col lg={4}>
          {/* Analytics (Section 2) */}
          <Card className="sd-card sd-analytics-card mb-4">
            <Card.Header>
              <div className="sd-card-title">Analytics</div>
            </Card.Header>
            <Card.Body>
              <div className="sd-metric-row">
                <div>
                  <div className="sd-metric-label">Projects</div>
                  <div className="sd-metric-caption text-muted">Showcase of your work</div>
                </div>
                <div className="sd-metric-bar-wrapper">
                  <div
                    className="sd-metric-bar"
                    style={{ width: `${Math.min((projectsCount / 5) * 100, 100)}%` }}
                  />
                </div>
                <div className="sd-metric-value">{projectsCount}</div>
              </div>
              <div className="sd-metric-row">
                <div>
                  <div className="sd-metric-label">Skills rated</div>
                  <div className="sd-metric-caption text-muted">Helps power your matches</div>
                </div>
                <div className="sd-metric-bar-wrapper">
                  <div
                    className="sd-metric-bar"
                    style={{ width: `${Math.min((skillsCount / 10) * 100, 100)}%` }}
                  />
                </div>
                <div className="sd-metric-value">{skillsCount}</div>
              </div>
              <div className="sd-metric-row">
                <div>
                  <div className="sd-metric-label">Job matches</div>
                  <div className="sd-metric-caption text-muted">Roles tailored to you</div>
                </div>
                <div className="sd-metric-bar-wrapper">
                  <div
                    className="sd-metric-bar"
                    style={{ width: `${Math.min((matchesCount / 8) * 100, 100)}%` }}
                  />
                </div>
                <div className="sd-metric-value">{matchesCount}</div>
              </div>
              <div className="sd-metric-row">
                <div>
                  <div className="sd-metric-label">Applications</div>
                  <div className="sd-metric-caption text-muted">Tracked on your board</div>
                </div>
                <div className="sd-metric-bar-wrapper">
                  <div
                    className="sd-metric-bar"
                    style={{ width: `${Math.min((applicationsCount / 8) * 100, 100)}%` }}
                  />
                </div>
                <div className="sd-metric-value">{applicationsCount}</div>
              </div>
            </Card.Body>
          </Card>

          {/* Section 7: Activity & insights under work time analytics area */}
          <Card className="sd-card sd-activity-card mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="sd-card-title">Application activity</div>
              <span className="sd-activity-range text-muted">Last 4 weeks</span>
            </Card.Header>
            <Card.Body>
              <div className="sd-activity-chart">
                {activityStats.map((item) => (
                  <div key={item.label} className="sd-activity-column">
                    <div
                      className="sd-activity-bar"
                      style={{ height: `${(item.value / maxActivityValue) * 100}%` }}
                    />
                    <div className="sd-activity-label">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="sd-activity-summary mt-3">
                <p className="mb-1">
                  <strong>{applicationsCount}</strong> total applications across all weeks.
                </p>
                <p className="text-muted small mb-0">
                  Keep a steady pace of high‑quality applications instead of sending many generic ones.
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Section 4: Recommended jobs in requests list style */}
          <Card className="sd-card sd-requests-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="sd-card-title">Recommended jobs</div>
              <Button
                variant="link"
                size="sm"
                className="p-0 sd-link-muted"
                as={Link}
                to="/student/jobs"
              >
                View all
              </Button>
            </Card.Header>
            <Card.Body>
              {recommendedJobs.length === 0 ? (
                <p className="text-muted mb-0">
                  No job recommendations yet. Complete your profile and skills to see suggestions here.
                </p>
              ) : (
                <div className="sd-request-list">
                  {recommendedJobs.slice(0, 3).map((rec, index) => (
                    <div key={index} className="sd-request-row">
                      <div>
                        <div className="sd-request-title">{rec.job.title}</div>
                        <div className="sd-request-meta text-muted">
                          {rec.job.company} · {rec.job.location || 'Location flexible'}
                        </div>
                      </div>
                      <div className="sd-request-actions">
                        <Button variant="outline-primary" size="sm" className="sd-btn-compact sd-btn-outline">
                          Save
                        </Button>
                        <Button variant="primary" size="sm" className="sd-btn-compact sd-btn-primary">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default StudentDashboard
