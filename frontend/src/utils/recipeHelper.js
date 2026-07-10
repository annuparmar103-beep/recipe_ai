/**
 * Utility helper to resolve recipe images.
 * Handles relative backend uploads, Cloudinary URLs, and dynamic high-quality Unsplash fallbacks.
 */
export const getRecipeImage = (recipe) => {
  if (recipe?.image && recipe.image.trim() !== '') {
    // If it's a relative upload path, resolve it against the backend URL host
    if (recipe.image.startsWith('/uploads') || recipe.image.startsWith('uploads')) {
      const cleanPath = recipe.image.startsWith('/') ? recipe.image : `/${recipe.image}`;
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const baseURL = apiURL.replace('/api', '');
      return `${baseURL}${cleanPath}`;
    }
    return recipe.image;
  }

  // If no image is set, fall back to high-quality food photography based on title matching
  const title = recipe?.title?.toLowerCase() || '';

  if (title.includes('pasta') || title.includes('spaghetti') || title.includes('noodle') || title.includes('lasagna')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
  }
  if (title.includes('soup') || title.includes('broth') || title.includes('ramen') || title.includes('stew')) {
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop';
  }
  if (title.includes('salad') || title.includes('vegetable') || title.includes('healthy') || title.includes('greens')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop';
  }
  if (title.includes('cake') || title.includes('dessert') || title.includes('sweet') || title.includes('cookie') || title.includes('pastry')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop';
  }
  if (title.includes('bread') || title.includes('toast') || title.includes('garlic') || title.includes('sandwich')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop';
  }
  if (title.includes('chicken') || title.includes('meat') || title.includes('beef') || title.includes('pork') || title.includes('steak')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop';
  }
  
  // Default general high-quality food background cover
  return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop';
};
