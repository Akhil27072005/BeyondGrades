import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Alert, Badge, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { studentsAPI } from '../../api/students'
import CalendarEventDrawer from '../../components/CalendarEventDrawer'
import './StudentCalendar.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_COLORS = {
  offer: 'sc-event-offer',
  offerDeadline: 'sc-event-offer-deadline',
  offerExpired: 'sc-event-offer-expired',
  interview: 'sc-event-interview',
  deadline: 'sc-event-deadline',
  networking: 'sc-event-networking',
  campus: 'sc-event-campus',
  block: 'sc-event-block'
}

function getMonthStartEnd(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const start = new Date(y, m, 1)
  const end = new Date(y, m + 1, 0, 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

function getWeeksForMonth(monthDate, events) {
  const y = monthDate.getFullYear()
  const m = monthDate.getMonth()
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  const startDay = first.getDay()
  const daysInMonth = last.getDate()

  const days = []
  for (let i = 0; i < startDay; i++) {
    days.push({ date: null, isCurrentMonth: false, events: [] })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d)
    const dateStr = date.toDateString()
    const dayEvents = events.filter((e) => {
      const start = new Date(e.start)
      return start.toDateString() === dateStr
    })
    days.push({ date, isCurrentMonth: true, events: dayEvents })
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

function getEventPillClass(event) {
  if (event.type === 'offer') {
    if (event.deadlineExpired) return EVENT_COLORS.offerExpired
    if (event.deadlineApproaching) return EVENT_COLORS.offerDeadline
    return EVENT_COLORS.offer
  }
  return EVENT_COLORS[event.type] || 'sc-event-default'
}

const StudentCalendar = () => {
  const [events, setEvents] = useState([])
  const [preferences, setPreferences] = useState({
    preferredDays: [],
    preferredTimeRanges: [],
    blockedPeriods: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const { start, end } = useMemo(() => getMonthStartEnd(currentMonth), [currentMonth])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [eventsRes, prefsRes] = await Promise.all([
          studentsAPI.getCalendarEvents({ start, end }),
          studentsAPI.getCalendarPreferences()
        ])
        setEvents(eventsRes.events || [])
        setPreferences({
          preferredDays: prefsRes.preferredDays || [],
          preferredTimeRanges: prefsRes.preferredTimeRanges || [],
          blockedPeriods: prefsRes.blockedPeriods || []
        })
      } catch (err) {
        setError('Failed to load calendar')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [start, end])

  const weeks = useMemo(() => getWeeksForMonth(currentMonth, events), [currentMonth, events])

  const handlePrevMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  }
  const handleNextMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))
  }
  const handleToday = () => {
    setCurrentMonth(new Date())
  }

  const handleAcceptOffer = async (eventId) => {
    try {
      await studentsAPI.rsvpEvent(eventId, 'accepted')
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, offerStage: 'accepted' } : e))
      )
      setSelectedEvent((e) => (e && e.id === eventId ? { ...e, offerStage: 'accepted' } : e))
    } catch (err) {
      console.error(err)
    }
  }
  const handleDeclineOffer = async (eventId) => {
    try {
      await studentsAPI.rsvpEvent(eventId, 'declined')
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, offerStage: 'declined' } : e))
      )
      setSelectedEvent((e) => (e && e.id === eventId ? { ...e, offerStage: 'declined' } : e))
    } catch (err) {
      console.error(err)
    }
  }
  const handleOpenJoinLink = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <Container className="py-4 student-calendar-page">
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
      <Container className="py-4 student-calendar-page">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <div className="student-calendar-page">
      <Container className="py-4">
        <Row className="mb-3">
          <Col>
            <h2 className="sc-page-title mb-1">My Calendar</h2>
            <p className="sc-page-subtitle text-muted mb-0">
              Interviews, offers, and deadlines
            </p>
          </Col>
        </Row>

        {events.length > 0 && (
          <div className="sc-legend mb-3">
            <span className="sc-legend-label">Types:</span>
            <span className={`sc-legend-pill ${EVENT_COLORS.offer}`}>Offer</span>
            <span className={`sc-legend-pill ${EVENT_COLORS.offerDeadline}`}>Deadline soon</span>
            <span className={`sc-legend-pill ${EVENT_COLORS.interview}`}>Interview</span>
            <span className={`sc-legend-pill ${EVENT_COLORS.deadline}`}>Deadline</span>
            <span className={`sc-legend-pill ${EVENT_COLORS.campus}`}>Campus</span>
            <span className={`sc-legend-pill ${EVENT_COLORS.block}`}>Blocked</span>
          </div>
        )}

        {events.length > 0 ? (
          <Row>
            <Col lg={8}>
              <Card className="sc-calendar-card">
                <Card.Body className="p-2 p-md-3">
                  <div className="sc-calendar-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Button variant="outline-secondary" size="sm" onClick={handlePrevMonth}>
                        <i className="bi bi-chevron-left" aria-hidden />
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={handleNextMonth}>
                        <i className="bi bi-chevron-right" aria-hidden />
                      </Button>
                      <Button variant="outline-primary" size="sm" onClick={handleToday}>
                        Today
                      </Button>
                    </div>
                    <h5 className="sc-calendar-month-title mb-0">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h5>
                  </div>

                  <div className="sc-calendar-grid">
                    {WEEKDAYS.map((day) => (
                      <div key={day} className="sc-calendar-cell sc-calendar-weekday">
                        {day}
                      </div>
                    ))}
                    {weeks.flat().map((cell, idx) => (
                      <div
                        key={idx}
                        className={`sc-calendar-cell sc-calendar-day ${!cell.isCurrentMonth ? 'sc-calendar-day-other' : ''}`}
                      >
                        {cell.date && (
                          <>
                            <span className="sc-calendar-day-num">{cell.date.getDate()}</span>
                            <div className="sc-calendar-day-events">
                              {cell.events.slice(0, 3).map((ev) => (
                                <button
                                  key={ev.id}
                                  type="button"
                                  className={`sc-event-pill ${getEventPillClass(ev)}`}
                                  onClick={() => setSelectedEvent(ev)}
                                  title={ev.title}
                                >
                                  {ev.title.length > 18 ? `${ev.title.slice(0, 17)}…` : ev.title}
                                </button>
                              ))}
                              {cell.events.length > 3 && (
                                <span className="sc-more-events">+{cell.events.length - 3}</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="sc-preferences-card">
                <Card.Header className="sc-preferences-header">
                  <h6 className="mb-0">Availability & blocks</h6>
                </Card.Header>
                <Card.Body>
                  <p className="small text-muted mb-2">
                    Preferred interview days (saved on your profile):
                  </p>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                      <Form.Check
                        key={d}
                        type="checkbox"
                        id={`pref-day-${d}`}
                        label={WEEKDAYS[d].slice(0, 2)}
                        checked={preferences.preferredDays.includes(d)}
                        onChange={async (e) => {
                          const next = e.target.checked
                            ? [...preferences.preferredDays, d].sort((a, b) => a - b)
                            : preferences.preferredDays.filter((x) => x !== d)
                          setPreferences((p) => ({ ...p, preferredDays: next }))
                          try {
                            await studentsAPI.updateCalendarPreferences({
                              ...preferences,
                              preferredDays: next
                            })
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                        className="sc-pref-day-check"
                      />
                    ))}
                  </div>
                  <p className="small text-muted mb-0">
                    Blocked periods are shown as events on the calendar. Add them via your profile or future tools.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Card className="sc-empty-card text-center py-5">
            <Card.Body>
              <div className="sc-empty-icon mb-3" aria-hidden>
                <i className="bi bi-calendar3" />
              </div>
              <h5 className="sc-empty-title mb-2">Your calendar is clear for now</h5>
              <p className="text-muted mb-4 sc-empty-desc">
                Events will appear here when you have interviews, offers, or deadlines. Apply to jobs and connect with alumni to get started.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button as={Link} to="/student/jobs" variant="primary" className="sc-empty-cta">
                  Apply to jobs
                </Button>
                <Button as={Link} to="/student/alumni" variant="outline-primary" className="sc-empty-cta">
                  Connect with alumni
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>

      {selectedEvent && (
        <CalendarEventDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAcceptOffer={handleAcceptOffer}
          onDeclineOffer={handleDeclineOffer}
          onOpenJoinLink={handleOpenJoinLink}
        />
      )}
    </div>
  )
}

export default StudentCalendar
