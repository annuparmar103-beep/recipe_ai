import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiHeart, FiBookOpen, FiCpu } from 'react-icons/fi';

const About = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-16 text-left">
      
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800 font-display"
        >
          Our Story
        </motion.h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          RecipeAI was born out of a desire to reduce household food waste, simplify daily meal planning, and provide custom recipe inspirations instantly using cutting-edge AI.
        </p>
      </section>

      {/* Grid of Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-3">
          <div className="h-10 w-10 bg-green-50 text-primary flex items-center justify-center rounded-xl font-bold">
            <FiCpu className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Advanced Gemini AI</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We use Google Gemini APIs to output high-fidelity ingredients steps, cooking difficulties, and estimated preparation times.
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-3">
          <div className="h-10 w-10 bg-amber-50 text-accent flex items-center justify-center rounded-xl font-bold">
            <FiHeart className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Community First</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create public culinary items, leave star reviews, bookmark favorites, and share custom creations with friends.
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-3">
          <div className="h-10 w-10 bg-blue-50 text-blue-500 flex items-center justify-center rounded-xl font-bold">
            <FiBookOpen className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Zero Waste Prep</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our search aggregates group leftovers into meals, consolidates unit metrics, and prints structured PDF checklists.
          </p>
        </div>
      </section>

      {/* CTA Callout */}
      <section className="bg-gradient-to-tr from-green-500 to-green-700 text-white p-8 sm:p-12 rounded-card shadow-premium relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold font-display">Ready to start cooking?</h2>
          <p className="text-xs text-green-50 leading-relaxed">
            Create a profile to schedule weekly meals, download dynamic shopping guides, and receive recipe alerts.
          </p>
        </div>
        <Link to="/register" className="bg-white hover:bg-slate-50 text-primary font-bold text-sm py-2.5 px-5 rounded-xl shadow-md whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5">
          Sign Up Free <FiArrowRight />
        </Link>
      </section>

    </div>
  );
};

export default About;
