import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'
import './RecruiterDashboard.css'

const fmtTime = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const activityIcon = (type) => {
  if (type === 'applicationReceived') return 'inbox'
  if (type === 'candidateHired') return 'check'
  return 'edit'
}

const ActivitySvg = ({ name }) => {
  if (name === 'inbox') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5 7l2-4h10l2 4v13H5V7z" />
      </svg>
    )
  }
  if (name === 'check') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

const RECENT_JOBS_LIMIT = 5

const RecruiterDashboard = () => {
  const [summary, setSummary] = useState(null)
  const [jobsFromList, setJobsFromList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, jobsData] = await Promise.all([
          recruitersAPI.getDashboardSummary(),
          recruitersAPI.getJobs()
        ])
        setSummary(summaryData)
        setJobsFromList(Array.isArray(jobsData) ? jobsData : [])
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

  const profile = summary?.profile || null
  const overview = summary?.overview || {}
  const acquisitions = summary?.acquisitions || {}
  const calendar = summary?.calendar || { today: [], upcoming: [] }
  const activity = summary?.activity || []
  // Recent jobs: same source as Jobs Posted page (getJobs), first N
  const recentJobs = jobsFromList.slice(0, RECENT_JOBS_LIMIT).map((j) => ({
    id: j._id,
    title: j.title,
    location: j.location || (j.locationType ? j.locationType.charAt(0).toUpperCase() + j.locationType.slice(1) : '—'),
    status: 'Active',
    applicantCount: j.applicantCount ?? 0,
    createdAt: j.createdAt
  }))

  return (
    <div className="recruiter-dashboard-page">
      <Container className="recruiter-dashboard-container">
        <Row className="mb-4 align-items-end">
          <Col>
            <h2 className="rd-title">Welcome back, {profile?.name}!</h2>
            <p className="rd-subtitle">Recruitment overview of this month</p>
          </Col>
          <Col xs="auto">
            <Button as={Link} to="/recruiter/jobs/create" variant="primary" className="rd-primary-btn">
              Post new job
            </Button>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Top row */}
          <Col lg={5}>
            <Card className="rd-card h-100">
              <div className="rd-card-header">
                <h3 className="rd-card-title">Overview</h3>
              </div>
              <div className="rd-overview-body">
                <div className="rd-overview-grid">
                  <div className="rd-stat rd-stat-blue">
                    <div>
                      <div className="rd-stat-number">{overview.applications ?? 0}</div>
                      <div className="rd-stat-label">Applications</div>
                    </div>
                    <div className="rd-stat-icon" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12h6M9 16h6" />
                        <path d="M7 3h10a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="rd-stat rd-stat-amber">
                    <div>
                      <div className="rd-stat-number">{overview.shortlisted ?? 0}</div>
                      <div className="rd-stat-label">Shortlisted</div>
                    </div>
                    <div className="rd-stat-icon" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                  <div className="rd-stat rd-stat-green">
                    <div>
                      <div className="rd-stat-number">{overview.onboarded ?? 0}</div>
                      <div className="rd-stat-label">Onboarded</div>
                    </div>
                    <div className="rd-stat-icon" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3z" />
                        <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" />
                        <path d="M2 20c0-3.31 2.69-6 6-6" />
                        <path d="M22 20c0-3.31-2.69-6-6-6" />
                      </svg>
                    </div>
                  </div>
                  <div className="rd-stat rd-stat-rose">
                    <div>
                      <div className="rd-stat-number">{overview.rejected ?? 0}</div>
                      <div className="rd-stat-label">Rejected</div>
                    </div>
                    <div className="rd-stat-icon" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="rd-card h-100">
              <div className="rd-card-header">
                <h3 className="rd-card-title">Acquisitions</h3>
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>This month</span>
              </div>
              <div className="rd-acq-body">
                <div className="rd-acq-bar" aria-hidden>
                  <div className="rd-acq-seg rd-acq-app" style={{ width: `${acquisitions.applicationsPct ?? 0}%` }} />
                  <div className="rd-acq-seg rd-acq-short" style={{ width: `${acquisitions.shortlistedPct ?? 0}%` }} />
                  <div className="rd-acq-seg rd-acq-rej" style={{ width: `${acquisitions.rejectedPct ?? 0}%` }} />
                  <div className="rd-acq-seg rd-acq-hold" style={{ width: `${acquisitions.onHoldPct ?? 0}%` }} />
                  <div className="rd-acq-seg rd-acq-onb" style={{ width: `${acquisitions.onboardedPct ?? 0}%` }} />
                </div>

                <div className="rd-acq-legend">
                  <div className="rd-legend-row">
                    <span className="rd-legend-left"><span className="rd-dot rd-acq-app" />Applications</span>
                    <span>{acquisitions.applicationsPct ?? 0}%</span>
                  </div>
                  <div className="rd-legend-row">
                    <span className="rd-legend-left"><span className="rd-dot rd-acq-short" />Shortlisted</span>
                    <span>{acquisitions.shortlistedPct ?? 0}%</span>
                  </div>
                  <div className="rd-legend-row">
                    <span className="rd-legend-left"><span className="rd-dot rd-acq-rej" />Rejected</span>
                    <span>{acquisitions.rejectedPct ?? 0}%</span>
                  </div>
                  <div className="rd-legend-row">
                    <span className="rd-legend-left"><span className="rd-dot rd-acq-hold" />On hold</span>
                    <span>{acquisitions.onHoldPct ?? 0}%</span>
                  </div>
                  <div className="rd-legend-row">
                    <span className="rd-legend-left"><span className="rd-dot rd-acq-onb" />Onboarding</span>
                    <span>{acquisitions.onboardedPct ?? 0}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col lg={3}>
            <Card className="rd-card h-100">
              <div className="rd-card-header">
                <h3 className="rd-card-title">Calendar</h3>
                <Link to="/recruiter/jobs" className="rd-card-link">see all</Link>
              </div>
              <div className="rd-cal-body">
                <div className="rd-cal-section">
                  <div className="rd-cal-heading">TODAY</div>
                  {(calendar.today || []).length === 0 ? (
                    <p className="rd-empty">No events today.</p>
                  ) : (
                    (calendar.today || []).map((e) => (
                      <div key={e.id} className="rd-cal-item">
                        <div className="rd-cal-line" aria-hidden />
                        <div>
                          <p className="rd-cal-title">{e.jobTitle || e.title}</p>
                          <p className="rd-cal-meta">{e.label}</p>
                        </div>
                        <div className="rd-cal-date">{e.dateLabel}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="rd-cal-section">
                  <div className="rd-cal-heading">UPCOMING</div>
                  {(calendar.upcoming || []).length === 0 ? (
                    <p className="rd-empty">No upcoming events.</p>
                  ) : (
                    (calendar.upcoming || []).map((e) => (
                      <div key={e.id} className="rd-cal-item">
                        <div className="rd-cal-line" aria-hidden style={{ background: '#60a5fa' }} />
                        <div>
                          <p className="rd-cal-title">{e.jobTitle || e.title}</p>
                          <p className="rd-cal-meta">{e.label}</p>
                        </div>
                        <div className="rd-cal-date">{e.dateLabel}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </Col>

          {/* Bottom row */}
          <Col lg={7}>
            <Card className="rd-card h-100">
              <div className="rd-card-header">
                <h3 className="rd-card-title">Recent Jobs</h3>
                <Link to="/recruiter/jobs" className="rd-card-link">see all</Link>
              </div>
              <div className="rd-jobs-body">
                {(recentJobs || []).length === 0 ? (
                  <p className="rd-empty">No jobs posted yet.</p>
                ) : (
                  <table className="rd-jobs-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th>Locations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((j) => (
                        <tr key={j.id} className="rd-job-row">
                          <td>
                            <Link to={`/recruiter/jobs/${j.id}`} className="rd-job-title-link">
                              {j.title}
                            </Link>
                          </td>
                          <td className="rd-job-apps">{j.applicantCount ?? 0}</td>
                          <td><span className="rd-job-pill">{j.status || 'Active'}</span></td>
                          <td className="rd-job-location">{j.location || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="rd-card h-100">
              <div className="rd-card-header">
                <h3 className="rd-card-title">Activity</h3>
                <Link to="/recruiter/jobs" className="rd-card-link">see all</Link>
              </div>
              <div className="rd-activity-body">
                {(activity || []).length === 0 ? (
                  <p className="rd-empty">No activity yet.</p>
                ) : (
                  activity.map((a) => (
                    <div key={a.id} className="rd-activity-item">
                      <div className="rd-activity-ico" aria-hidden>
                        <ActivitySvg name={activityIcon(a.type)} />
                      </div>
                      <div className="rd-activity-text">{a.message}</div>
                      <div className="rd-activity-time">{fmtTime(a.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default RecruiterDashboard
