import { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Search, MapPin, Briefcase, ExternalLink, Loader2, Users, Building2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Candidate {
  name: string;
  headline: string;
  location: string;
  profileUrl: string;
  skills: string[];
}

export default function App() {
  const [query, setQuery] = useState('Job seekers in Bagalkot district');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCandidates = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find public LinkedIn profiles and professional details of job seekers or professionals currently in Bagalkot district, Karnataka. Search for people with headlines like "Looking for opportunities", "Software Engineer", "Mechanical Engineer", "Graduate", etc. in Bagalkot. Query: ${query}`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    location: { type: Type.STRING },
                    profileUrl: { type: Type.STRING },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["name", "headline", "location", "profileUrl"]
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{"candidates": []}');
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Bagalkot <span className="text-blue-600">Talent</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Recruitment Portal</span>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            Find Your Next Hire in <span className="text-blue-600">Bagalkot</span>
          </motion.h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for local talent, graduates, and experienced professionals across Bagalkot district using AI-powered search.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCandidates()}
              placeholder="e.g. Software Engineers in Bagalkot..."
              className="block w-full pl-11 pr-32 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            />
            <button
              onClick={searchCandidates}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Search
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['Graduates', 'Engineers', 'Teachers', 'Sales'].map((tag) => (
              <button
                key={tag}
                onClick={() => { 
                  const newQuery = `${tag} in Bagalkot`;
                  setQuery(newQuery);
                }}
                className="text-xs font-medium px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center">
              {error}
            </div>
          )}

          {!loading && candidates.length === 0 && !error && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No candidates found yet</h3>
              <p className="text-gray-500">Try searching for specific roles or skills in Bagalkot.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {candidates.map((candidate, idx) => (
                <motion.div
                  key={candidate.profileUrl + idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{candidate.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {candidate.location}
                        </div>
                      </div>
                    </div>
                    <a
                      href={candidate.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{candidate.headline}</span>
                    </div>
                  </div>

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="text-[10px] font-bold text-gray-400 px-2 py-1">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 Bagalkot Talent Portal. Powered by Google AI Studio.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs font-medium text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
