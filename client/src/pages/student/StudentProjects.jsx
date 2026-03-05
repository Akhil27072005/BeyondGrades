import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap'
import { studentsAPI } from '../../api/students'
import './StudentProjects.css'

const StudentProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
    role: '',
    contributions: [],
    skillTags: [],
    domainTags: []
  })
  const [newContribution, setNewContribution] = useState('')
  const [newSkillTag, setNewSkillTag] = useState('')
  const [newDomainTag, setNewDomainTag] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const profile = await studentsAPI.getProfile()
      setProjects(profile.projects || [])
    } catch (error) {
      setError('Failed to load projects')
      console.error('Projects error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddContribution = () => {
    if (newContribution.trim()) {
      setFormData(prev => ({
        ...prev,
        contributions: [...prev.contributions, newContribution.trim()]
      }))
      setNewContribution('')
    }
  }

  const handleRemoveContribution = (index) => {
    setFormData(prev => ({
      ...prev,
      contributions: prev.contributions.filter((_, i) => i !== index)
    }))
  }

  const handleAddSkillTag = () => {
    if (newSkillTag.trim()) {
      setFormData(prev => ({
        ...prev,
        skillTags: [...prev.skillTags, newSkillTag.trim()]
      }))
      setNewSkillTag('')
    }
  }

  const handleRemoveSkillTag = (index) => {
    setFormData(prev => ({
      ...prev,
      skillTags: prev.skillTags.filter((_, i) => i !== index)
    }))
  }

  const handleAddDomainTag = () => {
    if (newDomainTag.trim()) {
      setFormData(prev => ({
        ...prev,
        domainTags: [...prev.domainTags, newDomainTag.trim()]
      }))
      setNewDomainTag('')
    }
  }

  const handleRemoveDomainTag = (index) => {
    setFormData(prev => ({
      ...prev,
      domainTags: prev.domainTags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingProject) {
        await studentsAPI.updateProject(editingProject._id, formData)
      } else {
        await studentsAPI.createProject(formData)
      }
      
      setShowModal(false)
      setEditingProject(null)
      setFormData({
        title: '',
        description: '',
        repoUrl: '',
        demoUrl: '',
        role: '',
        contributions: [],
        skillTags: [],
        domainTags: []
      })
      fetchProjects()
    } catch (error) {
      setError('Failed to save project')
      console.error('Project save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      title: project.title || '',
      description: project.description || '',
      repoUrl: project.repoUrl || '',
      demoUrl: project.demoUrl || '',
      role: project.role || '',
      contributions: project.contributions || [],
      skillTags: project.skillTags || [],
      domainTags: project.domainTags || []
    })
    setShowModal(true)
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await studentsAPI.deleteProject(projectId)
        fetchProjects()
      } catch (error) {
        setError('Failed to delete project')
        console.error('Delete error:', error)
      }
    }
  }

  const openModal = () => {
    setEditingProject(null)
    setFormData({
      title: '',
      description: '',
      repoUrl: '',
      demoUrl: '',
      role: '',
      contributions: [],
      skillTags: [],
      domainTags: []
    })
    setShowModal(true)
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

  const modalTitle = editingProject ? 'Edit Project' : 'Add New Project'
  const modalSubtitle = editingProject ? 'Update your project details below' : 'Showcase your work with title, links, and tags'

  return (
    <div className="student-projects-page">
      <Container className="py-4">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="spj-page-title">My Projects</h2>
              <Button onClick={openModal} className="spj-btn-add" variant="primary">
                <i className="bi bi-plus-lg me-2" aria-hidden />
                Add Project
              </Button>
            </div>
          </Col>
        </Row>

        {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

        <Row className="g-4">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <Col md={6} lg={4} key={index}>
                <Card className="spj-project-card h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="spj-project-card-header d-flex align-items-start justify-content-between mb-3">
                      <div className="spj-project-card-icon-wrap" aria-hidden>
                        <i className="bi bi-folder2-open" />
                      </div>
                      <div className="flex-grow-1 ms-2">
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <Card.Title className="mb-0">{project.title}</Card.Title>
                          {project.role && (
                            <span className="spj-project-role-pill">
                              <i className="bi bi-person-workspace me-1" aria-hidden />
                              {project.role}
                            </span>
                          )}
                        </div>
                        {(project.repoUrl || project.demoUrl) && (
                          <div className="spj-project-links-inline mt-2">
                            {project.repoUrl && (
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="spj-project-link-btn"
                              >
                                <i className="bi bi-github me-1" aria-hidden />
                                Code
                              </a>
                            )}
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="spj-project-link-btn"
                              >
                                <i className="bi bi-box-arrow-up-right me-1" aria-hidden />
                                Live demo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <Card.Text className="text-muted spj-project-description mb-3">
                      {(project.description || '').length > 110
                        ? `${project.description.substring(0, 110)}…`
                        : project.description}
                    </Card.Text>

                    <div className="spj-project-tags mb-3">
                      {project.skillTags && project.skillTags.length > 0 && (
                        <div className="mb-2">
                          <div className="d-flex align-items-center mb-1">
                            <span className="spj-tag-label-icon me-1" aria-hidden>
                              <i className="bi bi-stars" />
                            </span>
                            <span className="spj-tag-label-text">Skills</span>
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {project.skillTags.map((tag, i) => (
                              <span key={i} className="badge rounded-pill spj-chip-skill">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {project.domainTags && project.domainTags.length > 0 && (
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <span className="spj-tag-label-icon me-1" aria-hidden>
                              <i className="bi bi-grid-3x3-gap" />
                            </span>
                            <span className="spj-tag-label-text">Domains</span>
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {project.domainTags.map((tag, i) => (
                              <span key={i} className="badge rounded-pill spj-chip-domain">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="spj-project-card-footer d-flex align-items-center justify-content-between mt-auto pt-2">
                      <div className="d-flex align-items-center small text-muted">
                        <i className="bi bi-clock-history me-1" aria-hidden />
                        <span>Last updated project</span>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="spj-btn-edit"
                          onClick={() => handleEdit(project)}
                        >
                          <i className="bi bi-pencil me-1" aria-hidden />
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(project._id)}
                        >
                          <i className="bi bi-trash me-1" aria-hidden />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <Card className="spj-empty-card text-center py-5">
                <Card.Body>
                  <div className="mb-3" style={{ color: '#2563eb' }} aria-hidden>
                    <i className="bi bi-folder2-open" style={{ fontSize: '3rem' }} />
                  </div>
                  <h5 className="fw-semibold text-dark mb-2">No projects yet</h5>
                  <p className="text-muted mb-4">Add your first project to showcase your skills</p>
                  <Button onClick={openModal} className="spj-btn-add" variant="primary">
                    <i className="bi bi-plus-lg me-2" aria-hidden />
                    Add Project
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Project Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="spj-modal">
          <Modal.Header closeButton>
            <div className="spj-modal-header-inner w-100">
              <div className="spj-modal-header-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </div>
              <div className="flex-grow-1">
                <h5 className="spj-modal-title">{modalTitle}</h5>
                <p className="spj-modal-subtitle">{modalSubtitle}</p>
              </div>
            </div>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {/* Basics */}
              <div className="spj-form-section">
                <div className="spj-section-title">
                  <i className="bi bi-journal-text spj-section-icon" aria-hidden />
                  Basics
                </div>
                <div className="spj-field-wrap">
                  <div className="spj-field-icon">
                    <i className="bi bi-tag-fill" aria-hidden />
                  </div>
                  <div className="spj-field-body">
                    <Form.Label>Project Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. E-commerce Dashboard"
                    />
                  </div>
                </div>
                <div className="spj-field-wrap">
                  <div className="spj-field-icon">
                    <i className="bi bi-card-text" aria-hidden />
                  </div>
                  <div className="spj-field-body">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Describe your project, technologies used, and outcomes..."
                    />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="spj-form-section">
                <div className="spj-section-title">
                  <i className="bi bi-link-45deg spj-section-icon" aria-hidden />
                  Links
                </div>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="spj-field-wrap">
                      <div className="spj-field-icon">
                        <i className="bi bi-github" aria-hidden />
                      </div>
                      <div className="spj-field-body">
                        <Form.Label>Repository URL</Form.Label>
                        <Form.Control
                          type="url"
                          name="repoUrl"
                          value={formData.repoUrl}
                          onChange={handleInputChange}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="spj-field-wrap">
                      <div className="spj-field-icon">
                        <i className="bi bi-box-arrow-up-right" aria-hidden />
                      </div>
                      <div className="spj-field-body">
                        <Form.Label>Demo URL</Form.Label>
                        <Form.Control
                          type="url"
                          name="demoUrl"
                          value={formData.demoUrl}
                          onChange={handleInputChange}
                          placeholder="https://your-demo.com"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Role & Tags */}
              <div className="spj-form-section">
                <div className="spj-section-title">
                  <i className="bi bi-person-badge spj-section-icon" aria-hidden />
                  Role & Tags
                </div>
                <div className="spj-field-wrap mb-3">
                  <div className="spj-field-icon">
                    <i className="bi bi-person-workspace" aria-hidden />
                  </div>
                  <div className="spj-field-body">
                    <Form.Label>Your Role</Form.Label>
                    <Form.Control
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      placeholder="e.g., Full Stack Developer, Team Lead"
                    />
                  </div>
                </div>

                <div className="spj-field-wrap">
                  <div className="spj-field-icon">
                    <i className="bi bi-tags" aria-hidden />
                  </div>
                  <div className="spj-field-body">
                    <Form.Label>Skill tags</Form.Label>
                    <div className="spj-tag-row">
                      <Form.Control
                        type="text"
                        value={newSkillTag}
                        onChange={(e) => setNewSkillTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkillTag())}
                        placeholder="e.g. React, Node.js"
                      />
                      <Button type="button" className="spj-tag-add-btn" onClick={handleAddSkillTag}>
                        <i className="bi bi-plus-lg" aria-hidden />
                        Add
                      </Button>
                    </div>
                    <div className="spj-chip-list">
                      {formData.skillTags.map((tag, index) => (
                        <span key={index} className="spj-chip spj-chip-skill">
                          {tag}
                          <button type="button" className="spj-chip-remove" onClick={() => handleRemoveSkillTag(index)} aria-label={`Remove ${tag}`}>
                            <i className="bi bi-x" aria-hidden />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="spj-field-wrap mt-3">
                  <div className="spj-field-icon">
                    <i className="bi bi-grid-3x3-gap" aria-hidden />
                  </div>
                  <div className="spj-field-body">
                    <Form.Label>Domain tags</Form.Label>
                    <div className="spj-tag-row">
                      <Form.Control
                        type="text"
                        value={newDomainTag}
                        onChange={(e) => setNewDomainTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomainTag())}
                        placeholder="e.g. web development, ML"
                      />
                      <Button type="button" className="spj-tag-add-btn" onClick={handleAddDomainTag}>
                        <i className="bi bi-plus-lg" aria-hidden />
                        Add
                      </Button>
                    </div>
                    <div className="spj-chip-list">
                      {formData.domainTags.map((tag, index) => (
                        <span key={index} className="spj-chip spj-chip-domain">
                          {tag}
                          <button type="button" className="spj-chip-remove" onClick={() => handleRemoveDomainTag(index)} aria-label={`Remove ${tag}`}>
                            <i className="bi bi-x" aria-hidden />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributions */}
              <div className="spj-form-section">
                <div className="spj-section-title">
                  <i className="bi bi-list-check spj-section-icon" aria-hidden />
                  Contributions
                </div>
                <div className="spj-field-wrap">
                  <div className="spj-field-icon">
                    <i className="bi bi-check2-square" aria-hidden />
                  </div>
                  <div className="spj-field-body">
                    <Form.Label>Add contribution items</Form.Label>
                    <div className="spj-tag-row">
                      <Form.Control
                        type="text"
                        value={newContribution}
                        onChange={(e) => setNewContribution(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddContribution())}
                        placeholder="e.g. Built REST API, led code reviews"
                      />
                      <Button type="button" className="spj-tag-add-btn" onClick={handleAddContribution}>
                        <i className="bi bi-plus-lg" aria-hidden />
                        Add
                      </Button>
                    </div>
                    <div className="spj-chip-list">
                      {formData.contributions.map((contribution, index) => (
                        <span key={index} className="spj-chip spj-chip-contribution">
                          {contribution}
                          <button type="button" className="spj-chip-remove" onClick={() => handleRemoveContribution(index)} aria-label={`Remove contribution`}>
                            <i className="bi bi-x" aria-hidden />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="outline-secondary" className="spj-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="spj-btn-save" variant="primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" aria-hidden />
                    {editingProject ? 'Update Project' : 'Save Project'}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  )
}

export default StudentProjects
