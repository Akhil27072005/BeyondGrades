import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    requiredSkills: [],
    optionalSkills: [],
    minExperienceYears: 0,
    locationType: 'onsite',
    batchTarget: [],
    shortlistSettings: {
      topN: 10,
      weights: { domain: 0.30, skill: 0.45, expertise: 0.25 }
    }
  })
  
  const [newSkill, setNewSkill] = useState({
    name: '',
    requiredLevel: 'intermediate',
    weight: 1.0
  })
  const [newOptionalSkill, setNewOptionalSkill] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('shortlistSettings.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        shortlistSettings: {
          ...prev.shortlistSettings,
          [field]: type === 'number' ? parseFloat(value) : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
      }))
    }
  }

  const handleAddRequiredSkill = () => {
    if (newSkill.name.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, { ...newSkill }]
      }))
      setNewSkill({
        name: '',
        requiredLevel: 'intermediate',
        weight: 1.0
      })
    }
  }

  const handleRemoveRequiredSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
    }))
  }

  const handleAddOptionalSkill = () => {
    if (newOptionalSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        optionalSkills: [...prev.optionalSkills, newOptionalSkill.trim()]
      }))
      setNewOptionalSkill('')
    }
  }

  const handleRemoveOptionalSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      optionalSkills: prev.optionalSkills.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await recruitersAPI.createJob(formData)
      setSuccess('Job created successfully!')
      setTimeout(() => {
        navigate('/recruiter/dashboard')
      }, 2000)
    } catch (error) {
      setError('Failed to create job')
      console.error('Job creation error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Create New Job</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Job Details</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Software Engineer"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Domain</Form.Label>
                      <Form.Select
                        name="domain"
                        value={formData.domain}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select domain</option>
                        <option value="web development">Web Development</option>
                        <option value="mobile development">Mobile Development</option>
                        <option value="data science">Data Science</option>
                        <option value="cloud computing">Cloud Computing</option>
                        <option value="blockchain">Blockchain</option>
                        <option value="cybersecurity">Cybersecurity</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Job Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe the role, responsibilities, and requirements..."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Experience (Years)</Form.Label>
                      <Form.Control
                        type="number"
                        name="minExperienceYears"
                        value={formData.minExperienceYears}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location Type</Form.Label>
                      <Form.Select
                        name="locationType"
                        value={formData.locationType}
                        onChange={handleInputChange}
                      >
                        <option value="onsite">On-site</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Target Graduation Years</Form.Label>
                  <div className="d-flex gap-2 flex-wrap">
                    {[2024, 2025, 2026, 2027].map(year => (
                      <Form.Check
                        key={year}
                        type="checkbox"
                        id={`batch-${year}`}
                        label={year}
                        checked={formData.batchTarget.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              batchTarget: [...prev.batchTarget, year]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              batchTarget: prev.batchTarget.filter(y => y !== year)
                            }))
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>

                <hr />

                <h5>Required Skills</h5>
                <div className="mb-3">
                  {formData.requiredSkills.map((skill, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center p-2 bg-light rounded mb-2">
                      <div>
                        <strong>{skill.name}</strong> - {skill.requiredLevel} (Weight: {skill.weight})
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveRequiredSkill(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Row>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Skill name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={newSkill.requiredLevel}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, requiredLevel: e.target.value }))}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="Weight"
                      value={newSkill.weight}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                    />
                  </Col>
                  <Col md={2}>
                    <Button onClick={handleAddRequiredSkill} variant="outline-primary" size="sm">
                      Add
                    </Button>
                  </Col>
                </Row>

                <hr />

                <h5>Optional Skills</h5>
                <div className="mb-3">
                  {formData.optionalSkills.map((skill, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center p-2 bg-light rounded mb-2">
                      <span>{skill}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveOptionalSkill(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Optional skill"
                    value={newOptionalSkill}
                    onChange={(e) => setNewOptionalSkill(e.target.value)}
                  />
                  <Button onClick={handleAddOptionalSkill} variant="outline-primary">
                    Add
                  </Button>
                </div>

                <hr />

                <h5>Matching Settings</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Top N Candidates</Form.Label>
                      <Form.Control
                        type="number"
                        name="shortlistSettings.topN"
                        value={formData.shortlistSettings.topN}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Label>Matching Weights</Form.Label>
                    <Row>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Domain</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name="shortlistSettings.weights.domain"
                            value={formData.shortlistSettings.weights.domain}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Skills</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name="shortlistSettings.weights.skill"
                            value={formData.shortlistSettings.weights.skill}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Expertise</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name="shortlistSettings.weights.expertise"
                            value={formData.shortlistSettings.weights.expertise}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Creating Job...' : 'Create Job'}
                  </Button>
                  <Button type="button" variant="outline-secondary" onClick={() => navigate('/recruiter/dashboard')}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Tips</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <small>• Be specific with required skills</small>
                </li>
                <li className="mb-2">
                  <small>• Use appropriate skill levels</small>
                </li>
                <li className="mb-2">
                  <small>• Set realistic experience requirements</small>
                </li>
                <li className="mb-2">
                  <small>• Target relevant graduation years</small>
                </li>
                <li className="mb-2">
                  <small>• Adjust matching weights as needed</small>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default CreateJob
