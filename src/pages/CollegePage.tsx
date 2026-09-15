import React, { useState, useEffect } from 'react';
import { Search, Shield, ArrowLeft, Archive, RefreshCw, CheckCircle, AlertTriangle, FileText, Building } from 'lucide-react';
import { sounds } from '../components/SoundEngine';

export const CollegePage: React.FC = () => {
  const [visitorIdInput, setVisitorIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visitorResponse, setVisitorResponse] = useState<any>(null);

  // Archive 404 state
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isArchivePath = pathname.includes('ARCH-27') || pathname.includes('arch-27');
  const [isRestored, setIsRestored] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const getTeamId = () => localStorage.getItem('cyber_hunt_team_id') || '';

  // Check initial restoration status
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/college/status', {
        headers: { 'X-Team-Id': getTeamId() }
      });
      const data = await res.json();
      if (data.isRestored) {
        setIsRestored(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVisitorCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsLoading(true);
    setVisitorResponse(null);

    try {
      const res = await fetch('/api/college/visitor-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-Id': getTeamId()
        },
        body: JSON.stringify({
          visitor_id: visitorIdInput.trim(),
          internal_transform: 'ARCH-27',
          client_timestamp: '03:17:42'
        })
      });

      const data = await res.json();
      setIsLoading(false);
      setVisitorResponse(data);

      if (data.status === 'VERIFIED') {
        sounds.playTaskSuccess();
      } else {
        sounds.playClick();
      }
    } catch (e) {
      setIsLoading(false);
      setVisitorResponse({
        found: false,
        error: 'Network Error: Failed to connect to campus visitor server.'
      });
    }
  };

  const handleRestoreRecord = async () => {
    sounds.playClick();
    setRestoreLoading(true);

    try {
      const res = await fetch('/api/college/restore-archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-Id': getTeamId()
        },
        body: JSON.stringify({ reference: 'ARCH-27' })
      });

      const data = await res.json();
      setRestoreLoading(false);
      if (data.success) {
        sounds.playTaskSuccess();
        setIsRestored(true);
        setRestoreSuccess(true);
      }
    } catch (e) {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between p-4 sm:p-8 font-['Outfit',sans-serif] relative">
      
      {/* College Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-200 pb-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-900 flex items-center justify-center text-white shadow-md">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight font-chakra flex items-center gap-2">
              ST. JUDE COLLEGE <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 font-mono font-bold">CAMPUS PORTAL</span>
            </h1>
            <p className="text-xs text-slate-500 font-sans">DEPARTMENT OF CYBERNETICS & INFORMATION SYSTEMS</p>
          </div>
        </div>

        <a
          href="/"
          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Cyber Hunt
        </a>
      </header>

      {/* Main Body */}
      <main className="relative z-10 max-w-xl w-full mx-auto my-8">

        {/* CONDITION 1: IF VISITING ARCH-27 404 PATH (/college/ARCH-27) */}
        {isArchivePath ? (
          <div className="bg-white border-2 border-amber-400 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-sm">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  404 — ARCHIVE RECORD DETECTED
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-chakra mt-1">
                  ARCHIVE RECORD FOUND
                </h2>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Archive Reference:</span>
                <span className="font-extrabold text-slate-900 text-sm">ARCH-27</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Recorded Access:</span>
                <span className="text-slate-700">03:17:42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Archive State:</span>
                <span className={`font-bold ${isRestored ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isRestored ? 'RESTORED & ACTIVE' : 'UNRESTORED / INACTIVE'}
                </span>
              </div>
            </div>

            {restoreSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2 font-sans">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>RECORD ARCH-27 RESTORED SUCCESSFULLY!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  The visitor check-in system database state has been updated. Return to <code className="font-mono font-bold bg-emerald-100 px-1 py-0.5 rounded">/college</code> and check visitor ID <code className="font-mono font-bold bg-emerald-100 px-1 py-0.5 rounded">VST-4821</code> to retrieve the investigation flag.
                </p>
                <a
                  href="/college"
                  className="inline-block mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold rounded-lg shadow-sm"
                >
                  Return to Visitor System (/college) &rarr;
                </a>
              </div>
            ) : (
              <button
                onClick={handleRestoreRecord}
                disabled={restoreLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl font-chakra shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {restoreLoading ? (
                  <span>[ RESTORING RECORD ARCH-27... ]</span>
                ) : (
                  <span>[ RESTORE RECORD ]</span>
                )}
              </button>
            )}
          </div>
        ) : (
          /* CONDITION 2: STANDARD CAMPUS VISITOR SYSTEM (/college) */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            
            <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mx-auto mb-2 shadow-sm">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 font-chakra">
                CAMPUS VISITOR SYSTEM
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Check-in status & visitor access verification
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleVisitorCheck} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                  Visitor ID
                </label>
                  <input
                    type="text"
                    required
                    value={visitorIdInput}
                    onChange={e => setVisitorIdInput(e.target.value)}
                    className="w-full bg-[#0d131f] border border-[#2b3952] focus:border-[#4a648c] rounded-xl px-4 py-3 text-center text-sm font-mono tracking-widest text-[#60a5fa] placeholder-[#3b4c68] focus:outline-none transition-all shadow-inner"
                  />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl font-chakra shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>[ CHECKING STATUS... ]</span>
                ) : (
                  <span>[ CHECK STATUS ]</span>
                )}
              </button>
            </form>

            {/* Result Display */}
            {visitorResponse && (
              <div className="space-y-3 font-mono text-xs pt-2">
                {visitorResponse.status === 'VERIFIED' ? (
                  /* VERIFIED VISITOR RECORD WITH FLAG */
                  <div className="p-5 bg-slate-900 border-2 border-emerald-400 rounded-xl space-y-3 shadow-lg text-slate-100">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">STATUS:</span>
                      <span className="font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        VERIFIED
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-400 text-[10px] uppercase">CASE REFERENCE:</span>
                      <span className="font-extrabold text-amber-300">BANK-03</span>
                    </div>

                    <div className="pt-1 text-center space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                        INVESTIGATION FLAG:
                      </span>
                      <p className="text-xl font-black text-white select-all font-mono tracking-wider bg-slate-950 p-2.5 rounded-lg border border-emerald-500">
                        {visitorResponse.flag || 'Q7mP-82Lx-K4'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* VISITOR NOT FOUND / ARCHIVED UNRESTORED DISPLAY */
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">SYSTEM RESPONSE:</span>
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        VISITOR NOT FOUND
                      </span>
                    </div>

                    <p className="text-slate-600 font-sans text-xs">
                      The campus visitor system could not locate an active record for <code className="font-mono font-bold text-slate-800">{visitorIdInput}</code>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 text-xs font-sans text-slate-400 border-t border-slate-200 max-w-5xl mx-auto w-full">
        ST. JUDE COLLEGE OF CYBERNETICS &bull; CAMPUS INFORMATION SYSTEM
      </footer>
    </div>
  );
};
