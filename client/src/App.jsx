import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import RecruiterSignupFlow from './pages/recruiter/RecruiterSignupFlow'
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
import RecruiterJobsList from './pages/recruiter/RecruiterJobsList'
import RecruiterProfile from './pages/recruiter/RecruiterProfile'
import SkillVisualizer from './pages/recruiter/SkillVisualizer'
import ProfileSearch from './pages/ProfileSearch'
import ViewStudentProfile from './pages/ViewStudentProfile'
import ViewRecruiterProfile from './pages/ViewRecruiterProfile'
import ViewCompanyProfile from './pages/ViewCompanyProfile'
import ProtectedRoute from './components/ProtectedRoute'
import StudentLayout from './components/StudentLayout'
import RecruiterLayout from './components/RecruiterLayout'

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
  const hideGlobalNav = ['/', '/login', '/register', '/register/recruiter'].includes(location.pathname) || location.pathname.startsWith('/student') || location.pathname.startsWith('/recruiter')

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
            <Route path="/register/recruiter" element={
              <AuthRedirect>
                <RecruiterSignupFlow />
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
            <Route path="/student/search" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <ProfileSearch />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/view/recruiter/:id" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <ViewRecruiterProfile />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/view/company/:id" element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <ViewCompanyProfile />
                </StudentLayout>
              </ProtectedRoute>
            } />

            {/* Recruiter routes – common header via RecruiterLayout */}
            <Route path="/recruiter" element={
              <ProtectedRoute role="recruiter">
                <RecruiterLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="profile" element={<RecruiterProfile />} />
              <Route path="company" element={<CompanyRegistration />} />
              <Route path="view/student/:id" element={<ViewStudentProfile />} />
              <Route path="jobs/create" element={<CreateJob />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="jobs" element={<RecruiterJobsList />} />
              <Route path="skills" element={<SkillVisualizer />} />
            </Route>
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
