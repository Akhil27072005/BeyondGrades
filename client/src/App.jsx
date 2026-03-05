import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/StudentProfile'
import StudentProjects from './pages/student/StudentProjects'
import StudentCalendar from './pages/student/StudentCalendar'
import RecommendedJobs from './pages/student/RecommendedJobs'
import StudentJobDetail from './pages/student/StudentJobDetail'
import AlumniDirectory from './pages/student/AlumniDirectory'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import CompanyRegistration from './pages/recruiter/CompanyRegistration'
import CreateJob from './pages/recruiter/CreateJob'
import JobDetail from './pages/recruiter/JobDetail'
import SkillVisualizer from './pages/recruiter/SkillVisualizer'
import ProtectedRoute from './components/ProtectedRoute'
import StudentLayout from './components/StudentLayout'

// Component to redirect authenticated users away from auth pages
const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
  
  if (user) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />
    } else if (user.role === 'recruiter') {
      return <Navigate to="/recruiter/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }
  
  return children
}

// Component to handle root path redirects
const RootRedirect = () => {
  const { user, loading } = useAuth()
  
  console.log('RootRedirect - user:', user, 'loading:', loading)
  
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
  
  if (user) {
    console.log('RootRedirect - user role:', user.role)
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />
    } else if (user.role === 'recruiter') {
      return <Navigate to="/recruiter/dashboard" replace />
    }
  }
  
  return <LandingPage />
}

function AppContent() {
  const location = useLocation()
  const hideGlobalNav = ['/', '/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/student')

  return (
    <div className="App">
      {!hideGlobalNav && <Navbar />}
      <Routes>
            {/* Public routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />
            <Route path="/register" element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            } />
            
            {/* Student routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <StudentDashboard />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <StudentProfile />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/projects" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <StudentProjects />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/calendar" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <StudentCalendar />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/jobs" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <RecommendedJobs />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/jobs/:id" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <StudentJobDetail />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/alumni" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <AlumniDirectory />
                </StudentLayout>
              </ProtectedRoute>
            } />
            
            {/* Recruiter routes */}
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute role="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/company" element={
              <ProtectedRoute role="recruiter">
                <CompanyRegistration />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/create" element={
              <ProtectedRoute role="recruiter">
                <CreateJob />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/:id" element={
              <ProtectedRoute role="recruiter">
                <JobDetail />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/skills" element={
              <ProtectedRoute role="recruiter">
                <SkillVisualizer />
              </ProtectedRoute>
            } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
