import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Database, RefreshCw, Key, CheckCircle, ArrowLeft } from 'lucide-react';

export const EmployeePage: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [lastSearched, setLastSearched] = useState<string | null>(null);
  const [directoryMode, setDirectoryMode] = useState<string>('standard');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState<any>(null);
  const [recoveryError, setRecoveryError] = useState('');

  // Sync state with localStorage
  const syncStorage = () => {
    const storedSearch = localStorage.getItem('employee_search');
    const storedMode = localStorage.getItem('directory_mode');
    
    if (storedSearch) setLastSearched(storedSearch);
    if (storedMode) setDirectoryMode(storedMode);

    // If both archive mode and EMP-4817 are present, show archive record
    if (storedMode === 'archive' && storedSearch?.trim().toUpperCase() === 'EMP-4817') {
      setSearchResult({
        status: 'ARCHIVED',
        employeeId: 'EMP-4817',
        department: 'Operations',
        recordStatus: 'Deleted',
        lastAccess: '02:17:43',
        recoveryCode: 'R4-91-X'
      });
    } else if (storedSearch?.trim().toUpperCase() === 'EMP-4817') {
      setSearchResult({
        status: 'NOT_FOUND',
        message: 'Employee not found.'
      });
    }
  };

  useEffect(() => {
    // Initial check
    const existingMode = localStorage.getItem('directory_mode');
    if (!existingMode) {
      localStorage.setItem('directory_mode', 'standard');
    }
    syncStorage();

    // Listen for storage changes across DevTools or tabs
    const handleStorageChange = () => syncStorage();
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(syncStorage, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = searchId.trim().toUpperCase();
    if (!cleanInput) return;

    localStorage.setItem('employee_search', cleanInput);
    setLastSearched(cleanInput);
    setRecoverySuccess(null);
    setRecoveryError('');

    const currentMode = localStorage.getItem('directory_mode') || 'standard';

    if (currentMode === 'archive' && cleanInput === 'EMP-4817') {
      setSearchResult({
        status: 'ARCHIVED',
        employeeId: 'EMP-4817',
        department: 'Operations',
        recordStatus: 'Deleted',
        lastAccess: '02:17:43',
        recoveryCode: 'R4-91-X'
      });
    } else {
      setSearchResult({
        status: 'NOT_FOUND',
        message: `Employee ${cleanInput} not found.`
      });
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    const currentMode = localStorage.getItem('directory_mode');
    const currentSearch = localStorage.getItem('employee_search');

    if (currentMode !== 'archive' || currentSearch?.trim().toUpperCase() !== 'EMP-4817') {
      setRecoveryError('RECOVERY FAILED: Browser investigation state invalid. Archive directory mode required.');
      return;
    }

    if (recoveryCodeInput.trim().toUpperCase() === 'R4-91-X') {
      setRecoverySuccess({
        reference: 'CASE-4817',
        flag: 'K7pQ-82Lm-X4'
      });
    } else {
      setRecoveryError('RECOVERY FAILED: Invalid recovery code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 font-sans p-4 sm:p-8 relative selection:bg-cyan-500 selection:text-black">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-[#121927]/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-chakra tracking-tight text-white">
                BANK EMPLOYEE DIRECTORY
              </h1>
              <p className="text-xs font-mono text-cyan-400">
                INTERNAL PERSONNEL RECORD LOOKUP SYSTEM
              </p>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 font-chakra text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Main Search Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Search & Recently Viewed */}
          <div className="space-y-5">
            {/* Search Box */}
            <div className="bg-[#121927]/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-chakra uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" /> SEARCH EMPLOYEE
              </h2>

              <form onSubmit={handleSearch} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl font-chakra uppercase tracking-wider transition-all"
                >
                  Search Directory
                </button>
              </form>
            </div>

            {/* Recently Viewed Panel */}
            <div className="bg-[#121927]/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-chakra">
                RECENTLY VIEWED
              </span>

              {lastSearched ? (
                <div className="p-3 bg-[#090d16] rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Last Searched ID:</span>
                  <div className="text-cyan-400 font-bold">{lastSearched}</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-sans italic">
                  No recently viewed employees.
                </div>
              )}

              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/80">
                Active Directory Mode: <code className="text-amber-400 font-bold">{directoryMode}</code>
              </div>
            </div>
          </div>

          {/* Right Column: Search Results & Recovery Workspace */}
          <div className="lg:col-span-2 space-y-5">
            {/* Search Result Display */}
            <div className="bg-[#121927]/90 border border-slate-800 rounded-2xl p-6 min-h-[220px] flex flex-col justify-center">
              {searchResult?.status === 'ARCHIVED' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold rounded-lg uppercase">
                      ARCHIVED EMPLOYEE RECORD FOUND
                    </span>
                    <span className="text-xs font-mono text-rose-400 font-bold">STATUS: DELETED</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 bg-[#090d16] rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Employee ID</span>
                      <span className="text-white font-bold">{searchResult.employeeId}</span>
                    </div>
                    <div className="p-3 bg-[#090d16] rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Department</span>
                      <span className="text-white font-bold">{searchResult.department}</span>
                    </div>
                    <div className="p-3 bg-[#090d16] rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Last Access</span>
                      <span className="text-white font-bold">{searchResult.lastAccess}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1 font-mono text-xs">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">RECOVERY CODE DETECTED:</span>
                    <div className="text-lg font-black text-amber-300 tracking-wider">
                      {searchResult.recoveryCode}
                    </div>
                  </div>
                </div>
              ) : searchResult?.status === 'NOT_FOUND' ? (
                <div className="text-center py-8 space-y-3 font-chakra">
                  <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
                  <div className="text-lg font-bold text-slate-200">
                    {searchResult.message}
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                    No active record found for specified Employee ID in standard directory mode.
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 font-mono text-xs">
                  Enter an Employee ID above to query the directory database.
                </div>
              )}
            </div>

            {/* Employee Record Recovery Form */}
            {searchResult?.status === 'ARCHIVED' && (
              <div className="bg-[#121927]/90 border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-xl font-chakra">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" /> RECOVER EMPLOYEE RECORD
                  </h3>
                  <span className="text-xs font-mono text-slate-400">STATE: INVESTIGATION ACTIVE</span>
                </div>

                <form onSubmit={handleRecoverySubmit} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      required
                      value={recoveryCodeInput}
                      onChange={e => setRecoveryCodeInput(e.target.value)}
                      className="flex-1 bg-[#090d16] border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all"
                    >
                      Recover Record
                    </button>
                  </div>
                </form>

                {recoveryError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono text-xs">
                    {recoveryError}
                  </div>
                )}

                {recoverySuccess && (
                  <div className="p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 font-mono space-y-3 shadow-2xl animate-in zoom-in-95">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle className="w-5 h-5" /> EMPLOYEE RECORD RECOVERED
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Investigation Reference: <strong className="text-white">{recoverySuccess.reference}</strong></div>
                      <div>Record Owner: <strong className="text-white">EMP-4817 (Operations)</strong></div>
                    </div>
                    <div className="p-3 bg-[#080b12] rounded-xl border border-emerald-500/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">TASK 9 EVIDENCE FLAG:</span>
                      <span className="text-base font-black text-white underline tracking-widest selection:bg-emerald-500 select-all">
                        {recoverySuccess.flag}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
