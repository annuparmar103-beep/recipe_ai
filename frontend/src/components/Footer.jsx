import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiMail, FiInstagram, FiTwitter, FiFacebook, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const { register, handleSubmit, reset } = useForm();

  const onSubscribe = (data) => {
    toast.success(`Thank you for subscribing to our newsletter, ${data.email}!`);
    reset();
  };

  return (
    <footer className="bg-white border-t border-slate-100 text-slate-600 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 flex items-center justify-center rounded-xl bg-primary text-white font-extrabold text-base shadow-sm">R</span>
              <span className="text-lg font-bold tracking-tight text-slate-800 font-display">
                Recipe<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Unlock a world of infinite cooking possibilities. Enter ingredients, choose cuisine configurations, and let our Gemini AI compose mouthwatering instructions on-demand.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-primary hover:bg-green-50 transition-colors">
                <FiTwitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-primary hover:bg-green-50 transition-colors">
                <FiInstagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-primary hover:bg-green-50 transition-colors">
                <FiFacebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-primary hover:bg-green-50 transition-colors">
                <FiYoutube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 font-display">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home Landing</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/search" className="hover:text-primary transition-colors">Search & Filters</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Story</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 font-display">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Declarations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security Rules</a></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 font-display">Newsletter</h4>
            <p className="text-sm text-slate-500 mb-3">
              Subscribe to get seasonal AI recipe inspirations.
            </p>
            <form onSubmit={handleSubmit(onSubscribe)} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email address"
                  required
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
                <FiMail className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2 px-4 rounded-xl transition-all shadow-md shadow-primary/15"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-slate-100 mt-12 pt-8 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} RecipeAI. All rights reserved. Created with passion for healthy cooking.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
