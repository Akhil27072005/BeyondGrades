import apiClient from './client'

export const miscAPI = {
  // Get notifications
  getNotifications: async () => {
    const response = await apiClient.get('/notifications/me')
    return response.data
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`)
    return response.data
  },

  // Download file
  downloadFile: async (fileId) => {
    const response = await apiClient.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Get alumni directory
  getAlumni: async (collegeId, filter, search) => {
    const response = await apiClient.get('/alumni', {
      params: { collegeId, filter, search }
    })
    return response.data
  },

  // Get public jobs
  getJobs: async (domain, locationType, search) => {
    const response = await apiClient.get('/jobs', {
      params: { domain, locationType, search }
    })
    return response.data
  },

  // Get job details
  getJobDetails: async (jobId) => {
    const response = await apiClient.get(`/jobs/${jobId}`)
    return response.data
  },

  // Get colleges list
  getColleges: async () => {
    const response = await apiClient.get('/colleges')
    return response.data
  },

  // Get college skill distribution
  getCollegeSkillDistribution: async (collegeId, year) => {
    const response = await apiClient.get(`/colleges/${collegeId}/skill-distribution`, {
      params: { year }
    })
    return response.data
  }
}
