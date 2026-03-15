import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { recruitersAPI } from '../../api/recruiters'
import { miscAPI } from '../../api/misc'
import CustomSelect from '../../components/CustomSelect'
import './SkillVisualizer.css'

// Normalize skill name for icon lookup (lowercase, trim)
const norm = (s) => (s || '').toLowerCase().trim()

// Common skills -> icon key (inline SVGs below)
const SKILL_ICON_MAP = {
  [norm('JavaScript')]: 'code',
  [norm('React')]: 'layout',
  [norm('Node.js')]: 'server',
  [norm('Node')]: 'server',
  [norm('Python')]: 'code',
  [norm('Java')]: 'code',
  [norm('TypeScript')]: 'code',
  [norm('HTML')]: 'layout',
  [norm('CSS')]: 'layout',
  [norm('SQL')]: 'database',
  [norm('MongoDB')]: 'database',
  [norm('AWS')]: 'cloud',
  [norm('Docker')]: 'cloud',
  [norm('Kubernetes')]: 'cloud',
  [norm('Git')]: 'git',
  [norm('Machine Learning')]: 'chart',
  [norm('TensorFlow')]: 'chart',
  [norm('Swift')]: 'code',
  [norm('iOS')]: 'code',
  [norm('Android')]: 'code',
  [norm('Go')]: 'code',
  [norm('C++')]: 'code',
  [norm('Ruby')]: 'code',
  [norm('PHP')]: 'code',
  [norm('R')]: 'chart',
  [norm('Excel')]: 'chart',
  [norm('REST')]: 'server',
  [norm('API')]: 'server',
  [norm('Microservices')]: 'server',
  [norm('Spring Boot')]: 'code',
  [norm('React Native')]: 'layout',
  [norm('Vue')]: 'layout',
  [norm('Angular')]: 'layout',
  [norm('Redux')]: 'layout',
  [norm('GraphQL')]: 'server',
  [norm('PostgreSQL')]: 'database',
  [norm('MySQL')]: 'database',
  [norm('Redis')]: 'database',
  [norm('Firebase')]: 'cloud',
  [norm('Linux')]: 'terminal',
  [norm('DevOps')]: 'cloud',
  [norm('CI/CD')]: 'git',
  [norm('Agile')]: 'chart',
  [norm('Figma')]: 'layout',
  [norm('UI/UX')]: 'layout',
  [norm('Data Structures')]: 'code',
  [norm('Algorithms')]: 'code',
  [norm('Computer Science')]: 'code',
  [norm('Electrical Engineering')]: 'terminal',
  [norm('Mathematics')]: 'chart',
  [norm('Communication')]: 'chart',
  [norm('Leadership')]: 'chart',
  [norm('Problem Solving')]: 'code',
  // Additional programming languages & frameworks
  [norm('C')]: 'code',
  [norm('C#')]: 'code',
  [norm('Kotlin')]: 'code',
  [norm('Scala')]: 'code',
  [norm('Rust')]: 'code',
  [norm('Dart')]: 'code',
  [norm('Elixir')]: 'code',
  [norm('Perl')]: 'code',
  [norm('Lua')]: 'code',
  [norm('Objective-C')]: 'code',
  [norm('Next.js')]: 'layout',
  [norm('Svelte')]: 'layout',
  [norm('Ember')]: 'layout',
  [norm('jQuery')]: 'layout',
  [norm('Bootstrap')]: 'layout',
  [norm('Tailwind')]: 'layout',
  [norm('Tailwind CSS')]: 'layout',
  [norm('Express')]: 'server',
  [norm('Express.js')]: 'server',
  [norm('Django')]: 'server',
  [norm('Flask')]: 'server',
  [norm('Rails')]: 'server',
  [norm('Laravel')]: 'server',
  [norm('FastAPI')]: 'server',
  [norm('NestJS')]: 'server',
  [norm('ASP.NET')]: 'code',
  [norm('Spring')]: 'code',
  [norm('Webpack')]: 'layout',
  [norm('Vite')]: 'layout',
  [norm('npm')]: 'terminal',
  [norm('Yarn')]: 'terminal',
  [norm('HTML5')]: 'layout',
  [norm('CSS3')]: 'layout',
  [norm('SASS')]: 'layout',
  [norm('SCSS')]: 'layout',
  [norm('Less')]: 'layout',
  [norm('Styled Components')]: 'layout',
  // Databases & data
  [norm('NoSQL')]: 'database',
  [norm('DynamoDB')]: 'database',
  [norm('Elasticsearch')]: 'database',
  [norm('Cassandra')]: 'database',
  [norm('Oracle')]: 'database',
  [norm('SQLite')]: 'database',
  [norm('Data Analysis')]: 'chart',
  [norm('Data Science')]: 'chart',
  [norm('Statistics')]: 'chart',
  [norm('Pandas')]: 'chart',
  [norm('NumPy')]: 'chart',
  [norm('Scikit-learn')]: 'chart',
  [norm('PyTorch')]: 'chart',
  [norm('Keras')]: 'chart',
  [norm('NLP')]: 'chart',
  [norm('Natural Language Processing')]: 'chart',
  [norm('Computer Vision')]: 'chart',
  [norm('Deep Learning')]: 'chart',
  [norm('Big Data')]: 'database',
  [norm('ETL')]: 'database',
  // Cloud & DevOps
  [norm('Azure')]: 'cloud',
  [norm('GCP')]: 'cloud',
  [norm('Google Cloud')]: 'cloud',
  [norm('Terraform')]: 'cloud',
  [norm('Ansible')]: 'cloud',
  [norm('Jenkins')]: 'git',
  [norm('GitHub Actions')]: 'git',
  [norm('GitLab')]: 'git',
  [norm('Nginx')]: 'server',
  [norm('Linux/Unix')]: 'terminal',
  [norm('Bash')]: 'terminal',
  [norm('Shell Scripting')]: 'terminal',
  [norm('Networking')]: 'server',
  [norm('Security')]: 'server',
  // Mobile & desktop
  [norm('Flutter')]: 'layout',
  [norm('Xamarin')]: 'code',
  [norm('Electron')]: 'code',
  [norm('Unity')]: 'code',
  [norm('Game Development')]: 'code',
  // Design & product
  [norm('Adobe XD')]: 'layout',
  [norm('Sketch')]: 'layout',
  [norm('InVision')]: 'layout',
  [norm('Wireframing')]: 'layout',
  [norm('Prototyping')]: 'layout',
  [norm('User Research')]: 'chart',
  [norm('Product Management')]: 'chart',
  [norm('Project Management')]: 'chart',
  [norm('Jira')]: 'chart',
  [norm('Scrum')]: 'chart',
  [norm('Kanban')]: 'chart',
  // Soft skills & other
  [norm('Teamwork')]: 'chart',
  [norm('Time Management')]: 'chart',
  [norm('Critical Thinking')]: 'chart',
  [norm('Research')]: 'chart',
  [norm('Writing')]: 'chart',
  [norm('Presentation')]: 'chart',
  [norm('Mentoring')]: 'chart',
  [norm('Collaboration')]: 'chart',
  [norm('Analytical Skills')]: 'chart',
  [norm('Troubleshooting')]: 'terminal',
  [norm('Debugging')]: 'code',
  [norm('Testing')]: 'code',
  [norm('Unit Testing')]: 'code',
  [norm('Jest')]: 'code',
  [norm('Cypress')]: 'code',
  [norm('Selenium')]: 'code',
  [norm('REST API')]: 'server',
  [norm('Web Services')]: 'server',
  [norm('System Design')]: 'server',
  [norm('Object-Oriented Programming')]: 'code',
  [norm('OOP')]: 'code',
  [norm('Functional Programming')]: 'code',
  [norm('Design Patterns')]: 'code',
  [norm('Software Engineering')]: 'code',
  [norm('Full Stack')]: 'code',
  [norm('Frontend')]: 'layout',
  [norm('Backend')]: 'server',
  [norm('Blockchain')]: 'server',
  [norm('Web3')]: 'server',
  [norm('Solidity')]: 'code',
  [norm('GraphQL API')]: 'server',
  [norm('gRPC')]: 'server',
  [norm('Message Queues')]: 'server',
  [norm('RabbitMQ')]: 'server',
  [norm('Kafka')]: 'server'
}

