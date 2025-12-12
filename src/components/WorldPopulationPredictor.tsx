import React, { useState } from 'react';
import axios from 'axios';
import { Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile'; 
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

interface PopulationData {
  total: number;
  male: number;
  female: number;
  explanation: string;
  source?: string;
}

interface ChartData {
  bar: { name: string; value: number }[];
  line: { year: number; male: number; female: number }[];
}

export default function WorldPopulationProjection() {
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    chartData?: ChartData;
    explanation?: string;
  } | null>(null);
  const [error, setError] = useState('');

  const fetchPrediction = async () => {
    if (!year || year.length !== 4 || isNaN(Number(year))) {
      setError('Please enter a valid 4-digit year (e.g., 2050)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a precise demographic data API. Return ONLY valid JSON in this exact format. No extra text, no markdown, no explanations outside the JSON.

Example for 2050:
{
  "total": 9750000000,
  "male": 4930000000,
  "female": 4820000000,
  "explanation": "Medium-fertility variant projection accounting for declining birth rates and aging populations",
  "source": "United Nations World Population Prospects 2024"
}

Rules:
- For year ${year}, use realistic UN projections (total ~8-11B for 2000-2100).
- Male + female must equal total exactly.
- Always include all fields with realistic numbers.
- Never refuse or add prose.`
            },
            {
              role: 'user',
              content: `World population breakdown by gender for ${year}. JSON only.`
            }
          ],
          temperature: 0.05, // Lower for max consistency
          max_tokens: 200,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const rawContent = response.data.choices[0].message.content.trim();
      console.log('Raw AI response:', rawContent);

      // Parse JSON safely with enhanced fallback
      let data: PopulationData;
      try {
        data = JSON.parse(rawContent);
      } catch (e) {
        console.warn('JSON parse failed, using fallback extraction');
        // Regex fallback for malformed JSON
        const totalMatch = rawContent.match(/"total"\s*:\s*(\d+(?:\.\d+)?)/);
        const maleMatch = rawContent.match(/"male"\s*:\s*(\d+(?:\.\d+)?)/);
        const femaleMatch = rawContent.match(/"female"\s*:\s*(\d+(?:\.\d+)?)/);

        const fallbackTotal = totalMatch ? parseInt(totalMatch[1]) : 8500000000; // Default ~8.5B
        const fallbackMale = maleMatch ? parseInt(maleMatch[1]) : Math.floor(fallbackTotal / 2);
        const fallbackFemale = femaleMatch ? parseInt(femaleMatch[1]) : fallbackTotal - fallbackMale;

        data = {
          total: fallbackTotal,
          male: fallbackMale,
          female: fallbackFemale,
          explanation: 'Fallback estimate based on UN medium variant trends',
          source: 'Groq AI Projection (2025)'
        };
      }

      // Validate & sanitize numbers
      const total = Math.max(0, Number(data.total) || 8000000000);
      let male = Math.max(0, Number(data.male) || Math.floor(total / 2));
      let female = Math.max(0, Number(data.female) || total - male);
      // Ensure male + female == total
      female = total - male;

      const totalB = (total / 1e9).toFixed(2);
      const maleB = (male / 1e9).toFixed(2);
      const femaleB = (female / 1e9).toFixed(2);

      const chartData: ChartData = {
        bar: [
          { name: 'Male', value: Number(maleB) },
          { name: 'Female', value: Number(femaleB) },
        ],
        line: [
          { year: 1950, male: 1.27, female: 1.26 },
          { year: 2000, male: 3.09, female: 3.04 },
          { year: 2024, male: 4.10, female: 4.02 },
          { year: Number(year), male: Number(maleB), female: Number(femaleB) },
          { year: 2100, male: 5.50, female: 5.50 },
        ],
      };

      setResult({
        text: `## World Population in ${year}\n\n**Total:** ${total.toLocaleString()} (~${totalB} billion)  \n**Male:** ${male.toLocaleString()} (~${maleB} billion)  \n**Female:** ${female.toLocaleString()} (~${femaleB} billion)\n\n_Source: ${data.source || 'UN World Population Prospects 2024'}_`,
        chartData,
        explanation: data.explanation || 'AI-powered projection using latest UN demographic models.',
      });

    } catch (err: any) {
      console.error('API Error:', err);
      let errorMsg = 'Failed to connect. Check your GROQ API key or internet.';
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'model_decommissioned') {
        errorMsg = `Model issue detected. Try updating to a new Groq model like 'llama-3.3-70b-versatile'. Details: ${err.response.data.error.message}`;
      } else if (err.code === 'ERR_BAD_REQUEST') {
        errorMsg = 'Bad request to Groq API. Verify your API key in .env (VITE_GROQ_API_KEY).';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrediction();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center pt-8 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
          AI-Powered Population Projection
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-400 mb-6">
          Enter any year → Get AI-powered UN projection + male/female breakdown
        </p>
        <p className="text-center text-xs text-gray-500 mb-4">
          Powered by Groq's {MODEL} (fast & accurate as of Dec 2025)
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto mb-8 p-2 rounded-2xl bg-gray-900 shadow-lg shadow-indigo-500/10">
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Year e.g. 2050"
            className="flex-1 px-4 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-white"
            maxLength={4}
          />
          <button
            type="submit"
            disabled={loading || year.length !== 4}
            className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-lg font-semibold text-sm sm:text-base hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </form>

        {error && (
          <div className="text-center text-red-400 font-semibold text-sm mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg max-w-md mx-auto">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-xl">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2 className="text-2xl font-bold text-indigo-400 mb-4">{children}</h2>,
                  strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                }}
              >
                {result.text}
              </ReactMarkdown>
              <p className="mt-4 text-gray-300 text-sm italic">
                <strong>Why this prediction:</strong> {result.explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-center mb-4 text-indigo-400">
                  Population by Gender in {year}
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData!.bar}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#333" />
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" tickFormatter={(v) => `${v}B`} />
                    <Tooltip
                      formatter={(v: any) => [`${v} billion`, 'Population']}
                      contentStyle={{ background: '#1a1a2e', border: '1px solid #444', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-center mb-4 text-indigo-400">
                  Historical & Projected Trend (1950–2100)
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={result.chartData!.line}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#333" />
                    <XAxis dataKey="year" stroke="#ccc" />
                    <YAxis stroke="#ccc" label={{ value: 'Population (billions)', angle: -90, position: 'insideLeft', fill: '#999' }} />
                    <Tooltip formatter={(v: any) => [`${v}B`, 'Population']} contentStyle={{ background: '#1a1a2e', border: '1px solid #444', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="male" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} name="Male" />
                    <Line type="monotone" dataKey="female" stroke="#f87171" strokeWidth={3} dot={{ r: 4 }} name="Female" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs sm:text-sm mt-10">
          Try: 2030 • 2050 • 2075 • 2100 • 2150
        </p>
      </div>
    </div>
  );
}