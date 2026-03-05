import apiClient from './client'

export const recruitersAPI = {
  // Get current recruiter profile
  getProfile: async () => {
    const response = await apiClient.get('/recruiters/me')
    return response.data
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/recruiters/me', profileData)
    return response.data
  },

  // Register company
  registerCompany: async (companyData) => {
    const response = await apiClient.post('/recruiters/register-company', companyData)
    return response.data
  },

  // Get recruiter's jobs
  getJobs: async () => {
    const response = await apiClient.get('/recruiters/me/jobs')
    return response.data
  },

  // Create job
  createJob: async (jobData) => {
    const response = await apiClient.post('/recruiters/me/jobs', jobData)
    return response.data
  },

  // Update job
  updateJob: async (jobId, jobData) => {
    const response = await apiClient.put(`/recruiters/me/jobs/${jobId}`, jobData)
    return response.data
  },

  // Get job shortlist
  getJobShortlist: async (jobId, topN = 10, allowHired = false) => {
    const response = await apiClient.get(`/recruiters/me/jobs/${jobId}/shortlist`, {
      params: { topN, allowHired }
    })
    return response.data
  },

  // Mark student as hired
  markHired: async (jobId, studentId) => {
    const response = await apiClient.post(`/recruiters/me/jobs/${jobId}/mark-hired`, {
      studentId
    })
    return response.data
  },

  // Invite students to interview
  inviteStudents: async (jobId, studentIds, interviewDetails) => {
    const response = await apiClient.post(`/recruiters/me/jobs/${jobId}/invite`, {
      studentIds,
      interviewDetails
    })
    return response.data
  },

  // Get skill distribution
  getSkillDistribution: async (collegeId, batch) => {
    const response = await apiClient.get('/recruiters/me/skill-distribution', {
      params: { collegeId, batch }
    })
    return response.data
  },

  // Get single job by ID
  getJob: async (jobId) => {
    const response = await apiClient.get(`/recruiters/me/jobs/${jobId}`)
    return response.data
  },

  // Export shortlist to CSV
  exportShortlist: async (jobId) => {
    const response = await apiClient.get(`/recruiters/me/export-shortlist/${jobId}`, {
      responseType: 'blob'
    })
    return response.data
  }
}
