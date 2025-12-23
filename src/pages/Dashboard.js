// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

function Dashboard() {
  const { user, signOut } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSavedRecipes()
    }
  }, [user])

  const fetchSavedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (error) throw error
      setSavedRecipes(data || [])
    } catch (error) {
      console.error('Error fetching saved recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1>Pantry Chef</h1>
          <div className="user-info">
            <span>Hello, {user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="container">
          <h2>My Saved Recipes</h2>
          
          {loading ? (
            <p>Loading your recipes...</p>
          ) : savedRecipes.length === 0 ? (
            <div className="empty-state">
              <p>You haven't saved any recipes yet.</p>
              <a href="/" className="btn-primary">
                Find Recipes
              </a>
            </div>
          ) : (
            <div className="recipes-grid">
              {savedRecipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <h3>{recipe.recipe_title}</h3>
                  <p>Saved on {new Date(recipe.saved_at).toLocaleDateString()}</p>
                  <button 
                    onClick={() => window.open(recipe.recipe_data.youtube, '_blank')}
                    className="btn-secondary"
                  >
                    Watch Recipe
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard