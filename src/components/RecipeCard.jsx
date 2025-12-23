// Updated RecipeCard.jsx for API data
const RecipeCard = ({ recipe }) => {
  const [timerActive, setTimerActive] = useState(false);

  // Format ingredients list
  const formatIngredients = (ingredients) => {
    if (Array.isArray(ingredients)) return ingredients;
    if (typeof ingredients === 'object') {
      return [
        ...(ingredients.used || []),
        ...(ingredients.missed || [])
      ];
    }
    return [];
  };

  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <div className="recipe-title-section">
          <h2>{recipe.title}</h2>
          {recipe.creditsText && (
            <p className="recipe-credit">By {recipe.creditsText}</p>
          )}
        </div>
        
        <div className="recipe-meta">
          <span className="prep-time">⏱️ {recipe.readyInMinutes || recipe.prepTime} mins</span>
          <DifficultyBadge difficulty={recipe.difficulty} />
          <span className="servings">👥 Serves: {recipe.servings}</span>
          {recipe.sourceUrl && (
            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
              🔗 Original Recipe
            </a>
          )}
        </div>
      </div>

      {recipe.image && (
        <div className="recipe-image">
          <img 
            src={`https://spoonacular.com/recipeImages/${recipe.image}`} 
            alt={recipe.title}
          />
        </div>
      )}

      <div className="recipe-content">
        {recipe.summary && (
          <div className="summary-section">
            <h3>📖 Summary</h3>
            <p className="recipe-summary">{recipe.summary}</p>
          </div>
        )}

        <div className="ingredients-section">
          <h3>📝 Ingredients</h3>
          <div className="ingredients-grid">
            {recipe.ingredients?.used && recipe.ingredients.used.length > 0 && (
              <div className="ingredients-group">
                <h4 className="ingredients-title-green">✅ Ingredients You Have:</h4>
                <ul>
                  {recipe.ingredients.used.map((ing, idx) => (
                    <li key={idx} className="ingredient-have">{ing}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {recipe.ingredients?.missed && recipe.ingredients.missed.length > 0 && (
              <div className="ingredients-group">
                <h4 className="ingredients-title-orange">🛒 Additional Ingredients:</h4>
                <ul>
                  {recipe.ingredients.missed.map((ing, idx) => (
                    <li key={idx} className="ingredient-need">{ing}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="instructions-section">
          <h3>👨‍🍳 Instructions</h3>
          <ol className="instructions-list">
            {recipe.instructions.map((step, idx) => (
              <li key={idx}>
                <span className="step-number">{idx + 1}</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="recipe-actions">
          <Timer 
            duration={Math.ceil((recipe.readyInMinutes || 30) / 2)} 
            onTimerComplete={() => console.log('Timer complete!')}
          />
          <button 
            className="cooking-btn"
            onClick={() => setTimerActive(!timerActive)}
          >
            {timerActive ? '⏸️ Pause Cooking' : '▶️ Start Cooking Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};