import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { studentsAPI } from '../../api/students'
import './RecommendedJobs.css'

const SAMPLE_RECOMMENDATION = {
  isSample: true,
  job: {
    id: 'sample-job',
    title: 'Front-end Engineer Intern',
    company: 'BeyondGrades Labs',
    domain: 'Web Development',
    locationType: 'Remote',
    description:
      'Work with modern React stacks to build student-focused dashboards, collaborate with designers, and ship features to production.'
  },
  matchScore: 0.87,
  reasons: [
    'Matches your React and JavaScript skills',
    'Hands-on project experience in web apps',
    'Good overlap with your preferred domain'
  ]
}

const RecommendedJobs = () => {
  const [recommendations, setRecommendations] = useState([])
  const [profileStatus, setProfileStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [applyingId, setApplyingId] = useState(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await studentsAPI.getRecommendedJobs()
        const apiRecs = data.recommendations || []
        setProfileStatus(data.profileStatus || null)

        // If profile is complete for matching and there are no real recommendations yet,
        // show a single sample card so the UI feels alive.
        if ((data.profileStatus?.profileCompleteForMatching ?? true) && apiRecs.length === 0) {
          setRecommendations([SAMPLE_RECOMMENDATION])
        } else {
          setRecommendations(apiRecs)
        }
      } catch (error) {
        setError('Failed to load job recommendations')
        console.error('Jobs error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const handleApply = async (jobId, isSample) => {
    if (isSample || !jobId || applyingId) return
    setApplyingId(jobId)
    setError('')
    try {
      await studentsAPI.applyToJob(jobId)
      setAppliedIds((prev) => new Set([...prev, jobId]))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplyingId(null)
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

  if (error) {
    return (
      <Container className="py-4 student-jobs-page">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <div className="student-jobs-page">
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 className="sj-page-title mb-1">Recommended Jobs</h2>
                <p className="sj-page-subtitle mb-0">
                  Roles matched to your skills, projects and interests
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-pill sj-badge-pill">
                  <span className="me-1 sj-badge-dot" />
                  Smart matching powered by your profile
                </span>
              </div>
            </div>
          </Col>
        </Row>

        {recommendations.length > 0 ? (
          <Row className="g-3">
            {recommendations.map((recommendation, index) => {
              const matchPercent = Math.round((recommendation.matchScore || 0) * 100)
              const isSample = recommendation.isSample

              return (
                <Col xs={12} key={recommendation.job.id || index}>
                  <Card className="sj-job-card h-100 w-100">
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="sj-job-main">
                          <div className="d-flex align-items-start gap-2 mb-1">
                            <div className="sj-job-avatar" aria-hidden>
                              <span>{(recommendation.job.company || 'J')[0]}</span>
                            </div>
                            <div>
                              <Card.Title className="h6 mb-1 sj-job-title">
                                {recommendation.job.title}
                              </Card.Title>
                              <div className="sj-job-company text-muted small">
                                {recommendation.job.company}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            <Badge bg="light" text="dark" className="sj-job-domain-badge">
                              <i className="bi bi-grid-3x3-gap me-1" aria-hidden />
                              {recommendation.job.domain}
                            </Badge>
                            <Badge bg="light" text="dark" className="sj-job-location-badge">
                              <i className="bi bi-geo-alt me-1" aria-hidden />
                              {recommendation.job.location || recommendation.job.locationType || '—'}
                            </Badge>
                            {isSample && (
                              <Badge bg="primary" className="sj-job-sample-badge">
                                Preview
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="sj-match-badge text-end">
                          <div className="sj-match-pill">
                            {matchPercent}%
                          </div>
                          <small className="text-muted small">Match</small>
                        </div>
                      </div>

                      <p className="text-muted sj-job-description mb-3">
                        {recommendation.job.description.substring(0, 180)}...
                      </p>

                      <div className="d-flex gap-2 mt-auto pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-grow-1 sj-btn-apply"
                          onClick={() => handleApply(recommendation.job.id, recommendation.isSample)}
                          disabled={recommendation.isSample || applyingId === recommendation.job.id || appliedIds.has(recommendation.job.id)}
                        >
                          {applyingId === recommendation.job.id
                            ? 'Applying…'
                            : appliedIds.has(recommendation.job.id)
                              ? 'Applied'
                              : 'Apply now'}
                        </Button>
                        <Button
                          as={Link}
                          to={`/student/jobs/${recommendation.job.id}`}
                          state={{ recommendation }}
                          variant="outline-primary"
                          size="sm"
                          className="sj-btn-secondary"
                        >
                          View details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        ) : (
          <Row>
            <Col>
              <Card className="text-center py-5 sj-empty-card">
                <Card.Body>
                  {profileStatus && profileStatus.profileCompleteForMatching === false ? (
                    <>
                      <h5 className="text-muted mb-3">Complete your profile to see job matches</h5>
                      <p className="text-muted mb-4">
                        {profileStatus.hasSkills === false && profileStatus.hasProjects === false && (
                          <>Add at least one skill and one project to start seeing personalized job recommendations.</>
                        )}
                        {profileStatus.hasSkills === false && profileStatus.hasProjects !== false && (
                          <>Add at least one skill to your profile to start seeing job recommendations.</>
                        )}
                        {profileStatus.hasSkills !== false && profileStatus.hasProjects === false && (
                          <>Add at least one project to your portfolio to start seeing job recommendations.</>
                        )}
                      </p>
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {profileStatus.hasSkills === false && (
                          <Button as={Link} to="/student/profile" variant="primary">
                            Go to Profile
                          </Button>
                        )}
                        {profileStatus.hasProjects === false && (
                          <Button as={Link} to="/student/projects" variant="outline-primary">
                            Add Projects
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h5 className="text-muted mb-3">No job recommendations yet</h5>
                      <p className="text-muted mb-4">
                        We&apos;ll show matching jobs here as soon as new roles are available for your profile.
                      </p>
                      <Button as={Link} to="/student/profile" variant="primary">
                        Review Profile
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  )
}

export default RecommendedJobs
