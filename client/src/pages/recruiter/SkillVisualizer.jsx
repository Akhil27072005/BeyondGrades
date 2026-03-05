import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { recruitersAPI } from '../../api/recruiters'
import { miscAPI } from '../../api/misc'

const SkillVisualizer = () => {
  const [skillData, setSkillData] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    collegeId: '',
    batch: ''
  })

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const fetchSkillData = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Fetching skill data with filters:', filters)
      const data = await recruitersAPI.getSkillDistribution(
        filters.collegeId || undefined,
        filters.batch || undefined
      )
      console.log('Skill data received:', data)
      setSkillData(data.skillDistribution || [])
    } catch (error) {
      setError('Failed to load skill distribution')
      console.error('Skill data error:', error)
    } finally {
      setLoading(false)
    }
  }

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
    fetchSkillData()
  }, [filters])

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Skill Distribution Analytics</h2>
          <p className="text-muted">Analyze skill distribution across colleges and batches</p>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>College</Form.Label>
                    <Form.Select
                      name="collegeId"
                      value={filters.collegeId}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Colleges</option>
                      {colleges.map((college) => (
                        <option key={college._id} value={college._id}>
                          {college.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Graduation Year</Form.Label>
                    <Form.Select
                      name="batch"
                      value={filters.batch}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Years</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>&nbsp;</Form.Label>
                    <div>
                      <Button onClick={fetchSkillData} variant="primary">
                        Refresh Data
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row>
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Skill Distribution</h5>
              </Card.Header>
              <Card.Body>
                {skillData.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Total Students</th>
                          <th>Beginner</th>
                          <th>Intermediate</th>
                          <th>Advanced</th>
                          <th>Expert</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skillData.map((skill, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{skill._id}</strong>
                            </td>
                            <td>
                              <span className="badge bg-primary">{skill.total}</span>
                            </td>
                            <td>
                              {skill.levels.find(l => l.level === 'beginner')?.count || 0}
                            </td>
                            <td>
                              {skill.levels.find(l => l.level === 'intermediate')?.count || 0}
                            </td>
                            <td>
                              {skill.levels.find(l => l.level === 'advanced')?.count || 0}
                            </td>
                            <td>
                              {skill.levels.find(l => l.level === 'expert')?.count || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <h5 className="text-muted">No skill data available</h5>
                    <p className="text-muted">
                      Try adjusting your filters or check back later.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <h3 className="text-primary">{skillData.length}</h3>
                  <p className="text-muted">Skills Tracked</p>
                </div>
                
                <hr />
                
                <h6>Top Skills:</h6>
                {skillData.slice(0, 5).map((skill, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{skill._id}</span>
                    <span className="badge bg-secondary">{skill.total}</span>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card className="mt-3">
              <Card.Header>
                <h5 className="mb-0">Insights</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <small>• Most popular skills are highlighted</small>
                  </li>
                  <li className="mb-2">
                    <small>• Skill levels show expertise distribution</small>
                  </li>
                  <li className="mb-2">
                    <small>• Use filters to analyze specific groups</small>
                  </li>
                  <li className="mb-2">
                    <small>• Data helps in job posting strategy</small>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default SkillVisualizer
