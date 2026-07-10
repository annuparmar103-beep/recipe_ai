import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { motion } from 'framer-motion';
import { 
  FiShoppingCart, FiCalendar, FiDownload, 
  FiCheckSquare, FiSquare, FiList, FiTrash2 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShoppingList = () => {
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [activeList, setActiveList] = useState(null);
  const [historyLists, setHistoryLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const fetchHistoryLists = async () => {
    try {
      const response = await client.get('/shoppinglists');
      setHistoryLists(response.data.shoppingLists);
    } catch (error) {
      console.error('Failed to load past shopping lists:', error);
    }
  };

  useEffect(() => {
    fetchHistoryLists();
  }, []);

  const handleGenerateList = async (e) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Consolidating ingredients from planner...');
    try {
      const response = await client.post('/shoppinglists/generate', {
        startDate,
        endDate,
      });
      setActiveList(response.data.shoppingList);
      toast.success('Shopping list generated successfully!', { id: toastId });
      fetchHistoryLists(); // refresh history
    } catch (error) {
      toast.error(error.response?.data?.message || 'No planned meals found in this date range.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Toggle item checking state inside checklist
  const handleToggleCheckItem = async (index) => {
    if (!activeList) return;

    // Clone ingredients and toggle target checked state
    const updatedIngredients = activeList.ingredients.map((ing, idx) => {
      if (idx === index) {
        return { ...ing, checked: !ing.checked };
      }
      return ing;
    });

    // Update locally
    const updatedList = { ...activeList, ingredients: updatedIngredients };
    setActiveList(updatedList);

    try {
      // Sync check changes to DB in background
      await client.put(`/shoppinglists/${activeList._id}`, {
        ingredients: updatedIngredients,
      });
    } catch (error) {
      console.error('Failed to sync checklist changes:', error);
    }
  };

  // Securely download the PDF as a Blob object URL
  const handleDownloadPDF = async () => {
    if (!activeList) return;

    setPdfDownloading(true);
    const toastId = toast.loading('Preparing PDF document...');
    try {
      const response = await client.get(`/shoppinglists/${activeList._id}/pdf`, {
        responseType: 'blob', // Get binary data
      });

      // Construct browser Blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobURL = URL.createObjectURL(blob);

      // Programmatically trigger download
      const link = document.createElement('a');
      link.href = blobURL;
      link.setAttribute('download', `shopping-list-${activeList._id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(blobURL);
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to export PDF list', { id: toastId });
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleLoadHistoryList = async (listId) => {
    setLoading(true);
    try {
      const response = await client.get(`/shoppinglists/${listId}`);
      setActiveList(response.data.shoppingList);
    } catch (error) {
      toast.error('Failed to load past shopping list');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryList = async (e, listId) => {
    e.stopPropagation();
    try {
      await client.delete(`/shoppinglists/${listId}`);
      toast.success('Shopping list deleted');
      if (activeList?._id === listId) {
        setActiveList(null);
      }
      fetchHistoryLists();
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-left border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          Shopping Lists <FiShoppingCart className="text-primary h-7 w-7" />
        </h1>
        <p className="text-slate-500 text-sm">Generate consolidated shopping guides from scheduled calendars.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Generate Form & History */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Generate Panel */}
          <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <FiCalendar className="text-primary" /> Generate List
            </h3>

            <form onSubmit={handleGenerateList} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Start Date</label>
                <input 
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">End Date</label>
                <input 
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
              >
                {loading ? 'Consolidating...' : 'Compile Checklist'}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <FiList className="text-primary" /> Past Checklists
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {historyLists.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No past lists generated.</div>
              ) : (
                historyLists.map((list) => {
                  const sD = new Date(list.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  const eD = new Date(list.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  return (
                    <div
                      key={list._id}
                      onClick={() => handleLoadHistoryList(list._id)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                        activeList?._id === list._id 
                          ? 'bg-green-50 border-primary/20 text-primary' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-650'
                      }`}
                    >
                      <span>{sD} - {eD}</span>
                      <button 
                        onClick={(e) => handleDeleteHistoryList(e, list._id)}
                        className="text-slate-450 hover:text-red-500 p-0.5"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Checklist view */}
        <div className="lg:col-span-8">
          
          {/* Welcome view */}
          {!activeList && (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-card p-12 text-center py-32 space-y-3">
              <FiShoppingCart className="h-10 w-10 mx-auto text-slate-350" />
              <h3 className="font-bold text-slate-700">No shopping list active</h3>
              <p className="text-xs text-slate-450 max-w-xs mx-auto leading-relaxed">
                Choose start and end dates on the left and click Compile Checklist to consolidate planned ingredients.
              </p>
            </div>
          )}

          {/* Checklist content */}
          {activeList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-card shadow-sm text-left overflow-hidden"
            >
              {/* Header details */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Checklist for {new Date(activeList.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(activeList.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">{activeList.ingredients.length} items consolidated</p>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfDownloading}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <FiDownload /> Export PDF
                </button>
              </div>

              {/* Checklist items list */}
              <div className="p-6 divide-y divide-slate-100">
                {activeList.ingredients.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleCheckItem(idx)}
                    className="flex items-center gap-3 py-3 cursor-pointer text-xs group"
                  >
                    <button className="text-slate-400 group-hover:text-primary transition-colors flex-shrink-0">
                      {item.checked ? (
                        <FiCheckSquare className="text-primary h-5 w-5" />
                      ) : (
                        <FiSquare className="h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <span 
                      className={`font-semibold leading-relaxed transition-all ${
                        item.checked 
                          ? 'line-through text-slate-400' 
                          : 'text-slate-700'
                      }`}
                    >
                      {item.amount} {item.unit} {item.name}
                    </span>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ShoppingList;
