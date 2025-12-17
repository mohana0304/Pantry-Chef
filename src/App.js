import React, { useState } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState(['', '', '']);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);

  const commonIngredients = [
    'chicken', 'eggs', 'pasta', 'rice', 'tomatoes', 
    'onions', 'garlic', 'potatoes', 'cheese', 'bread',
    'carrots', 'bell peppers', 'mushrooms', 'spinach'
  ];

  const pantryStaples = [
    'salt', 'pepper', 'oil', 'butter', 'flour',
    'sugar', 'water', 'milk', 'vinegar', 'soy sauce'
  ];

  const recipePatterns = [
    {
      title: 'Stir Fry',
      difficulty: 'easy',
      prepTime: '20 mins',
      servings: 2,
      match: ['chicken', 'beef', 'pork', 'tofu', 'vegetables'],
      generate: (ing) => ({
        title: `${ing[0]} Stir Fry`,
        prepTime: '20 mins',
        difficulty: 'easy',
        servings: 2,
        yourIngredients: ing,
        pantryIngredients: pantryStaples.slice(0, 5),
        instructions: [
          'Chop all ingredients into bite-sized pieces',
          'Heat oil in a pan over medium heat',
          'Add garlic and sauté for 30 seconds',
          `Add ${ing[0]} and stir fry for 5-7 minutes`,
          'Season with salt, pepper, and soy sauce',
          'Serve hot with rice or noodles'
        ],
        tips: 'Add a splash of water if the pan gets too dry'
      })
    },
    {
      title: 'Soup',
      difficulty: 'easy',
      prepTime: '30 mins',
      servings: 4,
      match: ['chicken', 'vegetables', 'potatoes', 'carrots'],
      generate: (ing) => ({
        title: `${ing[0]} Soup`,
        prepTime: '30 mins',
        difficulty: 'easy',
        servings: 4,
        yourIngredients: ing,
        pantryIngredients: ['water', 'salt', 'pepper', 'onion', 'bay leaf'],
        instructions: [
          'Chop ingredients into chunks',
          'Sauté in a pot with oil for 5 minutes',
          'Add water to cover everything',
          'Bring to boil, then simmer for 20 minutes',
          'Season with salt and pepper',
          'Serve hot'
        ],
        tips: 'Add pasta or rice to make it more filling'
      })
    }
  ];

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value.toLowerCase();
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

  const generateRecipe = (userIngredients) => {
    const filtered = userIngredients.filter(ing => ing.trim() !== '');
    
    // Find matching recipe pattern
    let selectedPattern = recipePatterns[0]; // Default
    for (const pattern of recipePatterns) {
      if (filtered.some(ing => pattern.match.includes(ing))) {
        selectedPattern = pattern;
        break;
      }
    }
    
    return selectedPattern.generate(filtered);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const filtered = ingredients.filter(ing => ing.trim() !== '');
    
    if (filtered.length >= 1 && filtered.length <= 5) {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const newRecipe = generateRecipe(filtered);
        setRecipe(newRecipe);
        setLoading(false);
      }, 1000);
    } else {
      alert('Please enter 1-5 ingredients');
    }
  };

  const handleSave = () => {
    if (recipe) {
      setSavedRecipes([...savedRecipes, { ...recipe, id: Date.now() }]);
      alert('Recipe saved!');
    }
  };

  const handleReset = () => {
    setIngredients(['', '', '']);
    setRecipe(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 Smart Recipe Generator</h1>
        <p>Turn what you have into delicious meals</p>
      </header>

      <main className="main">
        <div className="input-section">
          <form onSubmit={handleGenerate} className="ingredient-form">
            <h2>What ingredients do you have?</h2>
            <p className="subtitle">Enter 1-5 ingredients you have available</p>
            
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
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="remove-btn"
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
                >
                  + Add another ingredient
                </button>
              )}
            </div>

            <div className="common-ingredients">
              <p>Quick add:</p>
              <div className="common-grid">
                {commonIngredients.map((ing, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCommonClick(ing)}
                    className="common-btn"
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="generate-btn">
                🍳 Generate Recipe
              </button>
              <button 
                type="button" 
                onClick={handleReset}
                className="clear-btn"
              >
                Clear All
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generating your perfect recipe...</p>
          </div>
        )}

        {recipe && !loading && (
          <div className="recipe-section">
            <div className="recipe-actions">
              <button onClick={handleSave} className="save-btn">
                💾 Save Recipe
              </button>
              <button onClick={handleReset} className="new-btn">
                🔄 New Recipe
              </button>
            </div>

            <div className="recipe-card">
              <h2>{recipe.title}</h2>
              
              <div className="recipe-meta">
                <span className="time">⏱️ {recipe.prepTime}</span>
                <span className={`difficulty ${recipe.difficulty}`}>
                  {recipe.difficulty === 'easy' ? '😊 Easy' : 
                   recipe.difficulty === 'medium' ? '😐 Medium' : '😅 Hard'}
                </span>
                <span className="servings">👥 Serves: {recipe.servings}</span>
              </div>

              <div className="ingredients">
                <h3>📝 Ingredients</h3>
                <div className="ingredient-lists">
                  <div className="list">
                    <h4>Your Ingredients:</h4>
                    <ul>
                      {recipe.yourIngredients.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="list">
                    <h4>Pantry Staples:</h4>
                    <ul>
                      {recipe.pantryIngredients.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="instructions">
                <h3>👨‍🍳 Instructions</h3>
                <ol>
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {recipe.tips && (
                <div className="tips">
                  <h3>💡 Chef's Tips</h3>
                  <p>{recipe.tips}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {savedRecipes.length > 0 && (
          <div className="saved-recipes">
            <h2>Saved Recipes ({savedRecipes.length})</h2>
            <div className="saved-grid">
              {savedRecipes.map(saved => (
                <div key={saved.id} className="saved-card">
                  <h3>{saved.title}</h3>
                  <p>⏱️ {saved.prepTime} • {saved.difficulty}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;