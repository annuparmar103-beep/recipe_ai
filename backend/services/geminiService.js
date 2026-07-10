import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Check if Gemini is configured
const isGeminiConfigured = () => {
  return (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'mock_gemini_key'
  );
};

// Initialize Gemini SDK
let genAI;
if (isGeminiConfigured()) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Generate a recipe using Gemini AI or fall back to mock data.
 * @param {Object} params - Recipe creation parameters
 * @returns {Promise<Object>} - Hashed JSON recipe document matching the mongoose schema
 */
export const generateRecipeFromAI = async (params) => {
  const {
    ingredients = [],
    cuisine = 'Any',
    mealType = 'Dinner',
    difficulty = 'Medium',
    cookingTime = 30,
    diet = 'Any',
    spicyLevel = 'Medium',
  } = params;

  if (!isGeminiConfigured()) {
    console.log('[GeminiService]: API Key missing/mock. Returning mock recipe data...');
    // Simulated delay to feel realistic
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return getMockRecipe(ingredients, cuisine, mealType, difficulty, cookingTime, diet, spicyLevel);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert executive chef. Generate a delicious, complete, real recipe based on the following constraints:
      - Available/Core Ingredients: ${ingredients.join(', ') || 'Any healthy ingredients'}
      - Cuisine style: ${cuisine}
      - Meal type: ${mealType}
      - Difficulty: ${difficulty}
      - Maximum cooking time (minutes): ${cookingTime}
      - Dietary restrictions: ${diet}
      - Spicy level: ${spicyLevel}

      Provide precise weights and measurements for all ingredients.
      Ensure the nutrition parameters (calories, carbs, protein, fat) are realistic estimations.
    `;

    // Define JSON schema to force Gemini to return the exact structure
    const responseSchema = {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Clear, appealing name of the recipe' },
        description: { type: 'string', description: 'Brief description of the dish (max 150 characters)' },
        prepTime: { type: 'number', description: 'Preparation time in minutes' },
        cookTime: { type: 'number', description: 'Cooking time in minutes' },
        totalTime: { type: 'number', description: 'Sum of prep time and cook time in minutes' },
        difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
        cuisine: { type: 'string', description: 'Cuisine style (e.g. Italian, Mexican, American)' },
        servingSize: { type: 'number', description: 'Number of servings' },
        calories: { type: 'number', description: 'Total calories per serving' },
        nutrition: {
          type: 'object',
          properties: {
            protein: { type: 'number', description: 'Protein in grams' },
            fat: { type: 'number', description: 'Fat in grams' },
            carbs: { type: 'number', description: 'Carbohydrates in grams' },
          },
          required: ['protein', 'fat', 'carbs'],
        },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Ingredient name (e.g. skinless chicken breast)' },
              amount: { type: 'number', description: 'Numerical quantity' },
              unit: { type: 'string', description: 'Measurement unit (e.g. g, oz, tbsp, piece)' },
            },
            required: ['name', 'amount', 'unit'],
          },
        },
        steps: {
          type: 'array',
          items: { type: 'string', description: 'Detailed sequential cooking instruction step' },
        },
        cookingTips: {
          type: 'array',
          items: { type: 'string', description: 'Useful tips for improving preparation or flavor' },
        },
        storageTips: {
          type: 'array',
          items: { type: 'string', description: 'Instructions on storage, freezing, or reheating' },
        },
        healthyAlternatives: {
          type: 'array',
          items: { type: 'string', description: 'Substitute ingredients for low-carb, low-fat, or allergen-free options' },
        },
      },
      required: [
        'title',
        'description',
        'prepTime',
        'cookTime',
        'totalTime',
        'difficulty',
        'cuisine',
        'servingSize',
        'calories',
        'nutrition',
        'ingredients',
        'steps',
        'cookingTips',
        'storageTips',
        'healthyAlternatives',
      ],
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error(`[Gemini Generation Error]: ${error.message}`);
    throw new Error(`AI Recipe Generation failed: ${error.message}`);
  }
};

/**
 * Returns dynamic mock recipe JSON based on user inputs.
 */
function getMockRecipe(ingredients, cuisine, mealType, difficulty, cookingTime, diet, spicyLevel) {
  const primaryIngredient = ingredients[0] || 'vegetable';
  const capitalIngredient = primaryIngredient.charAt(0).toUpperCase() + primaryIngredient.slice(1);
  
  return {
    title: `Gemini AI ${cuisine !== 'Any' ? cuisine : 'Garden'} ${capitalIngredient} Medley`,
    description: `A delicious, healthy, and easy-to-make ${mealType.toLowerCase()} featuring ${ingredients.join(' and ') || 'fresh seasonal greens'}.`,
    prepTime: 10,
    cookTime: Math.max(10, cookingTime - 10),
    totalTime: Math.max(20, cookingTime),
    difficulty: difficulty,
    cuisine: cuisine !== 'Any' ? cuisine : 'International',
    servingSize: 2,
    calories: 345,
    nutrition: {
      protein: 12,
      fat: 8,
      carbs: 45,
    },
    ingredients: ingredients.length > 0 
      ? ingredients.map((ing, i) => ({ name: ing, amount: i + 1, unit: i % 2 === 0 ? 'cups' : 'tbsp' }))
      : [
          { name: 'mixed vegetables', amount: 2, unit: 'cups' },
          { name: 'olive oil', amount: 1, unit: 'tbsp' },
          { name: 'salt and black pepper', amount: 0.5, unit: 'tsp' }
        ],
    steps: [
      `Wash and chop the ${ingredients.join(', ') || 'vegetables'} into bite-sized pieces.`,
      'Heat a skillet or frying pan over medium-high heat.',
      'Sauté the ingredients with olive oil, salt, and seasoning for 8-10 minutes.',
      `Serve warm, adjusting the ${spicyLevel.toLowerCase()} seasonings to taste.`
    ],
    cookingTips: [
      'Preheat your skillet before adding ingredients for a better sear.',
      'Use fresh, seasonal ingredients for the best color and flavor profiles.'
    ],
    storageTips: [
      'Store any leftovers in an airtight container in the refrigerator for up to 3 days.',
      'Reheat gently in a warm oven or microwave prior to serving.'
    ],
    healthyAlternatives: [
      'Use coconut oil or cooking spray instead of olive oil for lower calorie options.',
      'Add low-fat cottage cheese or grilled tofu for a higher protein boost.'
    ]
  };
}
