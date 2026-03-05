import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Table, Badge, Modal, Form } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'

const JobDetail = () => {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [shortlist, setShortlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    location: '',
    type: 'online'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, shortlistData] = await Promise.all([
          recruitersAPI.getJob(id),
          recruitersAPI.getJobShortlist(id)
        ])
        
        setJob(jobData)
        setShortlist(shortlistData.matches || [])
      } catch (error) {
        setError('Failed to load job details')
        console.error('Job detail error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const handleInviteCandidates = async () => {
    try {
      await recruitersAPI.inviteStudents(id, selectedCandidates, interviewDetails)
      setShowInviteModal(false)
      setSelectedCandidates([])
      setInterviewDetails({
        date: '',
        time: '',
        location: '',
        type: 'online'
      })
    } catch (error) {
      setError('Failed to send invitations')
      console.error('Invite error:', error)
    }
  }

  const handleMarkHired = async (candidateId) => {
    if (window.confirm('Are you sure you want to mark this candidate as hired?')) {
      try {
        await recruitersAPI.markHired(id, candidateId)
        // Refresh shortlist
        const shortlistData = await recruitersAPI.getJobShortlist(id)
        setShortlist(shortlistData.matches || [])
      } catch (error) {
        setError('Failed to mark as hired')
        console.error('Mark hired error:', error)
      }
    }
  }

  const handleExportCSV = async () => {
    try {
      const csvData = await recruitersAPI.exportShortlist(id)
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shortlist_${id}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to export CSV')
      console.error('Export error:', error)
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
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{job?.title}</h2>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={handleExportCSV}>
                Export CSV
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setShowInviteModal(true)}
                disabled={selectedCandidates.length === 0}
              >
                Invite Selected ({selectedCandidates.length})
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Job Details */}
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Job Information</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Domain:</strong> {job?.domain}</p>
              <p><strong>Location:</strong> {job?.locationType}</p>
              <p><strong>Experience:</strong> {job?.minExperienceYears} years</p>
              <p><strong>Target Batches:</strong> {job?.batchTarget?.join(', ')}</p>
              
              <hr />
              
              <h6>Required Skills:</h6>
              {job?.requiredSkills?.map((skill, index) => (
                <Badge key={index} bg="primary" className="me-1 mb-1">
                  {skill.name} ({skill.requiredLevel})
                </Badge>
              ))}
              
              {job?.optionalSkills?.length > 0 && (
                <>
                  <hr />
                  <h6>Optional Skills:</h6>
                  {job.optionalSkills.map((skill, index) => (
                    <Badge key={index} bg="secondary" className="me-1 mb-1">
                      {skill}
                    </Badge>
                  ))}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Shortlist */}
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Candidate Shortlist</h5>
            </Card.Header>
            <Card.Body>
              {shortlist.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCandidates(shortlist.map(c => c.studentId))
                            } else {
                              setSelectedCandidates([])
                            }
                          }}
                        />
                      </th>
                      <th>Name</th>
                      <th>Match Score</th>
                      <th>Skills</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortlist.map((candidate, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.studentId)}
                            onChange={() => handleCandidateSelect(candidate.studentId)}
                          />
                        </td>
                        <td>
                          <div>
                            <strong>Student {candidate.studentId}</strong>
                            <br />
                            <small className="text-muted">
                              {candidate.matchedSkills?.length || 0} skills matched
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="text-center">
                            <div className="match-score">
                              {Math.round(candidate.score * 100)}%
                            </div>
                            <small className="text-muted">
                              D: {Math.round(candidate.domainScore * 100)}% | 
                              S: {Math.round(candidate.skillScore * 100)}% | 
                              E: {Math.round(candidate.expertiseScore * 100)}%
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            {candidate.matchedSkills?.slice(0, 3).map((skill, i) => (
                              <Badge key={i} bg="success" className="me-1 mb-1">
                                {skill.name}
                              </Badge>
                            ))}
                            {candidate.matchedSkills?.length > 3 && (
                              <Badge bg="light" text="dark" className="me-1 mb-1">
                                +{candidate.matchedSkills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {/* View profile */}}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleMarkHired(candidate.studentId)}
                            >
                              Hire
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <h5 className="text-muted">No candidates found</h5>
                  <p className="text-muted">
                    Try adjusting your job requirements or check back later.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Invite Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Send Interview Invitations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Interview Date</Form.Label>
              <Form.Control
                type="date"
                value={interviewDetails.date}
                onChange={(e) => setInterviewDetails(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Interview Time</Form.Label>
              <Form.Control
                type="time"
                value={interviewDetails.time}
                onChange={(e) => setInterviewDetails(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Interview Type</Form.Label>
              <Form.Select
                value={interviewDetails.type}
                onChange={(e) => setInterviewDetails(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="online">Online</option>
                <option value="onsite">On-site</option>
                <option value="phone">Phone</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Location/Meeting Link</Form.Label>
              <Form.Control
                type="text"
                value={interviewDetails.location}
                onChange={(e) => setInterviewDetails(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location or meeting link"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInviteCandidates}>
            Send Invitations
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default JobDetail
