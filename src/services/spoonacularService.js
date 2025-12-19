// services/spoonacularService.js
const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

export const spoonacularService = {
  testConnection: async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/recipes/findByIngredients?ingredients=rice&number=1&apiKey=${API_KEY}`
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // NEW: Get Indian recipes using specific ingredients
  getIndianRecipesFromIngredients: async (ingredients) => {
    try {
      const ingredientsString = ingredients.join(',+');
      const response = await fetch(
        `${BASE_URL}/recipes/findByIngredients?ingredients=${ingredientsString}&number=5&cuisine=indian&apiKey=${API_KEY}`
      );
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      // Get additional details for each recipe including YouTube links
      const detailedRecipes = await Promise.all(
        data.slice(0, 3).map(async (recipe) => {
          try {
            const detailsResponse = await fetch(
              `${BASE_URL}/recipes/${recipe.id}/information?apiKey=${API_KEY}&includeNutrition=false`
            );
            const details = await detailsResponse.json();
            
            return {
              id: recipe.id,
              title: recipe.title,
              readyInMinutes: details.readyInMinutes || 30,
              servings: details.servings || 2,
              difficulty: details.readyInMinutes < 30 ? 'easy' : details.readyInMinutes < 60 ? 'medium' : 'hard',
              ingredients: {
                used: details.extendedIngredients?.map(ing => ing.original) || [],
                missed: recipe.missedIngredients?.map(ing => ing.name) || []
              },
              instructions: details.instructions ? 
                details.instructions.split('\n').filter(step => step.trim()) : 
                ['Follow your cooking intuition for this Indian dish.'],
              image: recipe.image,
              youtube: details.sourceUrl?.includes('youtube') ? details.sourceUrl : 
                     `https://www.youtube.com/results?search_query=Indian+${recipe.title.replace(/\s+/g, '+')}`,
              sourceUrl: details.sourceUrl,
              cuisine: 'Indian'
            };
          } catch (error) {
            // Return basic recipe if details fail
            return {
              id: recipe.id,
              title: recipe.title,
              readyInMinutes: 30,
              servings: 2,
              difficulty: 'medium',
              ingredients: {
                used: ingredients,
                missed: recipe.missedIngredients?.map(ing => ing.name) || []
              },
              instructions: ['1. Prepare all ingredients', '2. Cook following Indian cooking techniques', '3. Serve hot'],
              image: recipe.image,
              youtube: `https://www.youtube.com/results?search_query=Indian+${recipe.title.replace(/\s+/g, '+')}`,
              cuisine: 'Indian'
            };
          }
        })
      );
      
      return detailedRecipes;
    } catch (error) {
      console.error('Error fetching Indian recipes:', error);
      throw error;
    }
  },

  // Keep your existing function for fallback
  getRecipesFromIngredients: async (ingredients) => {
    // Your existing implementation
    // ...
  }
};