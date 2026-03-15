import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { profilesAPI } from '../api/profiles'
import './ProfileSearch.css'

const ProfileSearch = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ students: [], recruiters: [], companies: [] })
  const [searched, setSearched] = useState(false)

  const isStudent = user?.role === 'student'
  const isRecruiter = user?.role === 'recruiter'

  const handleSearch = async (e) => {
    e?.preventDefault()
    const q = query.trim()
    if (q.length < 2) {
      setResults({ students: [], recruiters: [], companies: [] })
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const data = await profilesAPI.search(q)
      setResults({
        students: data.students || [],
        recruiters: data.recruiters || [],
        companies: data.companies || []
      })
    } catch (err) {
      console.error('Search error:', err)
      setResults({ students: [], recruiters: [], companies: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudent = (id) => {
    if (isRecruiter) navigate(`/recruiter/view/student/${id}`)
    else navigate(`/student/view/student/${id}`)
  }

  const handleViewRecruiter = (id) => {
    navigate(`/student/view/recruiter/${id}`)
  }

  const handleViewCompany = (id) => {
    navigate(`/student/view/company/${id}`)
  }

  const searchPlaceholder = isStudent
    ? 'Search by recruiter name or company name...'
    : 'Search by student name...'

  return (
    <div className={`profile-search-page ${isStudent ? 'profile-search-blue' : 'profile-search-purple'}`}>
      <div className="profile-search-container">
        <h1 className="profile-search-title">View profiles</h1>
        <p className="profile-search-desc">
          {isStudent
            ? 'Find recruiters and companies to learn more about them.'
            : 'Find students to view their public profiles.'}
        </p>

        <form className="profile-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="profile-search-input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            minLength={2}
            aria-label="Search"
          />
          <button type="submit" className="profile-search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searched && !loading && (
          <div className="profile-search-results">
            {isRecruiter && results.students.length > 0 && (
              <section className="profile-search-section">
                <h2 className="profile-search-section-title">Students</h2>
                <ul className="profile-search-list">
                  {results.students.map((s) => (
                    <li key={s._id} className="profile-search-item">
                      <div className="profile-search-item-content">
                        <span className="profile-search-item-name">{s.name}</span>
                        {s.collegeId?.name && (
                          <span className="profile-search-item-meta">{s.collegeId.name}</span>
                        )}
                        {s.yearOfGraduation && (
                          <span className="profile-search-item-meta">Graduation: {s.yearOfGraduation}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="profile-search-item-btn"
                        onClick={() => handleViewStudent(s._id)}
                      >
                        View profile
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {isStudent && results.recruiters.length > 0 && (
              <section className="profile-search-section">
                <h2 className="profile-search-section-title">Recruiters</h2>
                <ul className="profile-search-list">
                  {results.recruiters.map((r) => (
                    <li key={r._id} className="profile-search-item">
                      <div className="profile-search-item-content">
                        <span className="profile-search-item-name">{r.name}</span>
                        {r.companyName && (
                          <span className="profile-search-item-meta">{r.companyName}</span>
                        )}
                        {r.jobTitle && (
                          <span className="profile-search-item-meta">{r.jobTitle}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="profile-search-item-btn"
                        onClick={() => handleViewRecruiter(r._id)}
                      >
                        View profile
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {isStudent && results.companies.length > 0 && (
              <section className="profile-search-section">
                <h2 className="profile-search-section-title">Companies</h2>
                <ul className="profile-search-list">
                  {results.companies.map((c) => (
                    <li key={c._id} className="profile-search-item">
                      <div className="profile-search-item-content">
                        <span className="profile-search-item-name">{c.name}</span>
                        {c.description && (
                          <span className="profile-search-item-meta profile-search-item-desc">
                            {c.description.slice(0, 80)}
                            {c.description.length > 80 ? '…' : ''}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="profile-search-item-btn"
                        onClick={() => handleViewCompany(c._id)}
                      >
                        View profile
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {searched && !loading &&
              results.students.length === 0 &&
              results.recruiters.length === 0 &&
              results.companies.length === 0 && (
                <p className="profile-search-empty">No results found. Try a different search.</p>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileSearch
