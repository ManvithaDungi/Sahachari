import { useState } from 'react';
import { seedFirestore } from '../data/seedDatabase';
import { seedAllPosts } from '../scripts/seedForum';
import { useNavigate } from 'react-router-dom';

export default function AdminSeedScreen() {
   const [loading, setLoading] = useState(false);
   const [logs, setLogs] = useState([]);
   const [error, setError] = useState(null);
   const navigate = useNavigate();

   const handleSeed = async () => {
      if (!window.confirm("Are you sure? This should only be run ONCE on a fresh database.")) return;

      setLoading(true);
      setLogs([]);
      setError(null);

      const result = await seedFirestore();

      if (result.success) {
         try {
            const multiLogs = await seedAllPosts();
            result.logs.push(...multiLogs);
         } catch (err) {
            result.logs.push(`⚠️ Error seeding multilingual posts: ${err.message}`);
         }
         setLogs(result.logs);
      } else {
         setError(result.error);
      }
      setLoading(false);
   };

   return (
      <div className="min-h-screen bg-white p-8 font-sans">
         <div className="max-w-xl mx-auto border-2 border-red-100 rounded-xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Seeder</h1>
            <p className="text-red-500 font-bold mb-6 text-sm uppercase tracking-wider">
               ⚠️ Remove Before Production
            </p>

            <p className="text-gray-600 mb-8 leading-relaxed">
               This tool populates your Firestore database with initial data for
               Forum Topics, Sample Posts, and Home Remedies.
               <br /><br />
               Only run this if your Collections are empty.
            </p>

            <div className="flex flex-col gap-4">
               <button
                  onClick={handleSeed}
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-bold text-white transition-all ${loading
                     ? 'bg-gray-400 cursor-not-allowed'
                     : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                     }`}
               >
                  {loading ? 'Seeding Database...' : 'Seed Firestore Database'}
               </button>

               <button
                  onClick={() => navigate('/home')}
                  className="text-gray-500 hover:text-gray-900 text-sm font-medium mt-2"
               >
                  ← Back to App
               </button>
            </div>

            {error && (
               <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  <strong>Error:</strong> {error}
               </div>
            )}

            {logs.length > 0 && (
               <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">Execution Log:</h3>
                  <ul className="space-y-2">
                     {logs.map((log, index) => (
                        <li key={index} className="text-sm font-mono text-gray-600 flex items-center gap-2">
                           <span className="text-green-500">➜</span> {log}
                        </li>
                     ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                     <p className="text-green-600 font-bold text-center">✨ All done! You can use the app now.</p>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
