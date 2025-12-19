import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import './App.css';

// TheMealDB API (FREE - no key needed)
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [allIndianRecipes, setAllIndianRecipes] = useState([]);

  // Load Indian recipes on startup
  useEffect(() => {
    loadIndianRecipes();
  }, []);

  const loadIndianRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE}/filter.php?a=Indian`);
      const data = await response.json();
      if (data.meals) {
        setAllIndianRecipes(data.meals);
      }
    } catch (error) {
      console.error('Failed to load Indian recipes:', error);
    }
  };

  // Common Indian ingredients
  const commonIndianIngredients = [
    'chicken', 'potato', 'tomato', 'onion', 'garlic', 'ginger',
    'rice', 'lentils', 'spinach', 'cauliflower', 'paneer', 'yogurt',
    'egg', 'fish', 'shrimp', 'mushroom', 'cabbage', 'carrot',
    'pea', 'bean', 'chickpea', 'eggplant', 'capsicum'
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

  // Main function to find recipes from ingredients
  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecipe(null);
    setRecipeOptions([]);

    try {
      // Get detailed Indian recipes first
      const detailedRecipes = [];
      for (let i = 0; i < Math.min(10, allIndianRecipes.length); i++) {
        const meal = allIndianRecipes[i];
        const details = await fetchRecipeDetails(meal.idMeal);
        if (details) {
          detailedRecipes.push(details);
        }
      }

      // Filter recipes that use the given ingredients
      const matchingRecipes = detailedRecipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
        return ingredients.some(userIng => 
          recipeIngredients.some(recipeIng => 
            recipeIng.includes(userIng) || userIng.includes(recipeIng)
          )
        );
      });

      if (matchingRecipes.length > 0) {
        // Sort by most ingredient matches
        matchingRecipes.sort((a, b) => {
          const aMatches = countMatches(a, ingredients);
          const bMatches = countMatches(b, ingredients);
          return bMatches - aMatches;
        });

        setRecipe(matchingRecipes[0]);
        setRecipeOptions(matchingRecipes.slice(1, 4));
        
        // Calculate match percentage
        const matchPercent = Math.round((countMatches(matchingRecipes[0], ingredients) / ingredients.length) * 100);
        setError(`Found recipe with ${matchPercent}% ingredient match`);
      } else {
        // If no exact matches, show all Indian recipes
        setRecipe(detailedRecipes[0]);
        setRecipeOptions(detailedRecipes.slice(1, 4));
        setError('No exact matches. Showing popular Indian recipes instead.');
      }

    } catch (err) {
      setError('Failed to search recipes. Please try again.');
      const fallbackRecipe = generateIndianFallbackRecipe(ingredients);
      setRecipe(fallbackRecipe);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to count ingredient matches
  const countMatches = (recipe, userIngredients) => {
    const recipeIngs = recipe.ingredients.map(ing => ing.name.toLowerCase());
    return userIngredients.filter(userIng => 
      recipeIngs.some(recipeIng => recipeIng.includes(userIng) || userIng.includes(recipeIng))
    ).length;
  };

  // Fetch detailed recipe from TheMealDB
  const fetchRecipeDetails = async (mealId) => {
    try {
      const response = await fetch(`${API_BASE}/lookup.php?i=${mealId}`);
      const data = await response.json();
      
      if (data.meals && data.meals[0]) {
        const meal = data.meals[0];
        
        // Extract ingredients (TheMealDB has them as strIngredient1-20)
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredients.push({
              name: ingredient,
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
          readyInMinutes: 30, // Default estimate
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

  // Fallback recipe generator
  const generateIndianFallbackRecipe = (ingredients) => {
    const mainIngredient = ingredients[0] || 'vegetables';
    
    return {
      id: Date.now(),
      title: `Indian-Style ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)}`,
      category: 'Main Course',
      area: 'Indian',
      instructions: [
        `1. Prepare ${ingredients.join(' and ')}`,
        '2. Cook using basic Indian techniques',
        '3. Season with available spices',
        '4. Cook until tender and flavorful',
        '5. Serve hot'
      ],
      image: null,
      youtube: `https://www.youtube.com/results?search_query=indian+${ingredients.join('+')}+recipe`,
      ingredients: ingredients.map(ing => ({ name: ing, measure: '' })),
      readyInMinutes: 25,
      servings: 2,
      difficulty: 'easy',
      note: 'Generated recipe using your ingredients'
    };
  };

  const handleSelectRecipe = (selectedRecipe) => {
    setRecipe(selectedRecipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (recipe) {
      const newSaved = {
        ...recipe,
        id: Date.now(),
        savedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
      setSavedRecipes([...savedRecipes, newSaved]);
      alert('Recipe saved to your collection!');
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setCurrentIngredient('');
    setRecipe(null);
    setRecipeOptions([]);
    setError(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="Indian Recipe Finder" className="logo-img" />
          </div>
          <div className="header-content">
            <h1>Indian Recipe Finder</h1>
            <p className="tagline">Find recipes using your available ingredients</p>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="input-section">
          <form onSubmit={handleGenerate} className="ingredient-form">
            <div className="form-header">
              <h2>What Indian ingredients do you have?</h2>
              <p className="form-subtitle">Add 1-5 ingredients to find matching recipes</p>
            </div>
            
            <div className="ingredient-input-container">
              <input
                type="text"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter an ingredient..."
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
              <p className="quick-add-title">Common Indian ingredients:</p>
              <div className="quick-add-grid">
                {commonIndianIngredients.map((ing, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCommonClick(ing)}
                    className="quick-add-btn"
                    disabled={loading}
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
                    Find Indian Recipes
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
          <div className="info-message">
            <span className="info-icon">💡</span>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching Indian recipes database...</p>
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
                      {recipe.area || 'Indian'} Cuisine
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
                    <span className="meta-text">{recipe.readyInMinutes || 30} min</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span className="meta-text">{recipe.servings || 2} servings</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📊</span>
                    <span className={`difficulty ${recipe.difficulty}`}>
                      {recipe.difficulty || 'Easy'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span className="meta-text">{recipe.area || 'Indian'}</span>
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
                      <h4 className="group-title">Your Ingredients Used:</h4>
                      <div className="ingredients-tags">
                        {ingredients.filter(userIng => 
                          recipe.ingredients.some(recipeIng => 
                            recipeIng.name.toLowerCase().includes(userIng) || 
                            userIng.includes(recipeIng.name.toLowerCase())
                          )
                        ).map((ing, idx) => (
                          <span key={idx} className="ingredient-tag match">✓ {ing}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="ingredient-group">
                      <h4 className="group-title">All Recipe Ingredients:</h4>
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

                {/* YouTube Video Section */}
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
                          href={`https://www.youtube.com/results?search_query=indian+${recipe.title.replace(/\s+/g, '+')}+recipe`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="youtube-search-link"
                        >
                          🔍 Search YouTube for "{recipe.title}"
                        </a>
                      </p>
                    )}
                    {recipe.note && (
                      <p className="youtube-note"><small>{recipe.note}</small></p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {recipeOptions.length > 0 && (
              <div className="alternative-recipes">
                <h3>More Indian Recipe Ideas</h3>
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
                        <span className="alternative-indian">🇮🇳 Indian</span>
                      </div>
                      <p className="alternative-ingredients">
                        {option.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {savedRecipes.length > 0 && (
          <div className="saved-recipes-section">
            <h3>Saved Recipes ({savedRecipes.length})</h3>
            <div className="saved-grid">
              {savedRecipes.map(saved => (
                <div 
                  key={saved.id} 
                  className="saved-card"
                  onClick={() => handleSelectRecipe(saved)}
                >
                  <h4 className="saved-title">{saved.title}</h4>
                  <div className="saved-meta">
                    <span className="saved-time">{saved.readyInMinutes || 25} min</span>
                    <span className="saved-cuisine">Indian</span>
                  </div>
                  {saved.youtube && (
                    <div className="saved-youtube">📺 Video Available</div>
                  )}
                  <div className="saved-date">Saved {saved.savedAt}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="footer">
          <p>Indian Recipe Finder • Using TheMealDB API</p>
          <p className="footer-note">
            Free API • No key required • Limited to available Indian recipes in database
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;