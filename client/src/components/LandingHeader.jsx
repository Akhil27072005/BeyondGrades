import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Button } from 'react-bootstrap'

const LandingHeader = () => {
  return (
    <header className="py-3 bg-white landing-header">
      <Container>
        <Row className="align-items-center">
          <Col md="3" className="d-flex align-items-center mb-2 mb-md-0">
            <Link to="/" className="d-flex align-items-center text-decoration-none text-dark">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 me-2"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#2563eb',
                }}
              >
                <span className="fw-bold text-white">BG</span>
              </div>
              <span className="fw-semibold" style={{ letterSpacing: '0.04em' }}>
                BeyondGrades
              </span>
            </Link>
          </Col>

          <Col
            md="6"
            className="d-none d-md-flex justify-content-center gap-4 text-muted"
          >
            <button type="button" className="btn btn-link p-0 text-muted text-decoration-none fw-bold">About Us</button>
            <button type="button" className="btn btn-link p-0 text-muted text-decoration-none fw-bold">Services</button>
            <button type="button" className="btn btn-link p-0 text-muted text-decoration-none fw-bold">Case Studies</button>
            <button type="button" className="btn btn-link p-0 text-muted text-decoration-none fw-bold">Resources</button>
            <button type="button" className="btn btn-link p-0 text-muted text-decoration-none fw-bold">Contact Us</button>
          </Col>

          <Col
            md="3"
            className="d-flex justify-content-end align-items-center gap-3"
          >
            <Link to="/login" className="text-decoration-none text-muted fw-semibold">
              Sign In
            </Link>
            <Button
              as={Link}
              to="/register"
              size="sm"
              className="border-0"
              style={{
                backgroundColor: '#2563eb',
                borderRadius: 999,
                paddingInline: '1.5rem',
              }}
            >
              Find a Job
            </Button>
          </Col>
        </Row>
      </Container>
    </header>
  )
}

export default LandingHeader
