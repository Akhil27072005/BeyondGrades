import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <BootstrapNavbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          Beyond Grades
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
              </>
            )}
            
            {user?.role === 'student' && (
              <>
                <Nav.Link as={Link} to="/student/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/student/profile">Profile</Nav.Link>
                <Nav.Link as={Link} to="/student/projects">Projects</Nav.Link>
                <Nav.Link as={Link} to="/student/jobs">Jobs</Nav.Link>
                <Nav.Link as={Link} to="/student/alumni">Alumni</Nav.Link>
              </>
            )}
            
            {user?.role === 'recruiter' && (
              <>
                <Nav.Link as={Link} to="/recruiter/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/recruiter/jobs/create">Create Job</Nav.Link>
                <Nav.Link as={Link} to="/recruiter/skills">Skills</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            ) : (
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {user?.name || 'User'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={
                    user?.role === 'student' ? '/student/profile' : '/recruiter/company'
                  }>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
