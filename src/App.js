import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import './App.css';

// TheMealDB API (FREE - no key needed)
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Mock Supabase for testing
const supabase = {
  auth: {
    getSession: async () => ({ 
      data: { session: localStorage.getItem('mock_user') ? { user: JSON.parse(localStorage.getItem('mock_user')) } : null } 
    }),
    signUp: async ({ email, password }) => {
      const user = { id: 'mock-' + Date.now(), email };
      localStorage.setItem('mock_user', JSON.stringify(user));
      return { error: null, data: { user } };
    },
    signInWithPassword: async ({ email, password }) => {
      const user = { id: 'mock-' + Date.now(), email };
      localStorage.setItem('mock_user', JSON.stringify(user));
      return { error: null, data: { user } };
    },
    signOut: async () => {
      localStorage.removeItem('mock_user');
      localStorage.removeItem('saved_recipes');
      return { error: null };
    },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: JSON.parse(localStorage.getItem('saved_recipes') || '[]'), error: null })
      })
    }),
    insert: (data) => {
      const saved = JSON.parse(localStorage.getItem('saved_recipes') || '[]');
      saved.push({ ...data[0], id: saved.length + 1 });
      localStorage.setItem('saved_recipes', JSON.stringify(saved));
      return Promise.resolve({ error: null });
    }
  })
};

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mock_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const signUp = async (email, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: 'user-' + Date.now(),
      email,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    
    return { error: null };
  };

  const signIn = async (email, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email || !password) {
      setLoading(false);
      return { error: { message: 'Please enter both email and password' } };
    }
    
    const mockUser = {
      id: 'user-' + Date.now(),
      email,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('mock_user');
    localStorage.removeItem('saved_recipes');
    setUser(null);
    return Promise.resolve();
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Landing Page Component (Before Login)
function LandingPage({ onLoginClick, onSignupClick }) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          <img 
            src={logo} 
            alt="Recipe Finder" 
            className="logo-img" 
          />
        </div>
        <h1>Recipe Finder</h1>
        <p className="landing-subtitle">Find recipes by ingredients you have</p>
      </header>

      <main className="landing-main">
        <div className="landing-cta">
          <h2>Get Started Now</h2>
          <p>Login to search recipes using TheMealDB API</p>
          
          <div className="cta-buttons">
            <button 
              onClick={onLoginClick}
              className="cta-btn primary"
            >
              Login
            </button>
            <button 
              onClick={onSignupClick}
              className="cta-btn secondary"
            >
              Sign Up
            </button>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>searching recipe</p>
      </footer>
    </div>
  );
}

