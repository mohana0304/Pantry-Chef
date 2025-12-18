import axios from 'axios';

const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY
  }
});

export const spoonacularService = {
  
  async getRecipesFromIngredients(ingredients) {
    try {
      // Search by ingredients
      const searchResponse = await api.get('/findByIngredients', {
        params: {
          ingredients: ingredients.join(','),
          number: 3,
          ranking: 2,
          ignorePantry: true
        }
      });
      
      if (searchResponse.data.length === 0) {
        throw new Error('No recipes found');
      }
      
      // Get details for each recipe
      const recipePromises = searchResponse.data.map(async (recipe) => {
        try {
          const detailsResponse = await api.get(`/${recipe.id}/information`, {
            params: {
              includeNutrition: false
            }
          });
          
          const instructionsResponse = await api.get(`/${recipe.id}/analyzedInstructions`);
          
          return this.formatRecipe(recipe, detailsResponse.data, instructionsResponse.data);
        } catch (error) {
          console.error(`Error getting details for ${recipe.title}:`, error);
          return this.formatBasicRecipe(recipe);
        }
      });
      
      const recipes = await Promise.all(recipePromises);
      return recipes.filter(recipe => recipe !== null);
      
    } catch (error) {
      console.error('Error getting recipes:', error);
      throw error;
    }
  },

  formatRecipe(recipe, details, instructions) {
    const usedIngredients = recipe.usedIngredients || [];
    const missedIngredients = recipe.missedIngredients || [];
    
    // Get instructions
    let instructionSteps = [];
    if (instructions && instructions.length > 0 && instructions[0].steps) {
      instructionSteps = instructions[0].steps.map(step => step.step);
    } else if (details?.instructions) {
      const cleanInstructions = details.instructions.replace(/<[^>]*>/g, '');
      instructionSteps = cleanInstructions.split('\n').filter(step => step.trim() !== '');
    } else {
      instructionSteps = this.generateSmartInstructions(recipe.title);
    }
    
    // Calculate difficulty
    const prepTime = details?.readyInMinutes || 30;
    let difficulty = 'medium';
    if (prepTime <= 20) difficulty = 'easy';
    if (prepTime > 45) difficulty = 'hard';
    
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: prepTime,
      servings: details?.servings || 2,
      summary: details?.summary ? details.summary.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
      ingredients: {
        used: usedIngredients.map(ing => ing.original),
        missed: missedIngredients.map(ing => ing.original)
      },
      instructions: instructionSteps.slice(0, 10), // Limit to 10 steps
      sourceUrl: details?.sourceUrl || '',
      difficulty: difficulty
    };
  },

  generateSmartInstructions(title) {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('fried rice')) {
      return [
        'Prepare day-old rice for best results',
        'Beat eggs with a pinch of salt',
        'Chop all vegetables into small pieces',
        'Heat oil in wok or large pan over high heat',
        'Add aromatics and sauté until fragrant',
        'Push to side, add eggs and scramble',
        'Add rice and break up clumps',
        'Stir-fry for 3-4 minutes',
        'Add sauce and vegetables',
        'Toss everything together and serve'
      ];
    } else if (lowerTitle.includes('soup') || lowerTitle.includes('stew')) {
      return [
        'Chop vegetables into uniform pieces',
        'Sauté onions and garlic in oil',
        'Add other vegetables and cook briefly',
        'Add broth or water',
        'Bring to boil then reduce to simmer',
        'Cook until vegetables are tender',
        'Season with salt, pepper, and herbs',
        'Adjust consistency if needed',
        'Let flavors meld for 5 minutes',
        'Serve hot with garnish'
      ];
    } else if (lowerTitle.includes('pasta')) {
      return [
        'Bring salted water to boil',
        'Cook pasta according to package',
        'Prepare sauce while pasta cooks',
        'Sauté garlic in olive oil',
        'Add other ingredients to sauce',
        'Cook until sauce thickens',
        'Drain pasta, reserve some water',
        'Combine pasta and sauce',
        'Add pasta water if needed',
        'Toss well and serve immediately'
      ];
    }
    
    // General instructions
    return [
      'Prepare all ingredients',
      'Follow main cooking method',
      'Cook until tender and flavorful',
      'Season to taste',
      'Adjust as needed',
      'Serve and enjoy'
    ];
  },

  formatBasicRecipe(recipe) {
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: 30,
      servings: 2,
      summary: '',
      ingredients: {
        used: (recipe.usedIngredients || []).map(ing => ing.original),
        missed: (recipe.missedIngredients || []).map(ing => ing.original)
      },
      instructions: this.generateSmartInstructions(recipe.title),
      sourceUrl: '',
      difficulty: 'medium'
    };
  },

  async testConnection() {
    try {
      await api.get('/complexSearch', {
        params: {
          query: 'test',
          number: 1
        }
      });
      return true;
    } catch (error) {
      console.error('API connection failed:', error.message);
      return false;
    }
  }
};