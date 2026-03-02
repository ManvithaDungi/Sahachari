import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeAuth, loginWithEmail, signUpWithEmail } from '../services/firebaseService';

export default function LoginScreen() {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [agreed, setAgreed] = useState(false);

   const handleAnonymousLogin = async () => {
      setLoading(true);
      setError('');
      try {
         await initializeAuth();
         // Navigation handled by auth listener in App.jsx
      } catch (err) {
         setError('Failed to sign in anonymously. Please try again.');
         setLoading(false);
      }
   };

   const handleEmailAuth = async (e) => {
      e.preventDefault();
      setError('');

      if (activeTab === 'signup' && password !== confirmPassword) {
         setError('Passwords do not match');
         return;
      }

      if (activeTab === 'signup' && !agreed) {
         setError('Please agree to the disclaimer');
         return;
      }

      setLoading(true);
      try {
         if (activeTab === 'signup') {
            await signUpWithEmail(email, password);
         } else {
            await loginWithEmail(email, password);
         }
         // Navigation handled by auth listener in App.jsx
      } catch (err) {
         console.log(err.code);
         let msg = "Authentication failed";
         if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') msg = "No account found with this email";
         if (err.code === 'auth/wrong-password') msg = "Incorrect password";
         if (err.code === 'auth/email-already-in-use') msg = "Email already in use";
         if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters";
         setError(msg);
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F7FF] font-sans text-text-primary relative overflow-hidden p-4">
         {/* Background Blobs */}
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

         <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 sm:p-10 animate-fade-in-up relative z-10">

            <div className="text-center mb-8">
               <h1 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">Sahachari</h1>
               <p className="text-text-secondary font-medium mb-6">సహచరి</p>

               <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome</h2>
               <p className="text-text-secondary text-sm">Your safe space for women's health awareness</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-primary/5 rounded-full mb-8 relative">
               <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 z-10 ${activeTab === 'login' ? 'bg-white text-primary shadow-sm scale-100' : 'text-text-secondary hover:text-primary/70'
                     }`}
               >
                  Log In
               </button>
               <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 z-10 ${activeTab === 'signup' ? 'bg-white text-primary shadow-sm scale-100' : 'text-text-secondary hover:text-primary/70'
                     }`}
               >
                  Sign Up
               </button>
            </div>

            {/* Error Message */}
            {error && (
               <div className="mb-6 bg-[#B5756B]/10 border border-[#B5756B]/20 rounded-xl px-4 py-3 text-danger text-sm flex items-center gap-2 animate-shake">
                  <span>⚠️</span> {error}
               </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
               <div>
                  <label className="block text-text-secondary text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">Email</label>
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="name@example.com"
                     className="w-full px-5 py-3.5 rounded-2xl bg-white border border-primary/10 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                     required
                  />
               </div>

               <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                     <label className="text-text-secondary text-xs font-bold uppercase tracking-wide">Password</label>
                     {activeTab === 'login' && (
                        <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
                     )}
                  </div>
                  <input
                     type={showPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full px-5 py-3.5 rounded-2xl bg-white border border-primary/10 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                     required
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-4 top-[38px] text-text-secondary/60 hover:text-primary transition-colors"
                  >
                     {showPassword ? '👁️' : '🔒'}
                  </button>
               </div>

               {activeTab === 'signup' && (
                  <>
                     <div>
                        <label className="block text-text-secondary text-xs font-bold uppercase tracking-wide mb-1.5 ml-1">Confirm Password</label>
                        <input
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           placeholder="••••••••"
                           className="w-full px-5 py-3.5 rounded-2xl bg-white border border-primary/10 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                           required
                        />
                     </div>

                     <div className="flex items-start gap-3 mt-2 px-1">
                        <input
                           type="checkbox"
                           id="disclaimer"
                           checked={agreed}
                           onChange={(e) => setAgreed(e.target.checked)}
                           className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary accent-primary cursor-pointer"
                        />
                        <label htmlFor="disclaimer" className="text-xs text-text-secondary leading-tight cursor-pointer select-none">
                           I understand this app provides health information for awareness only, not medical diagnosis.
                        </label>
                     </div>
                  </>
               )}

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5A4AB8] active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
               >
                  {loading ? (
                     <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                     </span>
                  ) : (
                     activeTab === 'login' ? 'Sign In' : 'Create Account'
                  )}
               </button>
            </form>

            <div className="relative my-8">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/10"></div>
               </div>
               <div className="relative flex justify-center text-sm">
                  <span className="bg-[#F8F7FF] px-4 text-text-secondary/60 rounded-full">or</span>
               </div>
            </div>

            {/* Anonymous Login Removed */}
            <p className="text-xs text-text-secondary/60 text-center mt-3">
               Your data stays private.
            </p>
         </div>

         <div className="absolute bottom-6 text-center w-full pointer-events-none">
            <p className="text-[10px] text-text-secondary opacity-40 uppercase tracking-widest">Powered by Google Gemini AI</p>
         </div>
      </div>
   );
}
