import React from 'react'
import { Outlet } from 'react-router-dom'
import RecruiterHeader from './RecruiterHeader'
import './RecruiterLayout.css'

const RecruiterLayout = () => {
  return (
    <div className="recruiter-layout">
      <RecruiterHeader />
      <main className="recruiter-layout-main">
        <Outlet />
      </main>
    </div>
  )
}

export default RecruiterLayout
