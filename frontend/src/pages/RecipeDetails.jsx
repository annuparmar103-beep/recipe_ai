import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipeById, toggleLikeRecipe, toggleFavoriteRecipe, clearCurrentRecipe } from '../redux/slices/recipeSlice';
import client from '../api/client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FiClock, FiActivity, FiThumbsUp, FiHeart, 
  FiMessageSquare, FiStar, FiChevronRight, FiCpu, FiUser 
} from 'react-icons/fi';
import { getRecipeImage } from '../utils/recipeHelper';

const RecipeDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentRecipe, loading } = useSelector((state) => state.recipes);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Review states
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    dispatch(fetchRecipeById(id));
    fetchComments();
    return () => dispatch(clearCurrentRecipe());
  }, [dispatch, id]);

  const fetchComments = async () => {
    try {
      const response = await client.get(`/comments/recipe/${id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like recipes');
      return;
    }
    dispatch(toggleLikeRecipe(id));
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to favorite recipes');
      return;
    }
    dispatch(toggleFavoriteRecipe(id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }

    setSubmittingComment(true);
    try {
      await client.post(`/comments/recipe/${id}`, { content, rating });
      toast.success('Review posted successfully!');
      setContent('');
      setRating(5);
      // Refresh recipe aggregates and comments feed
      dispatch(fetchRecipeById(id));
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !currentRecipe) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-64 bg-slate-100 animate-pulse rounded-card"></div>
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-xl"></div>
        <div className="h-32 bg-slate-50 animate-pulse rounded-card"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* 1. Header Banner Card */}
      <div className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Thumbnail */}
        <div className="md:w-1/2 h-64 md:h-96 bg-slate-150 relative overflow-hidden flex items-center justify-center">
          <img src={getRecipeImage(currentRecipe)} alt={currentRecipe.title} className="h-full w-full object-cover" />
          {currentRecipe.isAI && (
            <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <FiCpu /> AI Generated
            </span>
          )}
        </div>

        {/* Right Side: Header info details */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md">{currentRecipe.cuisine || 'Generic'}</span>
              <span>•</span>
              <span className="capitalize">{currentRecipe.difficulty}</span>
              {currentRecipe.category?.name && (
                <>
                  <span>•</span>
                  <span>{currentRecipe.category.name}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-850 font-display leading-tight">{currentRecipe.title}</h1>
            <p className="text-sm text-slate-500 leading-relaxed">{currentRecipe.description}</p>
            
            {/* Rating summary */}
            <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
              <span className="flex items-center gap-0.5 text-amber-500"><FiStar className="fill-amber-500 h-4.5 w-4.5" /></span>
              <span>{currentRecipe.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="text-slate-450 font-normal">({currentRecipe.commentsCount || 0} reviews)</span>
            </div>
          </div>

          {/* User quick metrics and buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1"><FiClock /> {currentRecipe.totalTime} mins</span>
              <span className="flex items-center gap-1"><FiActivity /> {currentRecipe.calories} kcal</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Like */}
              <button
                onClick={handleLike}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1 text-xs font-bold transition-all shadow-sm ${
                  currentRecipe.isLiked 
                    ? 'bg-blue-50 border-blue-200 text-blue-500' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
                }`}
              >
                <FiThumbsUp /> <span>{currentRecipe.likesCount || 0}</span>
              </button>

              {/* Bookmark Favorite */}
              <button
                onClick={handleFavorite}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
                  currentRecipe.isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-500' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
                }`}
              >
                <FiHeart className={currentRecipe.isFavorite ? 'fill-red-500' : ''} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Recipe details components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Ingredients (Col-span 1) */}
        <div className="md:col-span-1 bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <FiActivity className="text-primary" /> Ingredients
          </h3>
          <ul className="space-y-2 text-xs text-slate-650">
            {currentRecipe.ingredients?.map((ing, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>{ing.amount} {ing.unit} {ing.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps and Instructions (Col-span 2) */}
        <div className="md:col-span-2 bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <FiChevronRight className="text-primary" /> Directions
          </h3>
          <ol className="space-y-4 text-xs text-slate-650">
            {currentRecipe.steps?.map((step, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="h-6 w-6 rounded-full bg-green-50 text-primary border border-green-150 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 shadow-sm">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>

      {/* 3. Review Comments Sections */}
      <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <FiMessageSquare className="text-primary" /> Reviews Feed
        </h3>

        {/* Comments Feed List */}
        <div className="space-y-4">
          {commentsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-card"></div>)}
            </div>
          ) : comments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No reviews left for this recipe yet. Be the first!</div>
          ) : (
            comments.map((item) => (
              <div key={item._id} className="flex gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs">
                {/* User avatar */}
                <div className="flex-shrink-0">
                  {item.user?.profilePicture ? (
                    <img src={item.user.profilePicture} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{item.user?.name?.[0]}</div>
                  )}
                </div>
                {/* Comment data */}
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{item.user?.name}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center text-amber-500 mb-1">
                    {[...Array(item.rating)].map((_, i) => <FiStar key={i} className="fill-amber-500 h-3 w-3" />)}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit review Form */}
        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Your Review</h4>
            
            {/* Stars Rating Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold mr-1.5">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                >
                  <FiStar 
                    className={`h-6 w-6 ${
                      star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-350'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* Comment Textarea */}
            <div>
              <textarea
                rows="3"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this recipe (e.g. adjustments, spice adjustments)..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary bg-slate-50 focus:bg-white transition-all"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submittingComment}
              className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {submittingComment ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-card text-center text-xs text-slate-500">
            Please <Link to="/login" className="text-primary font-bold hover:underline">log in</Link> to write a rating review for this recipe.
          </div>
        )}
      </div>

    </div>
  );
};

export default RecipeDetails;
