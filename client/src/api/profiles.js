import apiClient from './client'

export const profilesAPI = {
  search: async (query) => {
    const response = await apiClient.get('/search', { params: { q: query } })
    return response.data
  },

  getRecruiterPublic: async (id) => {
    const response = await apiClient.get(`/recruiters/public/${id}`)
    return response.data
  },

  getCompanyPublic: async (id) => {
    const response = await apiClient.get(`/companies/${id}`)
    return response.data
  }
}
