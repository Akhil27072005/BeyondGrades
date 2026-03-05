import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Badge } from 'react-bootstrap'
import './CalendarEventDrawer.css'

const EVENT_TYPE_LABELS = {
  offer: 'Job offer',
  interview: 'Interview',
  deadline: 'Deadline',
  networking: 'Networking',
  campus: 'Campus event',
  block: 'Blocked time'
}

const OFFER_STAGE_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired'
}

const CalendarEventDrawer = ({
  event,
  onClose,
  onAcceptOffer,
  onDeclineOffer,
  onOpenJobDetail,
  onOpenJoinLink
}) => {
  if (!event) return null

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const deadlineRelative = (deadline) => {
    if (!deadline) return ''
    const now = Date.now()
    const t = new Date(deadline).getTime()
    const diff = t - now
    if (diff <= 0) return 'Expired'
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    if (days > 0) return `in ${days} day${days !== 1 ? 's' : ''}`
    return `in ${hours} hour${hours !== 1 ? 's' : ''}`
  }

  return (
    <>
      <div className="cal-drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="cal-drawer" role="dialog" aria-label="Event details">
        <div className="cal-drawer-header">
          <div>
            <h6 className="cal-drawer-label mb-1">Appointment details</h6>
            <h5 className="cal-drawer-title">{event.title}</h5>
          </div>
          <button
            type="button"
            className="cal-drawer-close btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
        <div className="cal-drawer-body">
          {/* Summary card – matches top card style in reference */ }
          <div className="cal-drawer-card mb-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="cal-drawer-summary-title">{event.company || 'Job event'}</div>
                <div className="cal-drawer-summary-sub text-muted small">
                  {EVENT_TYPE_LABELS[event.type] || event.type}
                </div>
              </div>
              <div className="text-end">
                <Badge bg="light" text="dark" className="cal-drawer-type-badge">
                  {EVENT_TYPE_LABELS[event.type] || event.type}
                </Badge>
              </div>
            </div>
            <div className="cal-drawer-summary-row">
              <span className="cal-drawer-summary-label">When</span>
              <span className="cal-drawer-summary-value">
                {formatDate(event.start)}
                {event.end &&
                  new Date(event.end).getTime() !== new Date(event.start).getTime() && (
                    <> – {formatDate(event.end)}</>
                  )}
              </span>
            </div>
            {event.location && (
              <div className="cal-drawer-summary-row">
                <span className="cal-drawer-summary-label">Location</span>
                <span className="cal-drawer-summary-value">{event.location}</span>
              </div>
            )}
          </div>

          {/* Offer details card */ }
          {event.type === 'offer' && (
            <div className="cal-drawer-card mb-3">
              <div className="cal-drawer-section-header">
                <span className="cal-drawer-section-title">Offer details</span>
                <Badge
                  className={`cal-drawer-offer-stage cal-drawer-offer-stage-${event.offerStage || 'pending'}`}
                >
                  {OFFER_STAGE_LABELS[event.offerStage] || 'Pending'}
                </Badge>
              </div>

              {event.offerDeadline && (
                <div className="cal-drawer-summary-row">
                  <span className="cal-drawer-summary-label">Deadline</span>
                  <span className="cal-drawer-summary-value">
                    {formatDate(event.offerDeadline)}
                    <span className="ms-2 text-muted small">
                      ({deadlineRelative(event.offerDeadline)})
                    </span>
                  </span>
                </div>
              )}

              {event.compensationSummary && (
                <div className="cal-drawer-summary-row">
                  <span className="cal-drawer-summary-label">Compensation</span>
                  <span className="cal-drawer-summary-value">{event.compensationSummary}</span>
                </div>
              )}

              {event.recruiterContact && (
                <div className="cal-drawer-summary-row">
                  <span className="cal-drawer-summary-label">Recruiter</span>
                  <span className="cal-drawer-summary-value">
                    <a href={`mailto:${event.recruiterContact}`}>{event.recruiterContact}</a>
                  </span>
                </div>
              )}

              {event.notes && (
                <div className="cal-drawer-notes mt-2">
                  <span className="cal-drawer-summary-label d-block mb-1">Notes</span>
                  <p className="mb-0 small text-muted">{event.notes}</p>
                </div>
              )}

              {event.offerStage === 'pending' && !event.deadlineExpired && (
                <div className="cal-drawer-actions mt-3 pt-2 border-top">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2 cal-drawer-btn-accept"
                    onClick={() => onAcceptOffer && onAcceptOffer(event.id)}
                  >
                    Accept offer
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDeclineOffer && onDeclineOffer(event.id)}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Interview details card */ }
          {event.type === 'interview' && (
            <div className="cal-drawer-card mb-3">
              <div className="cal-drawer-section-header mb-2">
                <span className="cal-drawer-section-title">Interview details</span>
              </div>
              {event.roundType && (
                <div className="cal-drawer-summary-row">
                  <span className="cal-drawer-summary-label">Round</span>
                  <span className="cal-drawer-summary-value">
                    {event.roundType}
                    {event.roundIndex != null && ` · Round ${event.roundIndex}`}
                    {event.durationMinutes && ` · ${event.durationMinutes} min`}
                  </span>
                </div>
              )}
              {event.joinLink && (
                <div className="cal-drawer-summary-row mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="cal-drawer-join-btn"
                    onClick={() => onOpenJoinLink && onOpenJoinLink(event.joinLink)}
                  >
                    <i className="bi bi-camera-video me-1" aria-hidden />
                    Join meeting
                  </Button>
                </div>
              )}
              {event.notes && (
                <div className="cal-drawer-notes mt-3">
                  <span className="cal-drawer-summary-label d-block mb-1">Notes</span>
                  <p className="mb-0 small text-muted">{event.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Generic notes card for other event types */ }
          {event.type !== 'offer' && event.type !== 'interview' && event.notes && (
            <div className="cal-drawer-card mb-3">
              <div className="cal-drawer-section-header mb-2">
                <span className="cal-drawer-section-title">Notes</span>
              </div>
              <p className="mb-0 small text-muted">{event.notes}</p>
            </div>
          )}

          {event.jobId && (
            <div className="cal-drawer-card">
              <div className="cal-drawer-linked-job d-flex justify-content-between align-items-center">
                <div>
                  <div className="cal-drawer-summary-label mb-1">Linked job</div>
                  <div className="cal-drawer-summary-value">
                    {event.company || 'Job'} ·{' '}
                    <span className="text-primary">View full job details</span>
                  </div>
                </div>
                <Button
                  as={Link}
                  to={`/student/jobs/${event.jobId}`}
                  variant="outline-primary"
                  size="sm"
                  onClick={onClose}
                >
                  <i className="bi bi-briefcase me-1" aria-hidden />
                  Open
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default CalendarEventDrawer
