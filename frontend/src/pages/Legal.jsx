import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiFileText, FiInfo, FiChevronRight } from 'react-icons/fi';

const Legal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'privacy';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  const tabs = [
    { id: 'privacy', name: 'Privacy Policy', icon: FiLock, label: 'Data Protection & Privacy' },
    { id: 'terms', name: 'Terms of Service', icon: FiFileText, label: 'Usage Terms & Guidelines' },
    { id: 'cookies', name: 'Cookie Declarations', icon: FiInfo, label: 'Cookie Policy & Storage' },
    { id: 'security', name: 'Security Rules', icon: FiShield, label: 'Platform & API Security' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-left">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-6 mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display">
          Legal &amp; Policy Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review our terms of use, privacy statements, and platform security guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-semibold ${
                  isActive
                    ? 'bg-primary/5 border-primary/20 text-primary shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="block">{tab.name}</span>
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{tab.label}</span>
                  </div>
                </div>
                <FiChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-primary' : 'text-slate-350'}`} />
              </button>
            );
          })}
        </div>

        {/* Dynamic Document Content Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-card p-8 shadow-sm min-h-[500px]">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="prose prose-slate max-w-none text-slate-600 space-y-6"
          >
            {currentTab === 'privacy' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                  <FiLock className="text-primary h-6 w-6" /> Privacy Policy
                </h2>
                <p className="text-sm leading-relaxed">
                  At **RecipeAI**, we respect your privacy and are committed to protecting the personal data you share with us. This policy details how we collect, store, and process your information when you register and interact with our application.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">1. Data We Collect</h3>
                <p className="text-sm leading-relaxed">
                  We collect registration info (your name, email address, password) and profile assets (uploaded pictures saved via Cloudinary). We also record recipe selections, liked dishes, meal plans, and compiled shopping lists to customize your dashboard experience.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">2. Utilization of Information</h3>
                <p className="text-sm leading-relaxed">
                  Your email address is strictly used for account onboarding, security verification code transmissions, and password resets. Your recipe inputs are sent to the Gemini AI API to generate custom recipes on-demand. **We never sell your personal data.**
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">3. Third-Party Connections</h3>
                <ul className="list-disc pl-5 text-sm space-y-1.5 leading-relaxed">
                  <li>**MongoDB Atlas**: Storing your personal account database.</li>
                  <li>**Cloudinary**: Hosting secure profiles images.</li>
                  <li>**Google Gemini API**: Dynamic artificial intelligence recipe parsing.</li>
                </ul>
              </>
            )}

            {currentTab === 'terms' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                  <FiFileText className="text-primary h-6 w-6" /> Terms of Service
                </h2>
                <p className="text-sm leading-relaxed">
                  By accessing and registering an account on **RecipeAI**, you agree to be bound by the following usage terms and constraints.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">1. Proper Use of AI Service</h3>
                <p className="text-sm leading-relaxed">
                  Our recipe generator utilizes Gemini artificial intelligence. You represent that ingredients entered do not contain offensive, harmful, or illicit descriptions. Automated spamming or hitting endpoints maliciously is strictly prohibited.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">2. Limitation of Liability</h3>
                <p className="text-sm leading-relaxed">
                  The generated recipes, ingredients, instructions, and nutritional estimates are provided for information purposes only. AI calculations (like calories or carbs) are estimates. We are not liable for dietary issues, allergic reactions, or cooking mishaps resulting from recipe guides. Always review ingredients before cooking.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">3. Account Ownership</h3>
                <p className="text-sm leading-relaxed">
                  You are responsible for keeping your login credentials confidential. We reserve the right to suspend accounts displaying rate limit anomalies or unauthorized access behaviors.
                </p>
              </>
            )}

            {currentTab === 'cookies' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                  <FiInfo className="text-primary h-6 w-6" /> Cookie Declarations
                </h2>
                <p className="text-sm leading-relaxed">
                  We use cookies and browser storage technologies to maintain secure authentication sessions and enhance user interaction.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">1. Authentication Token Storage</h3>
                <p className="text-sm leading-relaxed">
                  Your JSON Web Tokens (JWT) are securely handled. Short-lived Access Tokens are stored locally on your device, and secure HTTP-Only Refresh Tokens are transmitted via browser cookies for background session renewals.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">2. Functional Storage</h3>
                <p className="text-sm leading-relaxed">
                  Local storage elements are used to persist UI preferences, login state records, and active shopping lists so that your choices are retained even if you reload the webpage.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">3. Opting Out</h3>
                <p className="text-sm leading-relaxed">
                  You can disable cookies and clear local storage via your web browser settings. Note that doing so will sign you out and prevent you from accessing private features (such as generating recipes or saving meal plans).
                </p>
              </>
            )}

            {currentTab === 'security' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                  <FiShield className="text-primary h-6 w-6" /> Security Rules
                </h2>
                <p className="text-sm leading-relaxed">
                  We implement robust, industry-standard security protocols to defend your account credentials and personal recipes against unauthorized exposure.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">1. Password Encryption</h3>
                <p className="text-sm leading-relaxed">
                  All user passwords are encrypted using **bcrypt** (salted hashing) before they are written to the database. We can never see or read your raw passwords.
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">2. Rate Limiting</h3>
                <p className="text-sm leading-relaxed">
                  To protect our servers and Gemini API tokens from abuse, we enforce global rate limiting on all API routes (maximum 100 requests per 15-minute window per IP address).
                </p>
                <h3 className="text-base font-bold text-slate-700 mt-6">3. HTTPS and Communication</h3>
                <p className="text-sm leading-relaxed">
                  All production data sent between Vercel and Render is encrypted using Secure Sockets Layer (SSL/TLS) HTTPS communication. CORS policy is actively enforced to prevent script hijacking from unauthorized sites.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