// Inline SVG icons (no external dependency)
const IconCode = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)
const IconDatabase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)
const IconCloud = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)
const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const IconLayout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
)
const IconTerminal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)
const IconGit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </svg>
)
const IconServer = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
    <line x1="10" y1="6" x2="10.01" y2="6" />
    <line x1="10" y1="18" x2="10.01" y2="18" />
  </svg>
)

const ICON_COMPONENTS = {
  code: IconCode,
  database: IconDatabase,
  cloud: IconCloud,
  chart: IconChart,
  layout: IconLayout,
  terminal: IconTerminal,
  git: IconGit,
  server: IconServer
}

function getSkillIconKey(skillName) {
  const n = norm(skillName)
  return SKILL_ICON_MAP[n] || null
}

function hashColor(skillName) {
  const str = String(skillName || '')
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i)
  const hue = Math.abs(h % 360)
  return `hsl(${hue}, 45%, 45%)`
}

function SkillLogo({ skillName }) {
  const iconKey = getSkillIconKey(skillName)
  const IconComponent = iconKey ? ICON_COMPONENTS[iconKey] : null
  const letter = (skillName || '?').charAt(0).toUpperCase()

  if (IconComponent) {
    return (
      <span className="skill-visualizer-logo skill-visualizer-logo-icon" aria-hidden>
        <IconComponent />
      </span>
    )
  }

  const bg = hashColor(skillName)
  return (
    <span
      className="skill-visualizer-logo skill-visualizer-logo-fallback"
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {letter}
    </span>
  )
}

