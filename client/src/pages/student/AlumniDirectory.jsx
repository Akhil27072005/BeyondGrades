import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap'
import { miscAPI } from '../../api/misc'
import './AlumniDirectory.css'

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false)
  const [filters, setFilters] = useState({
    collegeId: '',
    search: '',
    skillFilter: ''
  })
  const collegeDropdownRef = useRef(null)

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
    fetchAlumni()
  }, [filters])

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      const data = await miscAPI.getAlumni(
        filters.collegeId || undefined,
        filters.skillFilter || undefined,
        filters.search || undefined
      )
      setAlumni(data.alumni || [])
    } catch (error) {
      setError('Failed to load alumni directory')
      console.error('Alumni error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleCollegeSelect = (collegeId) => {
    setFilters({
      ...filters,
      collegeId
    })
    setIsCollegeDropdownOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target)) {
        setIsCollegeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (loading) {
    return (
      <Container className="py-4 student-alumni-page">
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
      <Container className="py-4 student-alumni-page">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  const selectedCollege =
    colleges.find((college) => college._id === filters.collegeId) || null

  return (
    <div className="student-alumni-page">
      <Container className="py-4">
        <Row className="mb-3">
          <Col>
            <h2 className="sa-page-title mb-1">Alumni Directory</h2>
            <p className="sa-page-subtitle text-muted mb-0">
              Connect with graduates from your college and beyond
            </p>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col>
            <Card className="sa-filters-card">
              <Card.Body>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="sa-filter-label">Search</Form.Label>
                      <Form.Control
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by name or skills..."
                        className="sa-filter-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="sa-filter-label">College</Form.Label>
                      <div
                        ref={collegeDropdownRef}
                        className="sa-custom-dropdown"
                      >
                        <button
                          type="button"
                          className="sa-filter-control sa-custom-dropdown-toggle"
                          onClick={() => setIsCollegeDropdownOpen((open) => !open)}
                        >
                          <span className="sa-custom-dropdown-label">
                            {selectedCollege ? selectedCollege.name : 'All Colleges'}
                          </span>
                          <span
                            className={`sa-custom-dropdown-icon${
                              isCollegeDropdownOpen ? ' open' : ''
                            }`}
                            aria-hidden
                          />
                        </button>
                        {isCollegeDropdownOpen && (
                          <div className="sa-custom-dropdown-menu">
                            <button
                              type="button"
                              className={`sa-custom-dropdown-item${
                                !filters.collegeId ? ' active' : ''
                              }`}
                              onClick={() => handleCollegeSelect('')}
                            >
                              All Colleges
                            </button>
                            {colleges.map((college) => (
                              <button
                                key={college._id}
                                type="button"
                                className={`sa-custom-dropdown-item${
                                  filters.collegeId === college._id ? ' active' : ''
                                }`}
                                onClick={() => handleCollegeSelect(college._id)}
                              >
                                {college.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="sa-filter-label">Skills</Form.Label>
                      <Form.Control
                        type="text"
                        name="skillFilter"
                        value={filters.skillFilter}
                        onChange={handleFilterChange}
                        placeholder="Filter by skills..."
                        className="sa-filter-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Alumni List */}
        <Row className="g-3">
          {alumni.length > 0 ? (
            alumni.map((person, index) => {
              const initial = person.name?.charAt(0)?.toUpperCase() || '?'
              const degreeBranchParts = []
              if (person.degree) degreeBranchParts.push(person.degree)
              if (person.branch) degreeBranchParts.push(person.branch)
              if (person.yearOfGraduation) degreeBranchParts.push(`Class of ${person.yearOfGraduation}`)

              return (
                <Col md={6} key={index}>
                  <Card className="sa-alumni-card h-100">
                    <Card.Body className="d-flex flex-column">
                      <div className="sa-card-header d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-start gap-3">
                          <div className="sa-avatar" aria-hidden>
                            {initial}
                          </div>
                          <div>
                            <h6 className="sa-name mb-1">{person.name}</h6>
                            {degreeBranchParts.length > 0 && (
                              <p className="sa-subtitle text-muted mb-1">
                                {degreeBranchParts.join(' · ')}
                              </p>
                            )}
                            {person.collegeId?.name && (
                              <p className="sa-college text-muted mb-0">
                                {person.collegeId.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          {person.contactAllowed ? (
                            <Badge bg="success" className="sa-pill">
                              Contact allowed
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="sa-pill">
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="sa-skills-block mb-3">
                        <div className="sa-section-label mb-1">Key skills</div>
                        <div className="d-flex flex-wrap gap-1">
                          {person.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="sa-skill-chip">
                              {skill.name}
                              {skill.level && <span className="sa-skill-level"> · {skill.level}</span>}
                            </span>
                          ))}
                          {person.skills?.length > 3 && (
                            <span className="sa-skill-chip sa-skill-more">
                              +{person.skills.length - 3} more
                            </span>
                          )}
                          {(!person.skills || person.skills.length === 0) && (
                            <span className="text-muted small">No skills listed yet</span>
                          )}
                        </div>
                      </div>

                      <div className="sa-card-footer d-flex justify-content-between align-items-center mt-auto pt-2">
                        <div className="small text-muted">
                          {person.roleTags?.length
                            ? person.roleTags.join(' · ')
                            : 'Open to opportunities'}
                        </div>
                        <div className="d-flex gap-2">
                          {person.contactAllowed ? (
                            <Button variant="primary" size="sm" className="sa-btn-contact">
                              Contact
                            </Button>
                          ) : (
                            <Button variant="outline-secondary" size="sm" disabled>
                              Contact not allowed
                            </Button>
                          )}
                          <Button variant="outline-primary" size="sm">
                            View profile
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })
          ) : (
            <Col>
              <Card className="sa-empty-card text-center py-5">
                <Card.Body>
                  <div className="sa-empty-icon mb-3" aria-hidden>
                    <i className="bi bi-people" />
                  </div>
                  <h5 className="mb-2 sa-empty-title">No alumni found</h5>
                  <p className="text-muted mb-0">
                    Try adjusting your search filters to discover more alumni connections.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  )
}

export default AlumniDirectory
