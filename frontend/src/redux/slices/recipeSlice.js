import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

// Thunks
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchAll',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await client.get('/recipes', { params: queryParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recipes');
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await client.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recipe details');
    }
  }
);

export const generateAiRecipe = createAsyncThunk(
  'recipes/generateAI',
  async (options, { rejectWithValue }) => {
    try {
      const response = await client.post('/recipes/generate', options);
      return response.data.recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'AI Recipe Generation failed');
    }
  }
);

export const saveRecipe = createAsyncThunk(
  'recipes/save',
  async (recipeData, { rejectWithValue }) => {
    try {
      const response = await client.post('/recipes', recipeData);
      return response.data.recipe;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save recipe');
    }
  }
);

export const toggleLikeRecipe = createAsyncThunk(
  'recipes/toggleLike',
  async (id, { rejectWithValue }) => {
    try {
      const response = await client.post(`/recipes/${id}/like`);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

export const toggleFavoriteRecipe = createAsyncThunk(
  'recipes/toggleFavorite',
  async (id, { rejectWithValue }) => {
    try {
      const response = await client.post(`/recipes/${id}/favorite`);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'recipes/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await client.get('/categories');
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const initialState = {
  recipes: [],
  currentRecipe: null,
  categories: [],
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  aiGenerating: false,
  error: null,
  generatedRecipe: null,
};

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearGeneratedRecipe: (state) => {
      state.generatedRecipe = null;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload.recipes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Recipe Details
      .addCase(fetchRecipeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecipe = {
          ...action.payload.recipe,
          isLiked: action.payload.isLiked,
          isFavorite: action.payload.isFavorite,
        };
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate AI Recipe
      .addCase(generateAiRecipe.pending, (state) => {
        state.aiGenerating = true;
        state.error = null;
        state.generatedRecipe = null;
      })
      .addCase(generateAiRecipe.fulfilled, (state, action) => {
        state.aiGenerating = false;
        state.generatedRecipe = action.payload;
      })
      .addCase(generateAiRecipe.rejected, (state, action) => {
        state.aiGenerating = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Toggle Like (Updates details inside lists or details views)
      .addCase(toggleLikeRecipe.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        if (state.currentRecipe && state.currentRecipe._id === id) {
          state.currentRecipe.isLiked = data.isLiked;
          state.currentRecipe.likesCount = data.likesCount;
        }
        const recipeIndex = state.recipes.findIndex((r) => r._id === id);
        if (recipeIndex !== -1) {
          state.recipes[recipeIndex].likesCount = data.likesCount;
        }
      })
      // Toggle Favorite
      .addCase(toggleFavoriteRecipe.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        if (state.currentRecipe && state.currentRecipe._id === id) {
          state.currentRecipe.isFavorite = data.isFavorite;
        }
      });
  },
});

export const { clearGeneratedRecipe, clearCurrentRecipe, clearError } = recipeSlice.actions;
export default recipeSlice.reducer;