const SORT_OPTIONS = [
  { value: 'totalDesc', label: 'Total students (high first)' },
  { value: 'totalAsc', label: 'Total students (low first)' },
  { value: 'nameAsc', label: 'Skill name (A–Z)' },
  { value: 'nameDesc', label: 'Skill name (Z–A)' }
]

const ROWS_PER_PAGE = 20

const SkillVisualizer = () => {
  const [skillData, setSkillData] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ collegeId: '', batch: '' })
  const [sortBy, setSortBy] = useState('totalDesc')
  const [page, setPage] = useState(1)

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const fetchSkillData = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await recruitersAPI.getSkillDistribution(
        filters.collegeId || undefined,
        filters.batch || undefined
      )
      setSkillData(data.skillDistribution || [])
    } catch (err) {
      setError('Failed to load skill distribution')
      console.error('Skill data error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await miscAPI.getColleges()
        setColleges(response.colleges || [])
      } catch (err) {
        console.error('Failed to fetch colleges:', err)
      }
    }
    fetchColleges()
    fetchSkillData()
  }, [filters])

  const sortedData = [...skillData].sort((a, b) => {
    if (sortBy === 'totalDesc') return (b.total || 0) - (a.total || 0)
    if (sortBy === 'totalAsc') return (a.total || 0) - (b.total || 0)
    if (sortBy === 'nameAsc') return (a._id || '').localeCompare(b._id || '')
    if (sortBy === 'nameDesc') return (b._id || '').localeCompare(a._id || '')
    return 0
  })

  const totalSkills = sortedData.length
  const totalStudents = sortedData.reduce((s, i) => s + (i.total || 0), 0)
  const totalPages = Math.max(1, Math.ceil(totalSkills / ROWS_PER_PAGE))
  const startIdx = (page - 1) * ROWS_PER_PAGE
  const paginatedData = sortedData.slice(startIdx, startIdx + ROWS_PER_PAGE)

  const getDominantLevel = (skill) => {
    if (!skill.levels || !skill.levels.length) return 'All levels'
    const top = skill.levels.reduce((acc, l) => (l.count > (acc?.count || 0) ? l : acc), null)
    return top ? `Level – ${top.level}` : 'All levels'
  }

  return (
    <div className="skill-visualizer-page">
      <Container className="skill-visualizer-container">
        <div className="skill-visualizer-top">
          <nav className="skill-visualizer-breadcrumb" aria-label="Breadcrumb">
            <Link to="/recruiter">Dashboard</Link>
            <span className="skill-visualizer-breadcrumb-sep">/</span>
            <span>Skill analytics</span>
          </nav>
        </div>

        <div className="skill-visualizer-header">
          <h1 className="skill-visualizer-title">Skill Distribution Analytics</h1>
          <div className="skill-visualizer-actions">
            <CustomSelect
              value={filters.collegeId || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, collegeId: e.target.value }))}
              options={colleges.map((c) => ({ value: c._id, label: c.name }))}
              placeholder="All Colleges"
              className="skill-visualizer-custom-select"
            />
            <CustomSelect
              value={filters.batch || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, batch: e.target.value }))}
              options={[
                { value: '2024', label: '2024' },
                { value: '2025', label: '2025' },
                { value: '2026', label: '2026' }
              ]}
              placeholder="All Years"
              className="skill-visualizer-custom-select"
            />
            <Button onClick={fetchSkillData} className="skill-visualizer-btn-primary" disabled={loading}>
              {loading ? 'Loading…' : 'Apply filters'}
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger" className="skill-visualizer-alert">{error}</Alert>}

        {loading ? (
          <div className="skill-visualizer-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="skill-visualizer-summary">
              Total skills {totalSkills}
              {totalStudents > 0 && ` · ${totalStudents} students across skills`}
            </div>

            <div className="skill-visualizer-layout">
              <aside className="skill-visualizer-sidebar">
                <Card className="skill-visualizer-summary-box">
                  <Card.Body>
                    <h3 className="skill-visualizer-summary-box-title">Summary</h3>
                    <div className="skill-visualizer-summary-box-stats">
                      <div className="skill-visualizer-summary-box-count">{totalSkills}</div>
                      <p className="skill-visualizer-summary-box-label">Skills tracked</p>
                    </div>
                    {totalSkills > 0 && (
                      <>
                        <hr className="skill-visualizer-summary-box-hr" />
                        <h6 className="skill-visualizer-summary-box-top-title">Top skills</h6>
                        <ul className="skill-visualizer-summary-box-list">
                          {sortedData.slice(0, 5).map((skill, index) => (
                            <li key={`top-${skill._id}-${index}`} className="skill-visualizer-summary-box-item">
                              <span className="skill-visualizer-summary-box-skill-name">{skill._id}</span>
                              <span className="skill-visualizer-summary-box-badge">{skill.total}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </aside>
              <div className="skill-visualizer-main-content">
            <Card className="skill-visualizer-card">
              <Card.Body className="skill-visualizer-card-body">
                <div className="skill-visualizer-toolbar">
                  <h2 className="skill-visualizer-card-title">Skill List</h2>
                  <CustomSelect
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                    options={SORT_OPTIONS}
                    placeholder="Sort by"
                    className="skill-visualizer-custom-select skill-visualizer-sort-select"
                  />
                </div>

                {sortedData.length > 0 ? (
                  <>
                    <div className="skill-visualizer-table-scroll">
                      <table className="skill-visualizer-table">
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
                          {paginatedData.map((skill, index) => (
                            <tr key={`${skill._id}-${startIdx + index}`}>
                              <td>
                                <div className="skill-visualizer-skill-cell">
                                  <SkillLogo skillName={skill._id} />
                                  <div>
                                    <span className="skill-visualizer-skill-name">{skill._id}</span>
                                    <span className="skill-visualizer-skill-level">{getDominantLevel(skill)}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="skill-visualizer-badge">{skill.total}</span>
                              </td>
                              <td>{skill.levels?.find((l) => l.level === 'beginner')?.count ?? 0}</td>
                              <td>{skill.levels?.find((l) => l.level === 'intermediate')?.count ?? 0}</td>
                              <td>{skill.levels?.find((l) => l.level === 'advanced')?.count ?? 0}</td>
                              <td>{skill.levels?.find((l) => l.level === 'expert')?.count ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="skill-visualizer-pagination">
                      <span className="skill-visualizer-pagination-info">
                        Showing {startIdx + 1}–{Math.min(startIdx + ROWS_PER_PAGE, totalSkills)} of {totalSkills} skills
                      </span>
                      <div className="skill-visualizer-page-btns">
                        <button
                          type="button"
                          className="skill-visualizer-page-btn"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </button>
                        <div className="skill-visualizer-page-nums">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                            .map((p, i, arr) => (
                              <React.Fragment key={p}>
                                {i > 0 && arr[i - 1] !== p - 1 && <span className="skill-visualizer-page-ellipsis">…</span>}
                                <button
                                  type="button"
                                  className={`skill-visualizer-page-num ${p === page ? 'active' : ''}`}
                                  onClick={() => setPage(p)}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            ))}
                        </div>
                        <button
                          type="button"
                          className="skill-visualizer-page-btn"
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="skill-visualizer-empty">
                    <h5 className="text-muted">No skill data available</h5>
                    <p className="text-muted">Try adjusting your filters or check back later.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  )
}

export default SkillVisualizer
