import apiClient from './client'

export const authAPI = {
  // Student signup
  signupStudent: async (userData) => {
    const response = await apiClient.post('/auth/signup', {
      ...userData,
      role: 'student'
    })
    return response.data
  },

  // Recruiter signup
  signupRecruiter: async (userData) => {
    const response = await apiClient.post('/auth/recruiter-signup', {
      ...userData,
      role: 'recruiter'
    })
    return response.data
  },

  // Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  // Verify college email
  verifyCollegeEmail: async () => {
    const response = await apiClient.post('/auth/verify-college-email')
    return response.data
  }
}
