import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import LandingHeader from '../components/LandingHeader'

const LandingPage = () => {
  return (
    <div
      className="min-vh-100 d-flex flex-column landing-page"
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)',
      }}
    >
      <LandingHeader />

      {/* Hero section */}
      <main className="flex-grow-1 d-flex align-items-center pb-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="mb-5 mb-lg-0">
              <div className="d-flex align-items-center mb-3">
                <span className="badge rounded-pill bg-white text-muted border me-2">
                  Trusted by leading organisations
                </span>
              </div>

              <div className="position-relative mb-4">
                <h1 className="fw-bold display-4" style={{ lineHeight: 1.1 }}>
                  Hire Smarter,
                  <br />
                  <span style={{ color: '#2563eb' }}>Grow Faster</span>
                </h1>
              </div>

              <p className="lead text-muted mb-4" style={{ maxWidth: 540 }}>
                Streamline your hiring process and access top student talent globally.
                Partner with BeyondGrades to find the perfect candidates tailored to
                your business needs, all in record time.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Button
                  as={Link}
                  to="/register"
                  size="lg"
                  className="px-4"
                  style={{
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb',
                    borderRadius: 999,
                  }}
                >
                  Start Hiring Today
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  size="lg"
                  variant="outline-secondary"
                  className="px-4 bg-white border-0 landing-btn-no-hover"
                  style={{
                    borderRadius: 999,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
                  }}
                >
                  Find a Job
                </Button>
              </div>

              <div className="trusted-by-wrapper mt-3">
                <span className="fw-semibold text-uppercase text-muted small me-3 align-self-center">Trusted by</span>
                <div className="trusted-by-marquee">
                  <div className="trusted-by-track">
                    {[
                      'Shell StartUp Engine',
                      'University of Cambridge',
                      'Village Capital',
                      'Bedayat',
                      'Nordic Innovation Hub',
                      'Ellen MacArthur Foundation',
                    ].flatMap((name) => [name, name]).map((name, i) => (
                      <span key={i} className="trusted-by-item text-muted small">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={5}>
              <Card
                className="shadow border-0 rounded-4 p-3"
                style={{ background: 'rgba(255,255,255,0.9)' }}
              >
                <Card.Body>
                  <h5 className="fw-semibold mb-3">Why Choose Us?</h5>
                  <p className="text-muted mb-4">
                    Experience seamless hiring with top‑notch student recruitment
                    solutions.
                  </p>

                  <Row className="g-4">
                    <Col xs={12}>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3" style={{ color: '#2563eb' }} aria-hidden>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                          </svg>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">Intelligent Talent Matching</h6>
                          <p className="text-muted mb-0 small">
                            Quickly discover candidates who match your role, skills, and
                            culture requirements.
                          </p>
                        </div>
                      </div>
                    </Col>

                    <Col xs={12}>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3" style={{ color: '#2563eb' }} aria-hidden>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">Curated Student Network</h6>
                          <p className="text-muted mb-0 small">
                            Tap into a vetted pool of high‑potential students from
                            leading institutions.
                          </p>
                        </div>
                      </div>
                    </Col>

                    <Col xs={12}>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3" style={{ color: '#2563eb' }} aria-hidden>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">Faster Hiring Cycles</h6>
                          <p className="text-muted mb-0 small">
                            Reduce time‑to‑hire with streamlined workflows and actionable
                            insights.
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  )
}

export default LandingPage
