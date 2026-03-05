const axios = require('axios');

class MatcherClient {
  constructor() {
    this.baseURL = process.env.PYTHON_MATCHER_URL || 'http://localhost:8000';
  }

  async getJobMatches(jobId, topN = 10, allowHired = false) {
    try {
      const response = await axios.post(`${this.baseURL}/match/job/${jobId}`, {
        topN,
        allowHired
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error calling matcher service:', error.message);
      
      // Fallback to direct database query if matcher service is down
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.log('Matcher service unavailable, using fallback logic');
        return await this.fallbackMatching(jobId, topN, allowHired);
      }
      
      throw new Error(`Matcher service error: ${error.message}`);
    }
  }

  async getCandidateCount(jobId, allowHired = false) {
    try {
      const response = await axios.get(`${this.baseURL}/match/job/${jobId}/count?allowHired=${allowHired}`, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Error getting candidate count:', error.message);
      return { count: 0 };
    }
  }

  async fallbackMatching(jobId, topN, allowHired) {
    // This would implement basic matching logic if the Python service is down
    // For now, return empty results
    console.log('Using fallback matching logic');
    return {
      results: [],
      totalCandidates: 0,
      message: 'Matcher service unavailable, using fallback'
    };
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('Matcher service health check failed:', error.message);
      return false;
    }
  }
}

module.exports = new MatcherClient();