// Login Component
function Login({ onLogin, onBack, onGoToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Login to Recipe Finder</h2>
          <p className="auth-subtitle">Access your saved recipes</p>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-links">
              <p>Don't have an account? <button type="button" className="link-btn" onClick={onGoToSignup}>Sign up</button></p>
            </div>

            <button 
              type="button" 
              className="back-btn"
              onClick={onBack}
            >
              ← Back to Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Signup Component
function Signup({ onSignup, onBack, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      setSuccess('Account created successfully!');
      setTimeout(() => {
        onSignup();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join Recipe Finder to save your recipes</p>
          
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="auth-links">
              <p>Already have an account? <button type="button" className="link-btn" onClick={onGoToLogin}>Log in</button></p>
            </div>

            <button 
              type="button" 
              className="back-btn"
              onClick={onBack}
            >
              ← Back to Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard/Recipe Finder Component (After Login)
function Dashboard({ onLogout }) {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Fetch saved recipes
  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      const data = JSON.parse(localStorage.getItem('saved_recipes') || '[]')
        .filter(recipe => recipe.user_id === user.id);
      
      setSavedRecipes(data || []);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    }
  };

  // Common ingredients
  const commonIngredients = [
    'chicken', 'beef', 'pork', 'fish', 'shrimp', 'egg',
    'potato', 'tomato', 'onion', 'garlic', 'ginger',
    'rice', 'pasta', 'bread', 'flour', 'cheese',
    'mushroom', 'carrot', 'broccoli', 'spinach', 'lettuce',
    'bell pepper', 'chili', 'lemon', 'lime', 'orange',
    'milk', 'cream', 'butter', 'oil', 'salt', 'pepper'
  ];

  const handleAddIngredient = () => {
    const trimmed = currentIngredient.trim().toLowerCase();
    if (trimmed && ingredients.length < 5 && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleCommonClick = (ingredient) => {
    if (ingredients.length < 5 && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  // Save recipe
  const handleSave = async () => {
    if (!recipe) return;
    
    try {
      const recipeToSave = {
        user_id: user.id,
        recipe_id: recipe.id || Date.now().toString(),
        title: recipe.title,
        image: recipe.image,
        youtube: recipe.youtube,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        readyInMinutes: recipe.readyInMinutes,
        difficulty: recipe.difficulty,
        created_at: new Date().toISOString()
      };

      const saved = JSON.parse(localStorage.getItem('saved_recipes') || '[]');
      saved.push({ ...recipeToSave, id: saved.length + 1 });
      localStorage.setItem('saved_recipes', JSON.stringify(saved));
      
      fetchSavedRecipes();
      setError('✅ Recipe saved to your collection!');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('❌ Failed to save recipe');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Search recipes by ingredient using TheMealDB API
  const searchRecipesByIngredient = async (ingredient) => {
    try {
      const response = await fetch(`${API_BASE}/filter.php?i=${ingredient}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error(`Error searching for ${ingredient}:`, error);
      return [];
    }
  };

  // Get detailed recipe
  const getRecipeDetails = async (mealId) => {
    try {
      const response = await fetch(`${API_BASE}/lookup.php?i=${mealId}`);
      const data = await response.json();
      
      if (data.meals && data.meals[0]) {
        const meal = data.meals[0];
        
        // Extract ingredients
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredients.push({
              name: ingredient.trim(),
              measure: measure || ''
            });
          }
        }
        
        return {
          id: meal.idMeal,
          title: meal.strMeal,
          category: meal.strCategory,
          area: meal.strArea,
          instructions: meal.strInstructions ? 
            meal.strInstructions.split('\r\n').filter(step => step.trim()) : 
            ['No detailed instructions available'],
          image: meal.strMealThumb,
          youtube: meal.strYoutube,
          ingredients: ingredients,
          readyInMinutes: 30,
          servings: 4,
          difficulty: ingredients.length > 10 ? 'medium' : 'easy'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  };

  // Main function to find recipes from ingredients
  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (ingredients.length === 0) {
      setError('❌ Please add at least one ingredient');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecipe(null);
    setRecipeOptions([]);

    try {
      // Search for recipes using EACH ingredient
      const allRecipes = [];
      const recipeMap = new Map(); // To avoid duplicates
      
      // Search for recipes for each ingredient
      for (const ingredient of ingredients) {
        const recipes = await searchRecipesByIngredient(ingredient);
        
        // Get details for each recipe
        for (const recipe of recipes) {
          if (!recipeMap.has(recipe.idMeal)) {
            const details = await getRecipeDetails(recipe.idMeal);
            if (details) {
              recipeMap.set(recipe.idMeal, details);
            }
          }
        }
      }
      
      // Convert map to array
      const recipeList = Array.from(recipeMap.values());
      
      if (recipeList.length > 0) {
        // Find recipes that contain ALL ingredients
        const recipesWithAllIngredients = recipeList.filter(recipe => {
          const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
          return ingredients.every(userIng => 
            recipeIngredients.some(recipeIng => 
              recipeIng.includes(userIng.toLowerCase()) || 
              userIng.toLowerCase().includes(recipeIng)
            )
          );
        });
        
        if (recipesWithAllIngredients.length > 0) {
          // Show recipes that contain ALL ingredients first
          setRecipe(recipesWithAllIngredients[0]);
          setRecipeOptions(recipesWithAllIngredients.slice(1, 4));
          setError(`✅ Found ${recipesWithAllIngredients.length} recipe(s) containing your ingredients`);
        } else {
          // If no recipes contain ALL ingredients, show recipes that contain ANY ingredient
          setRecipe(recipeList[0]);
          setRecipeOptions(recipeList.slice(1, 4));
          setError(`✅ Found ${recipeList.length} recipe(s) using some of your ingredients`);
        }
      } else {
        setError(`❌ No recipes found using: ${ingredients.join(', ')}`);
        setRecipe(null);
        setRecipeOptions([]);
      }

    } catch (err) {
      setError('❌ Failed to search recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipe = (selectedRecipe) => {
    setRecipe(selectedRecipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setIngredients([]);
    setCurrentIngredient('');
    setRecipe(null);
    setRecipeOptions([]);
    setError(null);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-top">
          <div className="user-info">
            <span className="user-email">Welcome, {user?.email}</span>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
        
        <div className="header-main">
          <div className="logo">
            <img 
              src={logo} 
              alt="Recipe Finder" 
              className="logo-img" 
            />
          </div>
          <div className="header-content">
            
            <p className="tagline">Find recipes using your ingredients</p>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="input-section">
          <form onSubmit={handleGenerate} className="ingredient-form">
            <div className="form-header">
              <h2>What ingredients do you have?</h2>
              <p className="form-subtitle">Add ingredients to find recipes that use them</p>
            </div>
            
            <div className="ingredient-input-container">
              <input
                type="text"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter an ingredient (e.g., chicken, tomato, onion)"
                className="ingredient-input"
                disabled={loading}
              />
            </div>

            <div className="ingredients-display">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-chip">
                  <span>{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="remove-chip"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {ingredients.length < 5 && (
              <button
                type="button"
                onClick={handleAddIngredient}
                className="add-btn"
                disabled={loading || !currentIngredient.trim()}
              >
                + Add Ingredient
              </button>
            )}

            <div className="quick-add-section">
              <p className="quick-add-title">Common ingredients:</p>
              <div className="quick-add-grid">
                {commonIngredients.map((ing, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCommonClick(ing)}
                    className="quick-add-btn"
                    disabled={loading || ingredients.includes(ing)}
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading || ingredients.length === 0}
              >
                {loading ? (
                  <>
                    <span className="btn-icon">⏳</span>
                    Searching Recipes...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔍</span>
                    Find Recipes
                  </>
                )}
              </button>
              {ingredients.length > 0 && (
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="clear-btn"
                  disabled={loading}
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="ingredient-counter">
              <span>{ingredients.length}</span>/5 ingredients added
            </div>
          </form>
        </div>

        {error && (
          <div className={`info-message ${error.includes('✅') ? 'success' : 'error'}`}>
            <span className="info-icon">{error.includes('✅') ? '✅' : '❌'}</span>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching .....</p>
            <p className="loading-note">Looking for recipes using: {ingredients.join(', ')}</p>
          </div>
        )}

        {recipe && !loading && (
          <>
            <div className="recipe-section">
              <div className="recipe-card">
                <div className="recipe-header">
                  <div className="recipe-title-section">
                    <h2>{recipe.title}</h2>
                    <div className="recipe-badge">
                      {recipe.category} • {recipe.area}
                    </div>
                  </div>
                  
                  {recipe.image && (
                    <div className="recipe-image">
                      <img 
                        src={recipe.image}
                        alt={recipe.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="recipe-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span className="meta-text">{recipe.readyInMinutes} min</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span className="meta-text">{recipe.servings} servings</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📊</span>
                    <span className={`difficulty ${recipe.difficulty}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span className="meta-text">{recipe.area}</span>
                  </div>
                </div>

                <div className="recipe-actions">
                  <button onClick={handleSave} className="save-btn">
                    💾 Save Recipe
                  </button>
                  <button onClick={handleReset} className="new-search-btn">
                    🔄 New Search
                  </button>
                </div>

                <div className="ingredients-section">
                  <h3>Ingredients</h3>
                  <div className="ingredients-grid">
                    <div className="ingredient-group">
                      <h4 className="group-title">Your Ingredients:</h4>
                      <div className="ingredients-tags">
                        {ingredients.map((ing, idx) => {
                          const isInRecipe = recipe.ingredients.some(recipeIng => 
                            recipeIng.name.toLowerCase().includes(ing) || 
                            ing.includes(recipeIng.name.toLowerCase())
                          );
                          return (
                            <span key={idx} className={`ingredient-tag ${isInRecipe ? 'match' : 'not-match'}`}>
                              {isInRecipe ? '✓' : '✗'} {ing}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="ingredient-group">
                      <h4 className="group-title">Recipe Ingredients:</h4>
                      <ul className="ingredient-list">
                        {recipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="ingredient-item">
                            <span className="ingredient-name">{ing.name}</span>
                            {ing.measure && (
                              <span className="ingredient-measure">{ing.measure}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="instructions-section">
                  <h3>Instructions</h3>
                  <div className="instructions-container">
                    {recipe.instructions.map((step, idx) => (
                      <div key={idx} className="instruction-step">
                        <div className="step-number">{idx + 1}</div>
                        <div className="step-content">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="youtube-section">
                  <h3>🎬 YouTube Cooking Tutorial</h3>
                  <div className="youtube-links">
                    {recipe.youtube ? (
                      <a 
                        href={recipe.youtube}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="youtube-link"
                      >
                        📺 Watch Video Tutorial
                      </a>
                    ) : (
                      <p className="no-video">
                        <a 
                          href={`https://www.youtube.com/results?search_query=${recipe.title.replace(/\s+/g, '+')}+recipe`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="youtube-search-link"
                        >
                          🔍 Search YouTube for "{recipe.title}"
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {recipeOptions.length > 0 && (
              <div className="alternative-recipes">
                <h3>More Recipes ({recipeOptions.length})</h3>
                <p className="alternative-subtitle">Found using your ingredients</p>
                <div className="alternatives-grid">
                  {recipeOptions.map((option, idx) => (
                    <div 
                      key={idx} 
                      className="alternative-card"
                      onClick={() => handleSelectRecipe(option)}
                    >
                      <h4 className="alternative-title">{option.title}</h4>
                      <div className="alternative-meta">
                        <span className="alternative-time">{option.readyInMinutes} min</span>
                        <span className="alternative-category">{option.category}</span>
                      </div>
                      <p className="alternative-ingredients">
                        Uses: {ingredients.filter(ing => 
                          option.ingredients.some(optIng => 
                            optIng.name.toLowerCase().includes(ing) || 
                            ing.includes(optIng.name.toLowerCase())
                          )
                        ).slice(0, 3).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !recipe && ingredients.length > 0 && error && error.includes('❌') && (
          <div className="no-results">
            <h3>No Recipes Found</h3>
            <p>No recipes found using: <strong>{ingredients.join(', ')}</strong></p>
            <div className="suggestions">
              <h4>Try:</h4>
              <ul>
                <li>Use common ingredients like chicken, rice, tomato</li>
                <li>Try single ingredients first, then add more</li>
                <li>Check spelling</li>
                <li>Try broader terms (e.g., "fish" instead of specific fish types)</li>
              </ul>
              <button onClick={handleReset} className="try-again-btn">
                Try Different Ingredients
              </button>
            </div>
          </div>
        )}

        {savedRecipes.length > 0 && (
          <div className="saved-recipes-section">
            <h3>Your Saved Recipes ({savedRecipes.length})</h3>
            <div className="saved-grid">
              {savedRecipes.map((saved, idx) => (
                <div 
                  key={idx} 
                  className="saved-card"
                  onClick={() => handleSelectRecipe(saved)}
                >
                  <h4 className="saved-title">{saved.title}</h4>
                  <div className="saved-meta">
                    <span className="saved-time">{saved.readyInMinutes || 30} min</span>
                    <span className="saved-category">{saved.category || 'Recipe'}</span>
                  </div>
                  {saved.youtube && (
                    <div className="saved-youtube">📺 Video Available</div>
                  )}
                  <div className="saved-date">
                    Saved {new Date(saved.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="dashboard-footer">
          <p>pantry chef</p>
          <p className="footer-note">
            Searches recipes by ingredient • Real-time results
          </p>
        </footer>
      </main>
    </div>
  );
}

// Main App Component
function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'signup', 'dashboard'

  const handleLogin = () => {
    setView('dashboard');
  };

  return (
    <AuthProvider>
      {view === 'landing' && (
        <LandingPage 
          onLoginClick={() => setView('login')}
          onSignupClick={() => setView('signup')}
        />
      )}
      {view === 'login' && (
        <Login 
          onLogin={handleLogin}
          onBack={() => setView('landing')}
          onGoToSignup={() => setView('signup')}
        />
      )}
      {view === 'signup' && (
        <Signup 
          onSignup={handleLogin}
          onBack={() => setView('landing')}
          onGoToLogin={() => setView('login')}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard onLogout={() => setView('landing')} />
      )}
    </AuthProvider>
  );
}

export default App;