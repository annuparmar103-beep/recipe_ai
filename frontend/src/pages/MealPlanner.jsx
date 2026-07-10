import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiPlus, FiTrash2, FiActivity, 
  FiClock, FiChevronLeft, FiChevronRight, FiInfo 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MealPlanner = () => {
  const [currentMonday, setCurrentMonday] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  });

  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 (Mon) to 6 (Sun)
  const [selectedSlot, setSelectedSlot] = useState('breakfast');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [portions, setPortions] = useState(2);
  const [saving, setSaving] = useState(false);

  // Generate 7 days dates from starting Monday
  const getWeekDates = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDates = getWeekDates();
  const startDateStr = weekDates[0].toISOString().split('T')[0];
  const endDateStr = weekDates[6].toISOString().split('T')[0];

  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const response = await client.get(`/mealplans?startDate=${startDateStr}&endDate=${endDateStr}`);
      setMealPlans(response.data.mealPlans);
    } catch (error) {
      toast.error('Failed to load meal calendar');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipesList = async () => {
    try {
      const response = await client.get('/recipes?limit=100');
      setRecipes(response.data.recipes);
      if (response.data.recipes.length > 0) {
        setSelectedRecipeId(response.data.recipes[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [currentMonday]);

  useEffect(() => {
    fetchRecipesList();
  }, []);

  const handlePrevWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(d);
  };

  const handleOpenAddModal = (dayOffset, slot) => {
    if (recipes.length === 0) {
      toast.error('You need at least one saved recipe to plan a meal');
      return;
    }
    setSelectedDayOffset(dayOffset);
    setSelectedSlot(slot);
    setPortions(2);
    setShowModal(true);
  };

  const handleAddMealSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    const targetDate = weekDates[selectedDayOffset].toISOString().split('T')[0];
    setSaving(true);
    try {
      await client.post('/mealplans', {
        date: targetDate,
        slot: selectedSlot,
        recipe: selectedRecipeId,
        portions: parseInt(portions, 10),
      });
      toast.success('Meal scheduled successfully!');
      setShowModal(false);
      fetchMealPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule meal');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (planId) => {
    try {
      await client.delete(`/mealplans/${planId}`);
      toast.success('Meal removed from plan');
      fetchMealPlans();
    } catch (error) {
      toast.error('Failed to remove meal');
    }
  };

  // Find meal planned in a slot for a day
  const getPlannedMeal = (dateStr, slot) => {
    return mealPlans.find(plan => {
      const planDate = new Date(plan.date).toISOString().split('T')[0];
      return planDate === dateStr && plan.slot === slot;
    });
  };

  // Sum nutrition for a day
  const calculateDailyNutrition = (dateStr) => {
    let calories = 0;
    mealPlans.forEach(plan => {
      const planDate = new Date(plan.date).toISOString().split('T')[0];
      if (planDate === dateStr && plan.recipe) {
        // Multiply by portions / servings ratio
        const recipeServings = plan.recipe.servings || 4;
        const multiplier = plan.portions / recipeServings;
        calories += Math.round((plan.recipe.calories || 0) * multiplier);
      }
    });
    return calories;
  };

  const slots = ['breakfast', 'lunch', 'dinner', 'snack'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            Meal Planner <FiCalendar className="text-primary h-7 w-7" />
          </h1>
          <p className="text-slate-500 text-sm">Schedule your week's meals and balance daily calories.</p>
        </div>
        
        {/* Week Switcher */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
          <button onClick={handlePrevWeek} className="p-1 rounded-lg hover:bg-slate-50 text-slate-600">
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-slate-700 select-none">
            {weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <button onClick={handleNextWeek} className="p-1 rounded-lg hover:bg-slate-50 text-slate-600">
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Columns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-card"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((dateObj, dayIdx) => {
            const dateStr = dateObj.toISOString().split('T')[0];
            const dailyCal = calculateDailyNutrition(dateStr);
            const isToday = new Date().toDateString() === dateObj.toDateString();

            return (
              <div 
                key={dayIdx}
                className={`bg-white border rounded-card shadow-sm flex flex-col justify-between overflow-hidden text-left ${
                  isToday ? 'border-primary ring-2 ring-primary/10' : 'border-slate-100'
                }`}
              >
                {/* Column header */}
                <div className={`p-3 text-center border-b ${isToday ? 'bg-green-50 text-primary border-green-150' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="block text-xs font-bold uppercase tracking-wider">{dayNames[dayIdx]}</span>
                  <span className="text-lg font-extrabold">{dateObj.getDate()}</span>
                </div>

                {/* Slots content */}
                <div className="p-3 flex-grow space-y-3 min-h-[300px]">
                  {slots.map((slot) => {
                    const plan = getPlannedMeal(dateStr, slot);
                    return (
                      <div key={slot} className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">{slot}</span>
                        
                        {plan ? (
                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-xl text-[10px] space-y-1 relative group">
                            <h4 className="font-bold text-slate-800 line-clamp-1 hover:text-primary leading-tight">
                              <Link to={`/recipes/${plan.recipe?._id}`}>{plan.recipe?.title}</Link>
                            </h4>
                            <div className="flex justify-between items-center text-slate-500 font-semibold">
                              <span>Portions: {plan.portions}</span>
                              <button 
                                onClick={() => handleDeleteMeal(plan._id)}
                                className="text-slate-400 hover:text-red-500 p-0.5"
                              >
                                <FiTrash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAddModal(dayIdx, slot)}
                            className="w-full py-2 border border-dashed border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50 text-[10px] font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                          >
                            <FiPlus /> Add Meal
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column Footer: Nutrition Sum */}
                <div className="p-3 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>Day Total</span>
                  <span className="flex items-center gap-0.5 text-slate-800 font-extrabold"><FiActivity className="text-primary" /> {dailyCal} kcal</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog: Add Meal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-100 p-6 rounded-card shadow-premium space-y-6 text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FiCalendar className="text-primary" /> Schedule Meal
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-650 font-bold">X</button>
            </div>

            <form onSubmit={handleAddMealSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portion Sizes (Servings)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={portions}
                  onChange={(e) => setPortions(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Choose Recipe</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none"
                >
                  {recipes.map((r) => (
                    <option key={r._id} value={r._id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? 'Scheduling...' : 'Add to Plan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default MealPlanner;
