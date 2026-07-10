import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { 
  FiMenu, FiX, FiBell, FiChevronDown, FiUser, 
  FiLogOut, FiLayout, FiBookOpen, FiCalendar, 
  FiShoppingCart, FiHeart, FiShield, FiCheckCircle, FiCpu
} from 'react-icons/fi';
import client from '../api/client';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userDropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await client.get('/notifications');
      setNotifications(response.data.notifications.slice(0, 5)); // show latest 5
      const unread = response.data.notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setShowUserDropdown(false);
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    try {
      await client.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const navLinkClass = ({ isActive }) => 
    `text-sm font-medium transition-colors duration-200 ${
      isActive 
        ? 'text-primary' 
        : 'text-slate-600 hover:text-primary'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary text-white font-extrabold text-lg shadow-md shadow-primary/20">R</span>
              <span className="text-xl font-bold tracking-tight text-slate-800 font-display">
                Recipe<span className="text-primary">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/categories" className={navLinkClass}>Categories</NavLink>
            <NavLink to="/search" className={navLinkClass}>Search</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <FiBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-soft ring-1 ring-black/5 focus:outline-none">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                        <span className="text-sm font-semibold text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead} 
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            <FiCheckCircle /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto mt-2">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id}
                              className={`p-3 rounded-xl mb-1 text-xs transition-colors ${notif.read ? 'text-slate-600 hover:bg-slate-50' : 'bg-green-50/50 text-slate-800 font-medium'}`}
                            >
                              <div className="font-semibold mb-0.5">{notif.title}</div>
                              <div>{notif.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown Profile Toggle */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 rounded-full bg-slate-50 py-1.5 px-3 border border-slate-100 text-sm font-medium hover:bg-slate-100 transition-colors"
                  >
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Avatar" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">{user?.name[0]}</div>
                    )}
                    <span className="text-slate-700 max-w-[100px] truncate">{user?.name}</span>
                    <FiChevronDown className="h-4 w-4 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-soft ring-1 ring-black/5 focus:outline-none">
                      <div className="border-b border-slate-100 px-4 py-2 mb-2 text-xs">
                        <p className="font-bold text-slate-800">{user?.name}</p>
                        <p className="text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FiLayout className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link to="/generate" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FiCpu className="h-4 w-4" /> AI Generator
                      </Link>
                      <Link to="/saved-recipes" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FiBookOpen className="h-4 w-4" /> My Saved Recipes
                      </Link>
                      <Link to="/meal-planner" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FiCalendar className="h-4 w-4" /> Meal Planner
                      </Link>
                      <Link to="/shopping-list" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FiShoppingCart className="h-4 w-4" /> Shopping List
                      </Link>
                      <Link to="/favorites" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FiHeart className="h-4 w-4" /> Favorites
                      </Link>
                      <Link to="/profile" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FiUser className="h-4 w-4" /> Profile Edit
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-primary hover:bg-green-50 font-medium">
                          <FiShield className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <FiLogOut className="h-4 w-4" /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-primary px-3 py-2">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-md px-4 py-2 rounded-xl transition-all">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-xl hover:bg-slate-50"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 px-4 pt-2 pb-4 space-y-1 shadow-inner">
          <NavLink to="/" className="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary">Home</NavLink>
          <NavLink to="/categories" className="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary">Categories</NavLink>
          <NavLink to="/search" className="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary">Search</NavLink>
          <NavLink to="/about" className="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary">About</NavLink>
          <NavLink to="/contact" className="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary">Contact</NavLink>

          {isAuthenticated ? (
            <div className="border-t border-slate-100 pt-4 mt-2">
              <div className="px-3 py-2 mb-2">
                <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <Link to="/dashboard" className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Dashboard</Link>
              <Link to="/generate" className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">AI Generator</Link>
              <Link to="/saved-recipes" className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">My Saved Recipes</Link>
              <Link to="/meal-planner" className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Meal Planner</Link>
              <Link to="/shopping-list" className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Shopping List</Link>
              <Link to="/favorites" className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Favorites</Link>
              <Link to="/profile" className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Profile Settings</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="block rounded-xl px-3 py-2 text-sm text-primary hover:bg-green-50 font-bold">Admin Panel</Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left block rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 mt-2"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-2">
              <Link to="/login" className="text-center block w-full border border-slate-100 rounded-xl px-4 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50">
                Log in
              </Link>
              <Link to="/register" className="text-center block w-full bg-primary hover:bg-primary-dark rounded-xl px-4 py-2 text-base font-semibold text-white shadow-md">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
