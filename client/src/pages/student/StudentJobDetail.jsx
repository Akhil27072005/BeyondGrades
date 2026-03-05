import React, { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap'
import { studentsAPI } from '../../api/students'
import './StudentJobDetail.css'

const SAMPLE_JOB_DETAIL = {
  id: 'sample-job',
  title: 'Front-end Engineer Intern',
  company: 'BeyondGrades Labs',
  domain: 'Web Development',
  locationType: 'Remote',
  minExperienceYears: 0,
  batchTarget: [2025, 2026],
  description:
    'As a Front-end Engineer Intern at BeyondGrades Labs, you will build and polish student-facing dashboards, experiment with modern UI patterns, and collaborate with product and design to ship features quickly. You will work primarily with React, modern JavaScript, and design systems built for scale.',
  requiredSkills: [
    { name: 'React', requiredLevel: 'intermediate', weight: 0.4 },
    { name: 'JavaScript', requiredLevel: 'intermediate', weight: 0.3 },
    { name: 'CSS', requiredLevel: 'beginner', weight: 0.3 }
  ],
  optionalSkills: ['TypeScript', 'Tailwind CSS', 'Figma'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const StudentJobDetail = () => {
  const { id } = useParams()
  const location = useLocation()
  const locationState = location.state || {}
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const recommendationFromState = locationState.recommendation || null

  useEffect(() => {
    const fetchJob = async () => {
      try {
        // For the sample job, just use hard-coded data so you can preview the UI.
        if (id === 'sample-job') {
          setJob(SAMPLE_JOB_DETAIL)
          setLoading(false)
          return
        }

        const data = await studentsAPI.getJobDetail(id)
        setJob(data)
      } catch (err) {
        setError('Failed to load job details')
        console.error('Student job detail error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  if (loading) {
    return (
      <Container className="py-4 student-job-detail-page">
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
      <Container className="py-4 student-job-detail-page">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  if (!job) {
    return null
  }

  const matchPercent = recommendationFromState
    ? Math.round((recommendationFromState.matchScore || 0) * 100)
    : null

  return (
    <div className="student-job-detail-page">
      <Container className="py-4">
        <Row className="mb-3">
          <Col>
            <Button
              as={Link}
              to="/student/jobs"
              variant="link"
              className="p-0 mb-2 sjd-back-link"
            >
              <i className="bi bi-arrow-left-short me-1" aria-hidden />
              Back to recommended jobs
            </Button>

            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="sjd-job-avatar" aria-hidden>
                    {(job.company || 'J')[0]}
                  </div>
                  <div>
                    <h2 className="sjd-title mb-1">{job.title}</h2>
                    <div className="sjd-subtitle text-muted">
                      {job.company} · {job.domain}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-2">
                  <Badge bg="light" text="dark" className="sjd-pill-badge">
                    <i className="bi bi-geo-alt me-1" aria-hidden />
                    {job.locationType}
                  </Badge>
                  {typeof job.minExperienceYears === 'number' && (
                    <Badge bg="light" text="dark" className="sjd-pill-badge">
                      <i className="bi bi-briefcase me-1" aria-hidden />
                      {job.minExperienceYears === 0
                        ? 'Open to freshers'
                        : `${job.minExperienceYears}+ years experience`}
                    </Badge>
                  )}
                  {job.batchTarget?.length > 0 && (
                    <Badge bg="light" text="dark" className="sjd-pill-badge">
                      <i className="bi bi-mortarboard me-1" aria-hidden />
                      Target batches: {job.batchTarget.join(', ')}
                    </Badge>
                  )}
                  {id === 'sample-job' && (
                    <Badge bg="primary" className="sjd-pill-preview">
                      Preview job
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-end">
                {matchPercent != null && (
                  <div className="sjd-match-card mb-2">
                    <div className="sjd-match-label">Your match</div>
                    <div className="sjd-match-score">{matchPercent}%</div>
                  </div>
                )}
                <Button variant="primary" className="sjd-apply-btn">
                  Apply now
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="sjd-card">
              <Card.Body>
                <h5 className="sjd-section-title">Role overview</h5>
                <p className="sjd-body-text mb-3">{job.description}</p>

                {recommendationFromState?.reasons?.length > 0 && (
                  <div className="mb-3">
                    <h6 className="sjd-section-subtitle mb-2">Why this fits your profile</h6>
                    <ul className="sjd-reasons-list mb-0">
                      {recommendationFromState.reasons.slice(0, 5).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3">
                  <h6 className="sjd-section-subtitle mb-2">What you&apos;ll work on</h6>
                  <ul className="sjd-body-list mb-0">
                    <li>Contribute to core product features used by students and recruiters.</li>
                    <li>Collaborate with design and backend teams to ship polished experiences.</li>
                    <li>Iterate quickly based on feedback and analytics.</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="sjd-card mb-3">
              <Card.Body>
                <h6 className="sjd-section-title mb-3">Skill requirements</h6>
                <div className="mb-3">
                  <div className="sjd-pill-label mb-2">Required skills</div>
                  {job.requiredSkills?.map((skill, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="sjd-skill-name">
                        {skill.name}
                        <span className="sjd-skill-level-pill ms-2">{skill.requiredLevel}</span>
                      </div>
                      {typeof skill.weight === 'number' && (
                        <span className="sjd-skill-weight">
                          {(skill.weight * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {job.optionalSkills?.length > 0 && (
                  <div>
                    <div className="sjd-pill-label mb-2">Nice-to-have</div>
                    <div className="d-flex flex-wrap gap-1">
                      {job.optionalSkills.map((skill, idx) => (
                        <Badge key={idx} bg="light" text="dark" className="sjd-chip-badge">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="sjd-card">
              <Card.Body>
                <h6 className="sjd-section-title mb-3">Logistics</h6>
                <ul className="sjd-body-list mb-0">
                  <li>
                    <strong>Location:</strong> {job.locationType}
                  </li>
                  {typeof job.minExperienceYears === 'number' && (
                    <li>
                      <strong>Experience:</strong>{' '}
                      {job.minExperienceYears === 0
                        ? 'Open to fresh graduates / interns'
                        : `${job.minExperienceYears}+ years`}
                    </li>
                  )}
                  {job.batchTarget?.length > 0 && (
                    <li>
                      <strong>Target batches:</strong> {job.batchTarget.join(', ')}
                    </li>
                  )}
                  {job.createdAt && (
                    <li>
                      <strong>Posted on:</strong>{' '}
                      {new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </li>
                  )}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default StudentJobDetail

