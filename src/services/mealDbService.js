// Service to handle all TheMealDB API calls
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

class MealDbService {
  // Get all Indian meals (returns simplified list)
  async getAllIndianMeals() {
    try {
      const response = await fetch(`${API_BASE_URL}/filter.php?a=Indian`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching Indian meals:', error);
      return [];
    }
  }
// In your mealDbService.js, add this function:

async findRecipesWithOnlyIngredients(userIngredients) {
  try {
    // Get all Indian recipes
    const allRecipes = await this.getDetailedIndianRecipes(50);
    
    // Filter recipes that use ONLY or MOSTLY user's ingredients
    const filteredRecipes = allRecipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
      const userIngs = userIngredients.map(ing => ing.toLowerCase());
      
      // Calculate how many recipe ingredients the user has
      const matchingIngredients = recipeIngredients.filter(recipeIng =>
        userIngs.some(userIng => 
          recipeIng.includes(userIng) || userIng.includes(recipeIng)
        )
      );
      
      // Calculate how many ingredients are missing
      const missingIngredients = recipeIngredients.filter(recipeIng =>
        !userIngs.some(userIng => 
          recipeIng.includes(userIng) || userIng.includes(recipeIng)
        )
      );
      
      // Score: percentage of recipe ingredients the user has
      const matchPercentage = (matchingIngredients.length / recipeIngredients.length) * 100;
      
      return {
        ...recipe,
        matchPercentage: Math.round(matchPercentage),
        matchingIngredients,
        missingIngredients,
        canMakeWithOnly: missingIngredients.length === 0 // True if user has ALL ingredients
      };
    });
    
    // Sort by recipes that need the FEWEST additional ingredients
    return filteredRecipes
      .sort((a, b) => {
        // First priority: Can make with only given ingredients
        if (a.canMakeWithOnly && !b.canMakeWithOnly) return -1;
        if (!a.canMakeWithOnly && b.canMakeWithOnly) return 1;
        
        // Second priority: Highest match percentage
        return b.matchPercentage - a.matchPercentage;
      })
      .slice(0, 10); // Return top 10
    
  } catch (error) {
    console.error('Error finding recipes:', error);
    return [];
  }
}
  // Get detailed recipe by ID
  async getMealDetails(mealId) {
    try {
      const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error('Error fetching meal details:', error);
      return null;
    }
  }

  // Get detailed Indian recipes with ingredients
  async getDetailedIndianRecipes(limit = 20) {
    try {
      // First get all Indian meals
      const meals = await this.getAllIndianMeals();
      
      // Get details for each (limited for performance)
      const detailedMeals = [];
      for (let i = 0; i < Math.min(limit, meals.length); i++) {
        const details = await this.getMealDetails(meals[i].idMeal);
        if (details) {
          detailedMeals.push(this.formatMealData(details));
        }
      }
      
      return detailedMeals;
    } catch (error) {
      console.error('Error getting detailed recipes:', error);
      return [];
    }
  }

  // Find Indian recipes matching user's ingredients
  async findRecipesByIngredients(userIngredients) {
    try {
      // Get all detailed Indian recipes
      const allIndianRecipes = await this.getDetailedIndianRecipes(30);
      
      // Convert user input to lowercase array
      const userIngs = userIngredients
        .toLowerCase()
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);
      
      // If no ingredients provided, return all recipes
      if (userIngs.length === 0) {
        return allIndianRecipes;
      }
      
      // Score recipes based on ingredient matches
      const scoredRecipes = allIndianRecipes.map(recipe => {
        const recipeIngs = recipe.ingredients.map(ing => ing.name.toLowerCase());
        
        // Count matches
        const matches = userIngs.filter(userIng => 
          recipeIngs.some(recipeIng => 
            recipeIng.includes(userIng) || userIng.includes(recipeIng)
          )
        );
        
        // Calculate match percentage
        const matchScore = (matches.length / userIngs.length) * 100;
        
        return {
          ...recipe,
          matchScore: Math.round(matchScore),
          matchedIngredients: matches,
          missingIngredients: userIngs.filter(ing => 
            !recipeIngs.some(recipeIng => 
              recipeIng.includes(ing) || ing.includes(recipeIng)
            )
          )
        };
      });
      
      // Sort by match score (highest first) and filter those with at least 1 match
      return scoredRecipes
        .filter(recipe => recipe.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
      
    } catch (error) {
      console.error('Error finding recipes by ingredients:', error);
      return [];
    }
  }

  // Format meal data for consistent structure
  formatMealData(meal) {
    // Extract ingredients and measurements
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient,
          measure: measure || ''
        });
      }
    }
    
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      instructions: meal.strInstructions,
      thumbnail: meal.strMealThumb,
      youtube: meal.strYoutube,
      source: meal.strSource,
      ingredients: ingredients,
      tags: meal.strTags ? meal.strTags.split(',') : []
    };
  }

  // Search Indian recipes by name
  async searchIndianRecipes(query) {
    try {
      // First search all meals
      const response = await fetch(`${API_BASE_URL}/search.php?s=${query}`);
      const data = await response.json();
      
      if (!data.meals) return [];
      
      // Filter for Indian meals only
      const indianMeals = data.meals.filter(meal => 
        meal.strArea && meal.strArea.toLowerCase() === 'indian'
      );
      
      return indianMeals.map(meal => this.formatMealData(meal));
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  }
}

export default new MealDbService();