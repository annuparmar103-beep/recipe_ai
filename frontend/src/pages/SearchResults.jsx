import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, fetchCategories } from '../redux/slices/recipeSlice';
import { FiSearch, FiSliders, FiClock, FiActivity, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getRecipeImage } from '../utils/recipeHelper';

const SearchResults = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { recipes, categories, pagination, loading } = useSelector((state) => state.recipes);

  // Read URL query parameters
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlCuisine = searchParams.get('cuisine') || '';
  const urlDifficulty = searchParams.get('difficulty') || '';
  const urlIsAI = searchParams.get('isAI') || '';
  const urlPage = parseInt(searchParams.get('page')) || 1;

  // Local state initialized from query parameters
  const [searchText, setSearchText] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedCuisine, setSelectedCuisine] = useState(urlCuisine);
  const [selectedDifficulty, setSelectedDifficulty] = useState(urlDifficulty);
  const [selectedIsAI, setSelectedIsAI] = useState(urlIsAI);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories once
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Sync state with URL changes (e.g. clicking category link on landing page)
  useEffect(() => {
    setSearchText(urlSearch);
    setSelectedCategory(urlCategory);
    setSelectedCuisine(urlCuisine);
    setSelectedDifficulty(urlDifficulty);
    setSelectedIsAI(urlIsAI);

    // Call API thunk with active search parameters
    const query = {
      page: urlPage,
      limit: 6,
    };
    if (urlSearch) query.search = urlSearch;
    if (urlCategory) query.category = urlCategory;
    if (urlCuisine) query.cuisine = urlCuisine;
    if (urlDifficulty) query.difficulty = urlDifficulty;
    if (urlIsAI) query.isAI = urlIsAI;

    dispatch(fetchRecipes(query));
  }, [dispatch, searchParams, urlSearch, urlCategory, urlCuisine, urlDifficulty, urlIsAI, urlPage]);

  const applyFilters = (newPage = 1) => {
    const params = {};
    if (searchText) params.search = searchText;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedCuisine) params.cuisine = selectedCuisine;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;
    if (selectedIsAI) params.isAI = selectedIsAI;
    params.page = newPage.toString();

    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters(1);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedCuisine('');
    setSelectedDifficulty('');
    setSelectedIsAI('');
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.pages) return;
    applyFilters(page);
  };

  const cuisinesList = ['American', 'Italian', 'Mexican', 'Indian', 'Chinese', 'French', 'Mediterranean', 'Asian'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-left space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800">Browse Recipes</h1>
        <p className="text-slate-500 text-sm">Discover customized culinary configurations tailored to your diet.</p>
      </div>

      {/* Main Grid: Left Filters, Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Filters Panel */}
        <aside className="hidden lg:block bg-white border border-slate-100 p-6 rounded-card shadow-sm h-fit space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><FiSliders /> Filters</span>
            <button onClick={clearFilters} className="text-xs font-semibold text-primary hover:underline">Clear all</button>
          </div>

          <div className="space-y-4">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Cuisine */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Cuisine</label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
              >
                <option value="">All Cuisines</option>
                {cuisinesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
              >
                <option value="">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* AI Source */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Recipe Origin</label>
              <select
                value={selectedIsAI}
                onChange={(e) => setSelectedIsAI(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
              >
                <option value="">All Recipes</option>
                <option value="true">AI Generated</option>
                <option value="false">User Created</option>
              </select>
            </div>

          </div>

          <button
            onClick={() => applyFilters(1)}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-md"
          >
            Apply Filters
          </button>
        </aside>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Bar: Search Input & Mobile Filter Toggle */}
          <div className="flex gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search recipes, ingredients..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none border-none"
                />
                <FiSearch className="absolute left-3.5 top-2.5 text-slate-400 h-4.5 w-4.5" />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm transition-colors"
              >
                Search
              </button>
            </form>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden p-3 bg-white border border-slate-250 rounded-2xl text-slate-650 hover:bg-slate-50 flex items-center justify-center"
            >
              <FiSliders className="h-5 w-5" />
            </button>
          </div>

          {/* Recipes List Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-card border border-slate-100"></div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-card p-12 text-center text-slate-400 text-sm space-y-4">
              <FiXCircle className="h-12 w-12 mx-auto text-slate-300" />
              <p>No recipes found matching your query filters.</p>
              <button onClick={clearFilters} className="text-primary font-bold hover:underline">Reset searches</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="flex flex-col bg-white rounded-card border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-premium text-left"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                    <img src={getRecipeImage(recipe)} alt={recipe.title} className="h-full w-full object-cover" />
                    {recipe.isAI && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">AI Generated</span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1 hover:text-primary">
                      <Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{recipe.description}</p>
                    
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

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-semibold">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold"
              >
                Next
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Drawer Slide Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="w-80 bg-white h-full p-6 text-left space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><FiSliders /> Filters</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
              </div>

              <div className="space-y-4">
                
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Cuisine */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cuisine</label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <option value="">All Cuisines</option>
                    {cuisinesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <option value="">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* AI Origin */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Origin</label>
                  <select
                    value={selectedIsAI}
                    onChange={(e) => setSelectedIsAI(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <option value="">All Recipes</option>
                    <option value="true">AI Generated</option>
                    <option value="false">User Created</option>
                  </select>
                </div>

              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => applyFilters(1)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-md"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="w-full border border-slate-100 hover:bg-slate-50 text-slate-500 font-semibold text-sm py-2 px-4 rounded-xl"
              >
                Reset Filters
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
};

export default SearchResults;
