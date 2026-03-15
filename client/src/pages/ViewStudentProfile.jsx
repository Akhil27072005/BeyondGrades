import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { studentsAPI } from '../api/students'
import './ViewStudentProfile.css'

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ViewStudentProfile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isRecruiter = user?.role === 'recruiter'
  const fromJobId = location.state?.fromJobId
  const backUrl = isRecruiter
    ? (fromJobId ? `/recruiter/jobs/${fromJobId}` : '/recruiter/jobs')
    : '/student/search'
  const backLabel = isRecruiter ? (fromJobId ? '← Back to job' : '← Back to jobs') : '← Back to search'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentsAPI.getPublicProfile(id)
        setProfile(data)
      } catch (err) {
        setError('Profile not found or private.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="view-student-profile-page">
        <div className="view-student-profile-container">
          <div className="view-student-profile-loading">
            <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="view-student-profile-page">
        <div className="view-student-profile-container">
          <p className="view-student-profile-error">{error || 'Profile not found.'}</p>
          <Link to={backUrl} className="view-student-profile-back">{backLabel}</Link>
        </div>
      </div>
    )
  }

  const skills = profile.skills || []
  const projects = profile.projects || []
  const applications = profile.applications || []
  const roleTags = profile.roleTags || []
  const college = profile.collegeId?.name || '—'
  const collegeAddress = profile.collegeId?.address

  return (
    <div className="view-student-profile-page">
      <div className="view-student-profile-container">
        <Link to={backUrl} className="view-student-profile-back">{backLabel}</Link>

        <div className="view-student-profile-hero">
          <div className="view-student-profile-avatar" aria-hidden>
            {(profile.name || '?')[0].toUpperCase()}
          </div>
          <div className="view-student-profile-hero-text">
            <h1 className="view-student-profile-name">{profile.name}</h1>
            <p className="view-student-profile-meta">
              {college}
              {profile.yearOfGraduation != null && ` · Class of ${profile.yearOfGraduation}`}
              {profile.degree && ` · ${profile.degree}`}
              {profile.branch && ` · ${profile.branch}`}
            </p>
          </div>
        </div>

        {/* Education */}
        <section className="view-student-profile-section">
          <h2 className="view-student-profile-section-title">Education</h2>
          <div className="view-student-profile-readonly">
            <p><strong>College:</strong> {college}</p>
            {collegeAddress && <p><strong>Address:</strong> {collegeAddress}</p>}
            {profile.yearOfGraduation != null && <p><strong>Graduation year:</strong> {profile.yearOfGraduation}</p>}
            {profile.degree && <p><strong>Degree:</strong> {profile.degree}</p>}
            {profile.branch && <p><strong>Branch:</strong> {profile.branch}</p>}
            {profile.cgpa != null && <p><strong>CGPA:</strong> {profile.cgpa}</p>}
            {profile.dateOfBirth && <p><strong>Date of birth:</strong> {formatDate(profile.dateOfBirth)}</p>}
            {!profile.degree && !profile.branch && profile.yearOfGraduation == null && !profile.cgpa && !profile.dateOfBirth && !collegeAddress && (
              <p className="view-student-profile-muted">No additional education details.</p>
            )}
          </div>
        </section>

        {/* Role tags */}
        {roleTags.length > 0 && (
          <section className="view-student-profile-section">
            <h2 className="view-student-profile-section-title">Role tags</h2>
            <div className="view-student-profile-tags">
              {roleTags.map((tag, i) => (
                <span key={i} className="view-student-profile-tag view-student-profile-tag-role">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="view-student-profile-section">
            <h2 className="view-student-profile-section-title">Skills</h2>
            <div className="view-student-profile-skills-list">
              {skills.map((s, i) => (
                <div key={i} className="view-student-profile-skill-row">
                  <span className="view-student-profile-tag">
                    {s.name} {s.level && `(${s.level})`}
                  </span>
                  {(s.years != null && s.years > 0) && (
                    <span className="view-student-profile-skill-meta">{s.years} year{s.years !== 1 ? 's' : ''}</span>
                  )}
                  {s.confidence != null && s.confidence > 0 && (
                    <span className="view-student-profile-skill-meta">Confidence: {Math.round(s.confidence * 100)}%</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="view-student-profile-section">
            <h2 className="view-student-profile-section-title">Projects</h2>
            <div className="view-student-profile-projects">
              {projects.map((proj) => (
                <div key={proj._id} className="view-student-profile-project-card">
                  <h3 className="view-student-profile-project-title">{proj.title}</h3>
                  {proj.description && <p className="view-student-profile-project-desc">{proj.description}</p>}
                  {proj.role && <p><strong>Role:</strong> {proj.role}</p>}
                  {(proj.domainTags?.length > 0 || proj.skillTags?.length > 0) && (
                    <div className="view-student-profile-project-tags">
                      {proj.domainTags?.map((t, i) => (
                        <span key={`d-${i}`} className="view-student-profile-tag view-student-profile-tag-sm">{t}</span>
                      ))}
                      {proj.skillTags?.map((t, i) => (
                        <span key={`s-${i}`} className="view-student-profile-tag view-student-profile-tag-sm view-student-profile-tag-skill">{t}</span>
                      ))}
                    </div>
                  )}
                  {proj.contributions?.length > 0 && (
                    <ul className="view-student-profile-contributions">
                      {proj.contributions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  )}
                  <div className="view-student-profile-project-links">
                    {proj.repoUrl && (
                      <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="view-student-profile-link">Repository</a>
                    )}
                    {proj.demoUrl && (
                      <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="view-student-profile-link">Demo</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Jobs applied */}
        {applications.length > 0 && (
          <section className="view-student-profile-section">
            <h2 className="view-student-profile-section-title">Jobs applied</h2>
            <div className="view-student-profile-apps-table-wrap">
              <table className="view-student-profile-apps-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.job?.title || '—'}</td>
                      <td>{app.job?.domain || '—'}</td>
                      <td>
                        <span className={`view-student-profile-status view-student-profile-status-${(app.status || '').toLowerCase()}`}>
                          {app.status || '—'}
                        </span>
                      </td>
                      <td>{formatDate(app.appliedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Links */}
        {(profile.githubUrl || profile.portfolioUrl || profile.linkedInUrl) && (
          <section className="view-student-profile-section">
            <h2 className="view-student-profile-section-title">Links</h2>
            <div className="view-student-profile-links">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="view-student-profile-link">
                  GitHub
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="view-student-profile-link">
                  Portfolio
                </a>
              )}
              {profile.linkedInUrl && (
                <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="view-student-profile-link">
                  LinkedIn
                </a>
              )}
            </div>
          </section>
        )}

        {/* Empty state if nothing beyond education */}
        {skills.length === 0 && projects.length === 0 && applications.length === 0 && roleTags.length === 0 &&
          !profile.githubUrl && !profile.portfolioUrl && !profile.linkedInUrl && (
          <section className="view-student-profile-section">
            <p className="view-student-profile-muted">No additional profile details yet.</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default ViewStudentProfile
