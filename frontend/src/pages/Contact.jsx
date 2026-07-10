import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiMessageSquare, FiSend, FiInbox } from 'react-icons/fi';

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    toast.success(`Message sent successfully! We'll reply to ${data.email} soon.`);
    reset();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-800 font-display">Contact Us</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Have questions, custom feature ideas, or API partnership requests? Drop us a line and our developers will get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-left">
        
        {/* Info Column */}
        <div className="md:col-span-4 bg-white border border-slate-100 p-6 rounded-card shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Support Channels</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3 text-xs leading-relaxed text-slate-650">
              <FiMail className="text-primary h-5 w-5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-850 block">Email Support</span>
                <a href="mailto:support@recipeai.com" className="text-primary hover:underline">support@recipeai.com</a>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-relaxed text-slate-650">
              <FiInbox className="text-primary h-5 w-5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-850 block">Developer Partnerships</span>
                <a href="mailto:api@recipeai.com" className="text-primary hover:underline">api@recipeai.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-8 bg-white border border-slate-100 p-8 rounded-card shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-2">
            <FiMessageSquare className="text-primary" /> Send Feedback
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name</label>
                <input 
                  type="text" 
                  required 
                  {...register('name')}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  {...register('email', {
                    pattern: {
                      value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Invalid email'
                    }
                  })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
              <input 
                type="text" 
                required 
                {...register('subject')}
                placeholder="How can we help?"
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message Description</label>
              <textarea 
                rows="4" 
                required 
                {...register('message')}
                placeholder="Write your feedback details here..."
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <FiSend /> Send Message
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Contact;
