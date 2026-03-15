import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'
import './RecruiterJobsList.css'

const RecruiterJobsList = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await recruitersAPI.getJobs()
        setJobs(data)
      } catch (err) {
        setError('Failed to load jobs')
        console.error('Jobs list error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="jobs-list-page">
        <div className="jobs-list-container">
          <div className="jobs-list-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="jobs-list-page">
        <div className="jobs-list-container">
          <div className="jobs-list-error alert alert-danger" role="alert">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="jobs-list-page">
      <div className="jobs-list-container">
        <div className="jobs-list-header">
          <h1 className="jobs-list-title">Jobs Posted</h1>
          <Link to="/recruiter/jobs/create" className="jobs-list-btn-primary">
            Post New Job
          </Link>
        </div>

        <div className="jobs-list-card">
          {jobs.length > 0 ? (
            <ul className="jobs-list">
              {jobs.map((job) => {
                const skillsCount = job.requiredSkills?.length ?? 0
                const postedDate = job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : null
                return (
                  <li key={job._id} className="jobs-list-item">
                    <div className="jobs-list-item-content">
                      <h3 className="jobs-list-item-title">{job.title}</h3>
                      <span className="jobs-list-item-domain">{job.domain}</span>
                      <div className="jobs-list-item-meta">
                        {job.jobType && (
                          <span className="jobs-list-item-tag">{job.jobType}</span>
                        )}
                        {job.locationType && (
                          <span className="jobs-list-item-tag jobs-list-item-tag-muted">
                            {job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)}
                          </span>
                        )}
                        {job.jobDuration && (
                          <span className="jobs-list-item-tag jobs-list-item-tag-muted">
                            {job.jobDuration}
                          </span>
                        )}
                        {skillsCount > 0 && (
                          <span className="jobs-list-item-tag jobs-list-item-tag-muted">
                            {skillsCount} skill{skillsCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {postedDate && (
                          <span className="jobs-list-item-date">Posted {postedDate}</span>
                        )}
                      </div>
                    </div>
                    <Link to={`/recruiter/jobs/${job._id}`} className="jobs-list-item-view">
                      View
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="jobs-list-empty">
              <p className="jobs-list-empty-text">No jobs posted yet</p>
              <Link to="/recruiter/jobs/create" className="jobs-list-btn-primary">
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecruiterJobsList
