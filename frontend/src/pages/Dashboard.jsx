import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { motion } from 'framer-motion';
import { 
  FiBookOpen, FiHeart, FiCalendar, FiShoppingCart, 
  FiCpu, FiArrowRight, FiSmile, FiPlusCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await client.get('/dashboards/user');
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-card border border-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'My Recipes', value: stats?.recipes || 0, icon: FiBookOpen, color: 'bg-green-50 text-primary' },
    { name: 'Favorites', value: stats?.favorites || 0, icon: FiHeart, color: 'bg-amber-50 text-accent' },
    { name: 'Planned Meals', value: stats?.mealPlans || 0, icon: FiCalendar, color: 'bg-blue-50 text-blue-500' },
    { name: 'Shopping Lists', value: stats?.shoppingLists || 0, icon: FiShoppingCart, color: 'bg-purple-50 text-purple-500' },
    { name: 'AI Creations', value: stats?.aiUsage || 0, icon: FiCpu, color: 'bg-indigo-50 text-indigo-500' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          Dashboard <FiSmile className="text-primary h-7 w-7" />
        </h1>
        <p className="text-slate-500 text-sm">Welcome back! Manage your kitchen, meals, and shopping listings.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((item, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white border border-slate-100 p-5 rounded-card shadow-sm text-left flex flex-col justify-between h-32 hover:shadow-md transition-premium"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-500">{item.name}</span>
              <div className={`p-2 rounded-xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: AI Recipe Generator */}
        <div className="bg-white border border-slate-100 rounded-card p-6 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-premium group relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
            <FiCpu className="h-32 w-32" />
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 bg-green-50 text-primary flex items-center justify-center rounded-xl font-bold">
              <FiCpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">AI Recipe Generator</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly create premium recipes using whatever ingredients you have in stock.
            </p>
          </div>
          <Link to="/generate" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
            Generate Recipe <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card 2: Meal Planner */}
        <div className="bg-white border border-slate-100 rounded-card p-6 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-premium group relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
            <FiCalendar className="h-32 w-32" />
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 bg-blue-50 text-blue-500 flex items-center justify-center rounded-xl font-bold">
              <FiCalendar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Weekly Meal Planner</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Schedule breakfasts, lunches, dinners, and snacks. Avoid repeat preps and waste.
            </p>
          </div>
          <Link to="/meal-planner" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:underline">
            Manage Calendar <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card 3: Shopping Lists */}
        <div className="bg-white border border-slate-100 rounded-card p-6 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-premium group relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
            <FiShoppingCart className="h-32 w-32" />
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 bg-purple-50 text-purple-500 flex items-center justify-center rounded-xl font-bold">
              <FiShoppingCart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Shopping Lists</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consolidate lists across multiple planned meals, check off items, and export PDFs.
            </p>
          </div>
          <Link to="/shopping-list" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-purple-500 group-hover:underline">
            View Lists <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
