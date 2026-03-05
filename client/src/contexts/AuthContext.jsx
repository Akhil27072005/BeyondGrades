import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext - initAuth called, token:', token)
      if (token) {
        try {
          const response = await authAPI.getCurrentUser()
          console.log('AuthContext - getCurrentUser response:', response)
          // Ensure user object has role property
          const userWithRole = {
            ...response.user,
            role: response.role
          }
          console.log('AuthContext - userWithRole:', userWithRole)
          setUser(userWithRole)
        } catch (error) {
          console.error('Auth initialization failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [token])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token: newToken, user: userData } = response
      
      // Ensure user object has role property
      const userWithRole = {
        ...userData,
        role: userData.role
      }
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      setToken(newToken)
      setUser(userWithRole)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const signupStudent = async (userData) => {
    try {
      const response = await authAPI.signupStudent(userData)
      const { token: newToken, user: userData } = response
      
      // Ensure user object has role property
      const userWithRole = {
        ...userData,
        role: userData.role
      }
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      setToken(newToken)
      setUser(userWithRole)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const signupRecruiter = async (userData) => {
    try {
      const response = await authAPI.signupRecruiter(userData)
      const { token: newToken, user: userData } = response
      
      // Ensure user object has role property
      const userWithRole = {
        ...userData,
        role: userData.role
      }
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      setToken(newToken)
      setUser(userWithRole)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const verifyCollegeEmail = async () => {
    try {
      const response = await authAPI.verifyCollegeEmail()
      return response
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    signupStudent,
    signupRecruiter,
    logout,
    verifyCollegeEmail,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isRecruiter: user?.role === 'recruiter',
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
