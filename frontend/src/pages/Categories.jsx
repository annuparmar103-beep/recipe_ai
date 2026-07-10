import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/slices/recipeSlice';
import { motion } from 'framer-motion';
import { FiChevronRight, FiGrid } from 'react-icons/fi';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.recipes);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-card border border-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          Browse Categories <FiGrid className="text-primary h-6 w-6" />
        </h1>
        <p className="text-slate-500 text-sm">Select a category to filter customized chef and community creations.</p>
      </div>

      {categories.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          No categories added yet. Check back soon!
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              variants={itemVariants}
              className="bg-white border border-slate-100 p-6 rounded-card shadow-sm text-left flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-premium group"
            >
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-green-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center font-extrabold text-lg uppercase shadow-sm">
                  {cat.name[0]}
                </div>
                <h3 className="font-bold text-slate-800 text-base group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{cat.description}</p>
              </div>
              <Link 
                to={`/search?category=${cat._id}`} 
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline"
              >
                Browse Recipes <FiChevronRight />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
};

export default Categories;
