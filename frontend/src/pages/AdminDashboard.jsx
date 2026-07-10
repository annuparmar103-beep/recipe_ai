import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { 
  FiShield, FiUsers, FiBookOpen, FiGrid, 
  FiMessageSquare, FiHeart, FiPlus, FiTrash2, FiSearch 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(true);

  // Form State
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Table search State
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminStats = async () => {
    try {
      const response = await client.get('/dashboards/admin');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load global statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipesList = async () => {
    setRecipesLoading(true);
    try {
      const response = await client.get('/recipes?limit=50');
      setRecipes(response.data.recipes);
    } catch (error) {
      toast.error('Failed to load recipe table');
    } finally {
      setRecipesLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchRecipesList();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim() || !categoryDesc.trim()) return;

    setCreatingCategory(true);
    try {
      await client.post('/categories', {
        name: categoryName,
        description: categoryDesc,
      });
      toast.success('Category created successfully!');
      setCategoryName('');
      setCategoryDesc('');
      fetchAdminStats(); // refresh category stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await client.delete(`/recipes/${recipeId}`);
      toast.success('Recipe deleted successfully');
      fetchRecipesList();
      fetchAdminStats(); // update recipe count metrics
    } catch (error) {
      toast.error('Failed to delete recipe');
    }
  };

  // Filter recipes inside table
  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

  if (loading || !dashboardData) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-card"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboardData.metrics;
  const charts = dashboardData.charts;

  const statCards = [
    { name: 'Total Users', value: metrics.users, icon: FiUsers, color: 'bg-green-50 text-primary' },
    { name: 'Total Recipes', value: metrics.recipes, icon: FiBookOpen, color: 'bg-blue-50 text-blue-500' },
    { name: 'Categories', value: metrics.categories, icon: FiGrid, color: 'bg-amber-50 text-accent' },
    { name: 'Comments', value: metrics.comments, icon: FiMessageSquare, color: 'bg-purple-50 text-purple-500' },
    { name: 'Favorites', value: metrics.favorites, icon: FiHeart, color: 'bg-red-50 text-red-500' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-left space-y-1 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          Admin Console <FiShield className="text-primary h-7 w-7" />
        </h1>
        <p className="text-slate-500 text-sm">Monitor platform metrics, customize categories, and manage recipes.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-100 p-5 rounded-card shadow-sm text-left flex flex-col justify-between h-32 hover:shadow-md transition-premium"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-500 font-display">{item.name}</span>
              <div className={`p-2 rounded-xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Registrations Trend */}
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Registrations Trend (Users)</h3>
          <div className="h-64 text-xs font-semibold">
            {charts.registrationsTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.registrationsTrend}>
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Categories Distribution</h3>
          <div className="h-64 text-xs font-semibold">
            {charts.categoryDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {charts.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Creation Ratio */}
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Recipe Creation Origin</h3>
          <div className="h-64 text-xs font-semibold">
            {charts.creationSources.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.creationSources}>
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Category Creation & Recipe Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Category Form */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <FiPlus className="text-primary" /> Create Category
          </h3>
          
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
              <input
                type="text"
                required
                placeholder="Italian, Desserts, Vegan"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea
                rows="3"
                required
                placeholder="A short description..."
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-primary"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={creatingCategory}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md"
            >
              {creatingCategory ? 'Creating...' : 'Submit Category'}
            </button>
          </form>
        </div>

        {/* Recipes Manager Table */}
        <div className="lg:col-span-8 bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Recipe Administration</h3>
            
            {/* Search filter */}
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Search recipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
              <FiSearch className="absolute left-3 top-2.5 text-slate-400 h-3.5 w-3.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            {recipesLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading recipe table...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No recipes matching search query.</div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 border-b border-slate-100 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4 text-center">Views</th>
                    <th className="py-3 px-4 text-center">Likes</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650">
                  {filteredRecipes.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-[200px] truncate">{r.title}</td>
                      <td className="py-3 px-4 truncate max-w-[120px]">{r.author?.name || 'Admin'}</td>
                      <td className="py-3 px-4 text-center">{r.views}</td>
                      <td className="py-3 px-4 text-center">{r.likesCount}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteRecipe(r._id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
