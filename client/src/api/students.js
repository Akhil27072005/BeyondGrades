import apiClient from './client'

export const studentsAPI = {
  // Get current student profile
  getProfile: async () => {
    const response = await apiClient.get('/students/me')
    return response.data
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/students/me', profileData)
    return response.data
  },

  // Update skills
  updateSkills: async (skills) => {
    const response = await apiClient.post('/students/me/skills', { skills })
    return response.data
  },

  // Create project
  createProject: async (projectData) => {
    const response = await apiClient.post('/students/me/projects', projectData)
    return response.data
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await apiClient.put(`/students/me/projects/${projectId}`, projectData)
    return response.data
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await apiClient.delete(`/students/me/projects/${projectId}`)
    return response.data
  },

  // Get public profile
  getPublicProfile: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}`)
    return response.data
  },

  // Get recommended jobs
  getRecommendedJobs: async () => {
    const response = await apiClient.get('/students/me/recommended-jobs')
    return response.data
  },

  // Get detailed job info for students
  getJobDetail: async (jobId) => {
    const response = await apiClient.get(`/students/jobs/${jobId}`)
    return response.data
  },

  // Get calendar events (optional query: start, end as ISO strings)
  getCalendarEvents: async (params = {}) => {
    const response = await apiClient.get('/students/me/calendar', { params })
    return response.data
  },

  // Get calendar preferences (availability, blocked periods)
  getCalendarPreferences: async () => {
    const response = await apiClient.get('/students/me/calendar/preferences')
    return response.data
  },

  // Update calendar preferences
  updateCalendarPreferences: async (preferences) => {
    const response = await apiClient.put('/students/me/calendar/preferences', preferences)
    return response.data
  },

  // RSVP to event (or accept/decline offer)
  rsvpEvent: async (eventId, response) => {
    const apiResponse = await apiClient.post('/students/me/calendar/rsvp', {
      eventId,
      response
    })
    return apiResponse.data
  }
}
