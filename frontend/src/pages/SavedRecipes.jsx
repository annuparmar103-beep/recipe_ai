import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes } from '../redux/slices/recipeSlice';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiClock, FiActivity, FiArrowRight, FiPlusCircle } from 'react-icons/fi';
import { getRecipeImage } from '../utils/recipeHelper';

const SavedRecipes = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { recipes, loading } = useSelector((state) => state.recipes);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchRecipes({ author: user._id, limit: 12 }));
    }
  }, [dispatch, user]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            My Recipes <FiBookOpen className="text-primary h-7 w-7" />
          </h1>
          <p className="text-slate-500 text-sm">Browse culinary creations you have generated with AI or saved manually.</p>
        </div>
        <Link 
          to="/generate" 
          className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <FiPlusCircle /> Generate Recipe
        </Link>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-card"></div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-card p-12 text-center py-20 space-y-4">
          <FiBookOpen className="h-10 w-10 mx-auto text-slate-350" />
          <h3 className="font-bold text-slate-700">No saved recipes yet</h3>
          <p className="text-xs text-slate-450 max-w-xs mx-auto leading-relaxed">
            You haven't generated or saved any recipes. Get started by entering ingredients in the AI builder!
          </p>
          <Link 
            to="/generate" 
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Go to AI Builder <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="flex flex-col bg-white rounded-card border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-premium text-left"
            >
              <div className="relative h-44 bg-slate-150 flex items-center justify-center">
                <img src={getRecipeImage(recipe)} alt={recipe.title} className="h-full w-full object-cover" />
                {recipe.isAI && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">AI Generated</span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow space-y-3">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1 hover:text-primary">
                  <Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link>
                </h3>
                <p className="text-xs text-slate-450 line-clamp-2 leading-relaxed">{recipe.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 mt-auto">
                  <span className="flex items-center gap-1"><FiClock /> {recipe.totalTime}m</span>
                  <span className="capitalize">{recipe.difficulty}</span>
                  <span className="flex items-center gap-1"><FiActivity /> {recipe.calories} kcal</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SavedRecipes;
