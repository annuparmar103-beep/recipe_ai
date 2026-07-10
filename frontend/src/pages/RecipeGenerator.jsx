import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateAiRecipe, saveRecipe, clearGeneratedRecipe } from '../redux/slices/recipeSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiX, FiCpu, FiClock, FiActivity, 
  FiSave, FiArrowRight, FiCheck, FiBookOpen 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const RecipeGenerator = () => {
  const dispatch = useDispatch();
  const { aiGenerating, generatedRecipe } = useSelector((state) => state.recipes);

  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [diet, setDiet] = useState('');
  const [maxTime, setMaxTime] = useState('');

  const [loadingQuote, setLoadingQuote] = useState('Selecting fresh ingredients...');
  const [isSaved, setIsSaved] = useState(false);

  // Clear generated recipe on mount
  useEffect(() => {
    dispatch(clearGeneratedRecipe());
  }, [dispatch]);

  // Rotate culinary quotes during AI call
  useEffect(() => {
    let quoteInterval;
    if (aiGenerating) {
      const quotes = [
        'Slicing the ingredients...',
        'Consulting the Gemini AI chef...',
        'Balancing the spices...',
        'Simmering the virtual broth...',
        'Finishing the final plating...',
      ];
      let idx = 0;
      quoteInterval = setInterval(() => {
        setLoadingQuote(quotes[idx % quotes.length]);
        idx++;
      }, 3000);
    }
    return () => clearInterval(quoteInterval);
  }, [aiGenerating]);

  const addIngredient = (e) => {
    e?.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    if (ingredients.includes(val)) {
      toast.error('Ingredient already added');
      return;
    }
    setIngredients([...ingredients, val]);
    setInputValue('');
  };

  const removeIngredient = (idx) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    const options = {
      ingredients,
      difficulty,
    };
    if (cuisine) options.cuisine = cuisine;
    if (diet) options.diet = diet;
    if (maxTime) options.maxTime = parseInt(maxTime, 10);

    setIsSaved(false);
    dispatch(generateAiRecipe(options));
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    
    // Save to database
    const action = await dispatch(saveRecipe(generatedRecipe));
    if (saveRecipe.fulfilled.match(action)) {
      toast.success('Recipe saved to your profile successfully!');
      setIsSaved(true);
    } else {
      toast.error(action.payload || 'Failed to save recipe');
    }
  };

  const cuisinesList = ['American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'French', 'Mediterranean', 'Asian'];
  const dietsList = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb'];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-left space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          AI Recipe Builder <FiCpu className="text-primary h-7 w-7 animate-pulse" />
        </h1>
        <p className="text-slate-500 text-sm">Enter ingredients you want to use and watch Gemini compose custom recipes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Settings */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-5 text-left">
          
          {/* Ingredients Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ingredients List</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Tofu, spinach, garlic..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient(e)}
                className="flex-grow px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-650 hover:bg-slate-100 flex items-center justify-center"
              >
                <FiPlus className="h-5 w-5" />
              </button>
            </div>

            {/* Ingredients Tags Grid */}
            <div className="flex flex-wrap gap-2 min-h-12 bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200">
              {ingredients.length === 0 ? (
                <span className="text-xs text-slate-400 self-center">No ingredients added yet.</span>
              ) : (
                ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-white border border-slate-150 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                  >
                    {ing}
                    <button type="button" onClick={() => removeIngredient(idx)} className="text-slate-400 hover:text-red-500">
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Cuisine Style */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cuisine Style (Optional)</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
            >
              <option value="">Any Cuisine</option>
              {cuisinesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Diet Specs */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Dietary Specifications (Optional)</label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
            >
              <option value="">No Restrictions</option>
              {dietsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Difficulty & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Max Cook Time (min)</label>
              <input
                type="number"
                placeholder="60"
                min="5"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={aiGenerating}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <FiCpu /> Build AI Recipe
          </button>
        </form>

        {/* Right Column: AI Loader & Recipe Result */}
        <div className="lg:col-span-7">
          
          {/* 1. Loading State */}
          {aiGenerating && (
            <div className="bg-white border border-slate-100 p-12 rounded-card shadow-sm text-center py-24 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-primary">
                <FiCpu className="h-8 w-8 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Composing Recipe...</h2>
              <p className="text-xs text-slate-400 font-semibold italic bg-slate-50 max-w-xs mx-auto py-2 px-4 rounded-xl border border-slate-100">
                {loadingQuote}
              </p>
            </div>
          )}

          {/* 2. Welcome State */}
          {!aiGenerating && !generatedRecipe && (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 p-12 rounded-card text-center py-32 space-y-3">
              <FiCpu className="h-10 w-10 mx-auto text-slate-350" />
              <h3 className="font-bold text-slate-700">Awaiting kitchen options</h3>
              <p className="text-xs text-slate-450 max-w-xs mx-auto leading-relaxed">
                Add ingredients, choose custom cuisine settings, and click Build AI Recipe to begin.
              </p>
            </div>
          )}

          {/* 3. Generated Recipe Results */}
          {!aiGenerating && generatedRecipe && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden text-left"
            >
              {/* Header Details */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                <div className="space-y-2">
                  <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">Gemini AI Output</span>
                  <h2 className="text-2xl font-extrabold text-slate-850 font-display leading-tight">{generatedRecipe.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">{generatedRecipe.description}</p>
                </div>
                
                {/* Save to Profile Button */}
                <button
                  onClick={handleSaveRecipe}
                  disabled={isSaved}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm ${
                    isSaved 
                      ? 'bg-green-50 text-green-600 border border-green-200' 
                      : 'bg-primary hover:bg-primary-dark text-white shadow-primary/10'
                  }`}
                >
                  {isSaved ? <><FiCheck /> Saved</> : <><FiSave /> Save Recipe</>}
                </button>
              </div>

              {/* Nutrition Summary facts */}
              <div className="grid grid-cols-4 border-b border-slate-100 text-center py-4 bg-white divide-x divide-slate-100 text-xs">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{generatedRecipe.calories || 0}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Calories</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{generatedRecipe.macros?.protein || '0g'}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Protein</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{generatedRecipe.macros?.carbs || '0g'}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Carbs</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{generatedRecipe.macros?.fat || '0g'}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Fats</div>
                </div>
              </div>

              {/* Contents block */}
              <div className="p-6 space-y-6">
                
                {/* Ingredients Column */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1"><FiBookOpen className="text-primary" /> Ingredients</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-650">
                    {generatedRecipe.ingredients?.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <span className="h-2 w-2 rounded-full bg-primary/40"></span>
                        <span>{ing.amount} {ing.unit} {ing.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Steps Column */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1"><FiArrowRight className="text-primary" /> Instructions</h3>
                  <ol className="space-y-3 text-xs text-slate-650">
                    {generatedRecipe.steps?.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="h-5 w-5 rounded-full bg-green-50 text-primary border border-green-150 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>

            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
};

export default RecipeGenerator;
