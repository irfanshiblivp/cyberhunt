import React, { useState } from 'react';
import { Shield, Lock, User, Key, ArrowLeft, CheckCircle, AlertCircle, Building2, Terminal, Check } from 'lucide-react';
import { sounds } from '../components/SoundEngine';

export const BankLoginPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const getTeamId = () => localStorage.getItem('cyber_hunt_team_id') || '';

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsLoading(true);
    setResult(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Team-Id': getTeamId(),
    };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          employee_id: employeeId,
          access_code: accessCode,
          username: employeeId,
          password: accessCode,
          team_id: getTeamId(),
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        sounds.playTaskSuccess();
        setResult(data);
      } else {
        sounds.playError();
        setResult({
          success: false,
          error: data.error || 'Invalid Employee ID or Access Code. Access Denied.',
        });
      }
    } catch (err) {
      setIsLoading(false);
      sounds.playError();
      setResult({
        success: false,
        error: 'Connection Error: Unable to connect to Bank Authentication Server.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between p-4 sm:p-8 font-['Outfit',sans-serif] relative">

      {/* Light Theme Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-300 pb-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2 font-chakra">
              FIRST NATIONAL BANK <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-mono font-bold">SECURE PORTAL</span>
            </h1>
            <p className="text-xs text-slate-500 font-sans">EMPLOYEE & INTERNAL VAULT SYSTEM</p>
          </div>
        </div>

        <a
          href="/"
          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Challenge
        </a>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-md w-full mx-auto my-8">
        {result?.success ? (
          /* SUCCESS STATE: RESTRICTED BANK PORTAL DASHBOARD */
          <div className="bg-white border border-emerald-500 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase">
                  AUTHENTICATION SUCCESSFUL
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-chakra mt-1">
                  INTERNAL VAULT PORTAL ACCESSED
                </h2>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-sans text-xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block font-mono">
                CONFIDENTIAL INTEL RECOVERED:
              </span>
              <p className="text-slate-700 text-xs leading-relaxed">
                SQL Injection vulnerability verified. You have bypassed internal portal authentication and extracted the Task 7 verification flag.
              </p>
            </div>

            {/* Task 7 Flag Output Display */}
            <div className="p-5 bg-slate-900 border-2 border-emerald-400 rounded-xl text-center space-y-1 shadow-inner">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block font-mono">
                TASK 7 VERIFICATION FLAG:
              </span>
              <p className="text-xl font-black text-white select-all tracking-wider font-mono">
                {result.flag || '40A7-3D08-FDD9'}
              </p>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold rounded-xl transition-colors"
            >
              Sign Out / Re-test Portal
            </button>
          </div>
        ) : (
          /* REALISTIC LIGHT THEME BANK LOGIN FORM */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">

            {/* Header / Security Badge */}
            <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mx-auto mb-2 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 font-chakra">
                Bank Staff Authentication
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Sign in with your Employee ID and Access Code
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAuthenticate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl p-3 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" /> Access Code
                </label>
                <input
                  type="password"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl p-3 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl font-chakra shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <span>SIGN IN TO BANK PORTAL</span>
                )}
              </button>
            </form>

            {/* Error Message */}
            {result && !result.success && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-1">
                <div className="flex items-center gap-2 font-bold uppercase">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>AUTHENTICATION FAILED</span>
                </div>
                <p className="text-[11px] text-rose-800">{result.error}</p>
              </div>
            )}

            {/* Subtle Hint */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-center">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block font-mono">
                💡 INVESTIGATOR HINT:
              </span>
              <p className="text-[11px] text-amber-900 font-sans leading-relaxed">
                Test for <strong>Injections</strong> in the login input fields.</p>
            </div>
          </div>
        )}
      </main>

      {/* Light Theme Footer */}
      <footer className="relative z-10 text-center py-2 text-xs font-sans text-slate-400 border-t border-slate-200 max-w-4xl mx-auto w-full">
        &copy; 2026 FIRST NATIONAL BANK &bull; SECURE ONLINE PORTAL
      </footer>
    </div>
  );
};
