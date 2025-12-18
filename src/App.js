import React, { useState, useEffect } from 'react';
import { spoonacularService } from './services/spoonacularService';
import logo from './assets/logo.png'; // Import your logo
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState(['', '', '']);
  const [recipe, setRecipe] = useState(null);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    const isAvailable = await spoonacularService.testConnection();
    setApiAvailable(isAvailable);
  };

  const commonIngredients = [
    'chicken', 'eggs', 'pasta', 'rice', 'tomatoes', 
    'onions', 'garlic', 'potatoes', 'cheese', 'bread',
    'carrots', 'bell peppers', 'mushrooms', 'spinach',
    'beef', 'pork', 'tofu', 'shrimp', 'fish', 'broccoli'
  ];

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value.toLowerCase().trim();
    setIngredients(newIngredients);
  };

  const handleAddField = () => {
    if (ingredients.length < 5) {
      setIngredients([...ingredients, '']);
    }
  };

  const handleRemoveField = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const handleCommonClick = (ingredient) => {
    const emptyIndex = ingredients.findIndex(ing => ing === '');
    if (emptyIndex !== -1) {
      handleIngredientChange(emptyIndex, ingredient);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const filtered = ingredients.filter(ing => ing.trim() !== '');
    
    if (filtered.length < 1 || filtered.length > 5) {
      setError('Please enter 1-5 ingredients');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecipe(null);
    setRecipeOptions([]);

    try {
      if (apiAvailable) {
        const recipes = await spoonacularService.getRecipesFromIngredients(filtered);
        
        if (recipes.length > 0) {
          setRecipe(recipes[0]);
          setRecipeOptions(recipes.slice(1));
        } else {
          setError('No recipes found. Try different ingredients.');
        }
      } else {
        throw new Error('API unavailable - using fallback recipes');
      }
      
    } catch (err) {
      setError(err.message);
      
      // Generate smart fallback
      const fallbackRecipe = generateSmartFallbackRecipe(filtered);
      setRecipe(fallbackRecipe);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartFallbackRecipe = (ingredients) => {
    const hasEggs = ingredients.includes('eggs');
    const hasRice = ingredients.includes('rice');
    const hasOnions = ingredients.includes('onions');
    
    if (hasEggs && hasRice && hasOnions) {
      return {
        title: 'Perfect Egg Fried Rice',
        readyInMinutes: 20,
        difficulty: 'easy',
        servings: 2,
        yourIngredients: ingredients,
        pantryIngredients: ['Oil', 'Salt', 'Pepper', 'Soy sauce', 'Green onions'],
        instructions: [
          'Cook rice ahead of time and chill completely (day-old rice is ideal)',
          'Beat 2-3 eggs with a pinch of salt in a small bowl',
          'Finely chop onions and any other vegetables you have',
          'Heat 2 tablespoons oil in a wok or large skillet over medium-high heat',
          'Add onions and sauté until soft and translucent (2-3 minutes)',
          'Push onions to one side, add beaten eggs and scramble until just set',
          'Add chilled rice, breaking up any clumps with a spatula',
          'Stir-fry for 4-5 minutes until rice is hot and grains are separated',
          'Season with soy sauce, salt, and white pepper to taste',
          'Garnish with sliced green onions and serve immediately'
        ],
        tips: 'For authentic texture, use rice that has been refrigerated overnight. This helps prevent mushiness.'
      };
    }
    
    // Other smart combinations can be added here
    return {
      title: `Simple ${ingredients[0]} Dish`,
      readyInMinutes: 25,
      difficulty: 'easy',
      servings: 2,
      yourIngredients: ingredients,
      pantryIngredients: ['Olive oil', 'Salt', 'Black pepper', 'Garlic', 'Fresh herbs'],
      instructions: [
        'Wash and prepare all ingredients as needed',
        'Heat oil in a pan over medium heat until shimmering',
        'Add aromatics and sauté until fragrant (1-2 minutes)',
        'Add main ingredients and cook until tender',
        'Season with salt, pepper, and herbs to taste',
        'Adjust heat as needed to prevent burning',
        'Cook until all flavors are well combined',
        'Let rest for 2 minutes before serving',
        'Garnish with fresh herbs if available'
      ],
      tips: 'Season in layers - add a little salt at each cooking stage for best flavor distribution.'
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
    setIngredients(['', '', '']);
    setRecipe(null);
    setRecipeOptions([]);
    setError(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <div className="logo">
            <img src={logo} alt="Pantry Chef AI Logo" className="logo-img" />
          </div>
          <div className="header-content">
            <h1>Pantry Chef AI</h1>
            <p className="tagline">Create delicious meals from what you have</p>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="input-section">
          <form onSubmit={handleGenerate} className="ingredient-form">
            <h2>What's in your kitchen?</h2>
            <p className="form-subtitle">Enter ingredients you want to use (1-5 items)</p>
            
            <div className="ingredient-fields">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="field-group">
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      className="ingredient-input"
                      disabled={loading}
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="remove-btn"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {ingredients.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddField}
                  className="add-btn"
                  disabled={loading}
                >
                  + Add more ingredients
                </button>
              )}
            </div>

            <div className="common-ingredients">
              <p className="common-title">Quick add ingredients:</p>
              <div className="common-grid">
                {commonIngredients.map((ing, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCommonClick(ing)}
                    className="common-btn"
                    disabled={loading}
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-buttons">
              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-icon">⏳</span>
                    Searching Recipes...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🧠</span>
                    Generate Recipe
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={handleReset}
                className="clear-btn"
                disabled={loading}
              >
                Clear All
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Finding perfect recipes for you...</p>
          </div>
        )}

        {recipe && !loading && (
          <>
            <div className="recipe-section">
              <div className="recipe-actions">
                <button onClick={handleSave} className="save-btn">
                  💾 Save Recipe
                </button>
                <button onClick={handleReset} className="new-btn">
                  🔄 New Search
                </button>
              </div>

              <div className="recipe-card">
                <div className="recipe-header">
                  <h2>{recipe.title}</h2>
                  <span className="ai-badge">
                    {apiAvailable ? 'AI Generated' : 'Smart Recipe'}
                  </span>
                </div>
                
                {recipe.image && (
                  <div className="recipe-image">
                    <img 
                      src={`https://spoonacular.com/recipeImages/${recipe.image}`}
                      alt={recipe.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="recipe-meta">
                  <span className="time">⏱️ {recipe.readyInMinutes || 25} mins</span>
                  <span className={`difficulty ${recipe.difficulty}`}>
                    {recipe.difficulty}
                  </span>
                  <span className="servings">👥 Serves {recipe.servings || 2}</span>
                </div>

                {recipe.summary && (
                  <div className="recipe-summary">
                    <p>{recipe.summary}</p>
                  </div>
                )}

                <div className="ingredients-section">
                  <h3>📝 Ingredients</h3>
                  <div className="ingredient-lists">
                    <div className="list">
                      <h4 className="list-title-have">✅ You Have</h4>
                      <ul>
                        {(recipe.ingredients?.used || recipe.yourIngredients || []).map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="list">
                      <h4 className="list-title-need">🛒 You'll Need</h4>
                      <ul>
                        {(recipe.ingredients?.missed || recipe.pantryIngredients || []).map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="instructions-section">
                  <h3>👨‍🍳 Instructions</h3>
                  <div className="instructions-container">
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                      recipe.instructions.map((step, idx) => (
                        <div key={idx} className="instruction-step">
                          <div className="step-number">{idx + 1}</div>
                          <div className="step-content">{step}</div>
                        </div>
                      ))
                    ) : (
                      <div className="instruction-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                          Follow your cooking intuition! Use these ingredients to create something delicious.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {recipe.sourceUrl && (
                  <div className="source-section">
                    <a 
                      href={recipe.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      🔗 View Complete Recipe
                    </a>
                  </div>
                )}
              </div>
            </div>

            {recipeOptions.length > 0 && (
              <div className="alternative-recipes">
                <h3>🥗 More Options</h3>
                <div className="recipe-options-grid">
                  {recipeOptions.map((option, idx) => (
                    <div 
                      key={idx} 
                      className="recipe-option-card"
                      onClick={() => handleSelectRecipe(option)}
                    >
                      <div className="option-content">
                        <h4>{option.title}</h4>
                        <div className="option-meta">
                          <span className="option-time">{option.readyInMinutes || 30} mins</span>
                          <span className={`option-difficulty ${option.difficulty}`}>
                            {option.difficulty}
                          </span>
                        </div>
                        <div className="option-match">
                          ✅ Uses {(option.ingredients?.used || []).length} of your ingredients
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {savedRecipes.length > 0 && (
          <div className="saved-recipes">
            <h2>📚 Saved Recipes ({savedRecipes.length})</h2>
            <div className="saved-grid">
              {savedRecipes.map(saved => (
                <div 
                  key={saved.id} 
                  className="saved-card" 
                  onClick={() => handleSelectRecipe(saved)}
                >
                  <h3>{saved.title}</h3>
                  <div className="saved-meta">
                    <span className="saved-time">{saved.readyInMinutes || 25} mins</span>
                    <span className={`saved-difficulty ${saved.difficulty}`}>
                      {saved.difficulty}
                    </span>
                  </div>
                  <div className="saved-date">Saved {saved.savedAt}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="footer">
          <p>🍳 Pantry Chef AI • Your smart kitchen companion</p>
          <p className="footer-note">
            {apiAvailable 
              ? 'Powered by Spoonacular API • Real recipes from your ingredients'
              : 'Using intelligent recipe generation • Connect to API for more options'}
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;