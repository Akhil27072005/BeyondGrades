import React, { useState, useEffect } from 'react'
import { Container, Button, Alert, Modal, Form, Dropdown } from 'react-bootstrap'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'
import './JobDetail.css'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
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
  const [activeTab, setActiveTab] = useState('talent')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const rowsPerPage = 10
  const [pipelineData, setPipelineData] = useState({ stages: {}, stageOrder: [] })
  const [pipelineLoading, setPipelineLoading] = useState(false)
  const [pipelineSort, setPipelineSort] = useState('timeInStage')
  const [pipelineSearch, setPipelineSearch] = useState('')
  const [rejectModal, setRejectModal] = useState(null) // { applicationId, studentName } when open

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, shortlistData] = await Promise.all([
          recruitersAPI.getJob(id),
          recruitersAPI.getJobShortlist(id, 200)
        ])
        setJob(jobData)
        setShortlist(shortlistData.matches || [])
      } catch (err) {
        setError('Failed to load job details')
        console.error('Job detail error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    if (activeTab !== 'pipeline' || !id) return
    const fetchPipeline = async () => {
      setPipelineLoading(true)
      try {
        const data = await recruitersAPI.getPipeline(id, pipelineSort)
        setPipelineData({ stages: data.stages || {}, stageOrder: data.stageOrder || [] })
      } catch (err) {
        console.error('Pipeline fetch error:', err)
        setPipelineData({ stages: {}, stageOrder: ['application', 'screening', 'assignment', 'technical_interview', 'hire'] })
      } finally {
        setPipelineLoading(false)
      }
    }
    fetchPipeline()
  }, [id, activeTab, pipelineSort])

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
      setInterviewDetails({ date: '', time: '', location: '', type: 'online' })
    } catch (err) {
      setError('Failed to send invitations')
      console.error('Invite error:', err)
    }
  }

  const handleMarkHired = async (candidateId) => {
    if (!window.confirm('Are you sure you want to mark this candidate as hired?')) return
    try {
      await recruitersAPI.markHired(id, candidateId)
      const shortlistData = await recruitersAPI.getJobShortlist(id, 200)
      setShortlist(shortlistData.matches || [])
    } catch (err) {
      setError('Failed to mark as hired')
      console.error('Mark hired error:', err)
    }
  }

  const handleAddToPipeline = async (studentId) => {
    setError('')
    try {
      await recruitersAPI.addToPipeline(id, studentId)
      const data = await recruitersAPI.getPipeline(id, pipelineSort)
      setPipelineData({ stages: data.stages || {}, stageOrder: data.stageOrder || [] })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to pipeline')
      console.error('Add to pipeline error:', err)
    }
  }

  const PIPELINE_STAGE_LABELS = {
    application: 'Application',
    screening: 'Screening',
    assignment: 'Assignment',
    technical_interview: 'Technical Interview',
    hire: 'Hire'
  }

  const getTimeAlert = (candidate) => {
    const now = new Date()
    const moved = candidate.stageMovedAt ? new Date(candidate.stageMovedAt) : null
    const deadline = candidate.stageDeadline ? new Date(candidate.stageDeadline) : null
    if (deadline && now > deadline) {
      const days = Math.floor((now - deadline) / (24 * 60 * 60 * 1000))
      return days <= 1 ? 'Deadline lapsed 1 day ago' : `Deadline lapsed ${days} days ago`
    }
    if (moved) {
      const days = Math.floor((now - moved) / (24 * 60 * 60 * 1000))
      if (days >= 3) return `No reply for ${days} days`
    }
    return null
  }

  const handleMoveStage = async (applicationId, newStage) => {
    try {
      await recruitersAPI.updateApplicationStage(id, applicationId, { pipelineStage: newStage })
      const data = await recruitersAPI.getPipeline(id, pipelineSort)
      setPipelineData({ stages: data.stages || {}, stageOrder: data.stageOrder || [] })
    } catch (err) {
      setError('Failed to update stage')
      console.error('Move stage error:', err)
    }
  }

  const handleReject = async (applicationId) => {
    try {
      await recruitersAPI.updateApplicationStage(id, applicationId, { status: 'rejected' })
      const data = await recruitersAPI.getPipeline(id, pipelineSort)
      setPipelineData({ stages: data.stages || {}, stageOrder: data.stageOrder || [] })
      setRejectModal(null)
    } catch (err) {
      setError('Failed to reject')
      console.error('Reject error:', err)
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
    } catch (err) {
      setError('Failed to export CSV')
      console.error('Export error:', err)
    }
  }

  const filteredShortlist = shortlist.filter(c => {
    const name = (c.studentName || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase().trim())
  })

  const totalPages = Math.max(1, Math.ceil(filteredShortlist.length / rowsPerPage))
  const startIdx = (page - 1) * rowsPerPage
  const paginatedList = filteredShortlist.slice(startIdx, startIdx + rowsPerPage)

  const formatDate = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
  }

  if (loading) {
    return (
      <Container className="py-4 job-detail-page">
        <div className="job-detail-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    )
  }

  if (error && !job) {
    return (
      <Container className="py-4 job-detail-page">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        {/* Back + breadcrumbs */}
        <div className="job-detail-top">
          <Link to="/recruiter/jobs" className="job-detail-back">← Back</Link>
          <nav className="job-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/recruiter/jobs">Jobs Posted</Link>
            <span className="job-detail-breadcrumb-sep">›</span>
            <span>{job?.title}</span>
          </nav>
        </div>

        {/* Title row + primary action */}
        <div className="job-detail-header">
          <h1 className="job-detail-title">{job?.title}</h1>
          <div className="job-detail-actions">
            <Button variant="outline-secondary" size="sm" onClick={handleExportCSV} className="me-2">
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              disabled={selectedCandidates.length === 0}
              className="job-detail-btn-invite"
            >
              Invite selected ({selectedCandidates.length})
            </Button>
          </div>
        </div>

        {/* Overview section: first 4 as one block, Active participants separate */}
        <section className="job-detail-overview">
          <div className="job-detail-overview-row">
            <div className="job-detail-overview-block">
              <h2 className="job-detail-overview-title">Overview</h2>
              <div className="job-detail-overview-items">
                <div className="job-detail-overview-item">
                  <span className="job-detail-overview-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </span>
                  <div>
                    <span className="job-detail-overview-value">{job?.domain || '—'}</span>
                    <span className="job-detail-overview-label">Domain</span>
                  </div>
                </div>
                <div className="job-detail-overview-item">
                  <span className="job-detail-overview-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <div>
                    <span className="job-detail-overview-value">{job?.location || job?.locationType || '—'}</span>
                    <span className="job-detail-overview-label">Location</span>
                  </div>
                </div>
                <div className="job-detail-overview-item">
                  <span className="job-detail-overview-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <div>
                    <span className="job-detail-overview-value">{job?.minExperienceYears != null ? `${job.minExperienceYears} years` : '—'}</span>
                    <span className="job-detail-overview-label">Experience</span>
                  </div>
                </div>
                <div className="job-detail-overview-item">
                  <span className="job-detail-overview-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </span>
                  <div>
                    <span className="job-detail-overview-value">{job?.jobType || '—'}</span>
                    <span className="job-detail-overview-label">Job type</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="job-detail-card job-detail-card-highlight">
              <span className="job-detail-card-icon" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <div>
                <span className="job-detail-card-label">Active participants</span>
                <span className="job-detail-card-number">{shortlist.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="job-detail-tabs">
          <button
            type="button"
            className={`job-detail-tab ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            Pipeline
          </button>
          <button
            type="button"
            className={`job-detail-tab ${activeTab === 'talent' ? 'active' : ''}`}
            onClick={() => setActiveTab('talent')}
          >
            Talent pool
          </button>
        </div>

        {/* Search + filters (for talent tab) */}
        {activeTab === 'talent' && (
          <div className="job-detail-toolbar">
            <div className="job-detail-search-wrap">
              <span className="job-detail-search-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input
                type="text"
                className="job-detail-search"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" className="job-detail-filter-btn">
              Filter
            </button>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'pipeline' && (
          <div className="job-detail-tab-content job-detail-pipeline-wrap">
            <div className="job-detail-pipeline-toolbar">
              <div className="job-detail-search-wrap">
                <span className="job-detail-search-icon" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </span>
                <input
                  type="text"
                  className="job-detail-search"
                  placeholder="Search by name"
                  value={pipelineSearch}
                  onChange={(e) => setPipelineSearch(e.target.value)}
                />
              </div>
              <select
                className="job-detail-pipeline-sort"
                value={pipelineSort}
                onChange={(e) => setPipelineSort(e.target.value)}
                aria-label="Sort"
              >
                <option value="timeInStage">Time in stage (longest)</option>
              </select>
              <button type="button" className="job-detail-filter-btn">Filter</button>
            </div>
            {pipelineLoading ? (
              <div className="job-detail-pipeline-loading">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              </div>
            ) : (
              <div className="job-detail-pipeline-board">
                {(pipelineData.stageOrder || []).map((stageKey) => {
                  const candidates = (pipelineData.stages[stageKey] || []).filter(
                    (c) => !pipelineSearch.trim() || (c.studentName || '').toLowerCase().includes(pipelineSearch.toLowerCase().trim())
                  )
                  return (
                    <div key={stageKey} className="job-detail-pipeline-column">
                      <h3 className="job-detail-pipeline-column-title">{PIPELINE_STAGE_LABELS[stageKey] || stageKey}</h3>
                      <div className="job-detail-pipeline-cards">
                        {candidates.length === 0 ? (
                          <p className="job-detail-pipeline-empty">No candidates</p>
                        ) : (
                          candidates.map((candidate) => {
                            const timeAlert = getTimeAlert(candidate)
                            return (
                              <div key={candidate.applicationId} className="job-detail-pipeline-card">
                                <div className="job-detail-pipeline-card-header">
                                  <button
                                    type="button"
                                    className="job-detail-pipeline-card-name"
                                    onClick={() => navigate(`/recruiter/view/student/${candidate.studentId}`, { state: { fromJobId: id } })}
                                  >
                                    {candidate.studentName || 'Unknown'}
                                  </button>
                                  <Dropdown align="end" className="job-detail-pipeline-card-move">
                                    <Dropdown.Toggle variant="link" className="job-detail-pipeline-card-move-btn" id={`move-${candidate.applicationId}`} title="Options">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                        <circle cx="12" cy="6" r="1.5"/>
                                        <circle cx="12" cy="12" r="1.5"/>
                                        <circle cx="12" cy="18" r="1.5"/>
                                      </svg>
                                    </Dropdown.Toggle>
                                  <Dropdown.Menu className="job-detail-pipeline-move-menu">
                                    {(pipelineData.stageOrder || []).filter((s) => s !== candidate.pipelineStage).map((targetStage) => (
                                      <Dropdown.Item
                                        key={targetStage}
                                        as="button"
                                        onClick={() => handleMoveStage(candidate.applicationId, targetStage)}
                                      >
                                        Move to {PIPELINE_STAGE_LABELS[targetStage] || targetStage}
                                      </Dropdown.Item>
                                    ))}
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                      as="button"
                                      className="job-detail-pipeline-reject"
                                      onClick={() => setRejectModal({ applicationId: candidate.applicationId, studentName: candidate.studentName })}
                                    >
                                      Reject
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                                <p className="job-detail-pipeline-card-substatus">{candidate.subStatus || '—'}</p>
                                {timeAlert && (
                                  <p className="job-detail-pipeline-card-alert">{timeAlert}</p>
                                )}
                                <div className="job-detail-pipeline-card-footer">
                                  {candidate.score != null && (
                                    <span className="job-detail-pipeline-card-score">Overall score {candidate.score}%</span>
                                  )}
                                  {candidate.isTopMatch && (
                                    <span className="job-detail-pipeline-card-topmatch">Top match</span>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'talent' && (
          <div className="job-detail-tab-content job-detail-table-wrap">
            {filteredShortlist.length === 0 ? (
              <div className="job-detail-empty">
                <h5 className="text-muted">No candidates found</h5>
                <p className="text-muted">Try adjusting search or check back later.</p>
              </div>
            ) : (
              <>
                <div className="job-detail-table-scroll">
                  <table className="job-detail-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Match Score</th>
                        <th>Score breakdown</th>
                        <th>Application date</th>
                        <th>Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedList.map((candidate, index) => (
                        <tr key={candidate.studentId || index}>
                          <td>
                            <strong>{candidate.studentName || `Student ${candidate.studentId}`}</strong>
                          </td>
                          <td>
                            <span className="job-detail-score">
                              {Math.round((candidate.score ?? 0) * 100)}%
                            </span>
                          </td>
                          <td>
                            <span className="job-detail-split">
                              D: {Math.round((candidate.domainScore ?? 0) * 100)}% · S: {Math.round((candidate.skillScore ?? 0) * 100)}% · E: {Math.round((candidate.expertiseScore ?? 0) * 100)}%
                            </span>
                          </td>
                          <td>{formatDate(candidate.applicationDate)}</td>
                          <td>
                            <Dropdown align="end" className="job-detail-options-dropdown">
                              <Dropdown.Toggle variant="link" className="job-detail-options-btn" id={`opt-${candidate.studentId}`}>
                                ⋮
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  as="button"
                                  onClick={() => navigate(`/recruiter/view/student/${candidate.studentId}`, { state: { fromJobId: id } })}
                                >
                                  View
                                </Dropdown.Item>
                                <Dropdown.Item
                                  as="button"
                                  onClick={() => handleAddToPipeline(candidate.studentId)}
                                >
                                  Add to applications
                                </Dropdown.Item>
                                <Dropdown.Item
                                  as="button"
                                  onClick={() => handleMarkHired(candidate.studentId)}
                                >
                                  Hire
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="job-detail-pagination">
                    <button
                      type="button"
                      className="job-detail-page-btn"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      ← Previous
                    </button>
                    <div className="job-detail-page-nums">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          type="button"
                          className={`job-detail-page-num ${p === page ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="job-detail-page-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-3" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
      </div>

      {/* Reject confirmation modal */}
      <Modal show={!!rejectModal} onHide={() => setRejectModal(null)} centered className="job-detail-modal">
        <Modal.Header closeButton className="job-detail-modal-header">
          <Modal.Title className="job-detail-modal-title">Reject candidate</Modal.Title>
        </Modal.Header>
        <Modal.Body className="job-detail-modal-body">
          {rejectModal && (
            <p className="mb-0">
              Reject <strong>{rejectModal.studentName || 'this candidate'}</strong>? They will be removed from the pipeline.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="job-detail-modal-footer">
          <Button variant="secondary" className="job-detail-modal-btn-cancel" onClick={() => setRejectModal(null)}>Cancel</Button>
          <Button
            variant="danger"
            className="job-detail-modal-btn-reject"
            onClick={() => rejectModal && handleReject(rejectModal.applicationId)}
          >
            Reject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Invite Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered className="job-detail-modal">
        <Modal.Header closeButton className="job-detail-modal-header">
          <Modal.Title className="job-detail-modal-title">Send Interview Invitations</Modal.Title>
        </Modal.Header>
        <Modal.Body className="job-detail-modal-body">
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
        <Modal.Footer className="job-detail-modal-footer">
          <Button variant="secondary" className="job-detail-modal-btn-cancel" onClick={() => setShowInviteModal(false)}>Cancel</Button>
          <Button variant="primary" className="job-detail-modal-btn-primary" onClick={handleInviteCandidates}>Send Invitations</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default JobDetail
