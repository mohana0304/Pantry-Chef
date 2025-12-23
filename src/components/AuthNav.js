import React from 'react'
import { useAuth } from '../context/AuthContext'

function AuthNav() {
  const { user, signOut } = useAuth()

  return (
    <nav className="auth-nav">
      <div className="nav-content">
        <div className="nav-links">
          {user ? (
            <>
              <span className="user-email">Welcome, {user.email}</span>
              <button 
                onClick={() => window.location.href = '/dashboard'} 
                className="nav-btn"
              >
                My Recipes
              </button>
              <button 
                onClick={signOut} 
                className="nav-btn logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => window.location.href = '/login'} 
                className="nav-btn"
              >
                Login
              </button>
              <button 
                onClick={() => window.location.href = '/signup'} 
                className="nav-btn signup"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default AuthNav