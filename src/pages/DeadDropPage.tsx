import React, { useState } from 'react';
import { 
  ShieldAlert, Clock, Camera, Landmark, ArrowRightLeft, ArrowLeft, CheckCircle2, Lock, Zap, Copy, AlertTriangle, Key, Sparkles
} from 'lucide-react';

export const DeadDropPage: React.FC = () => {
  // Stage 1: Case code input
  const [caseCodeInput, setCaseCodeInput] = useState('');
  const [stage1Unlocked, setStage1Unlocked] = useState(false);
  const [stage1Error, setStage1Error] = useState('');

  // Stage 2: Task 1 word input
  const [task1WordInput, setTask1WordInput] = useState('');
  const [finalUnlocked, setFinalUnlocked] = useState(false);
  const [stage2Error, setStage2Error] = useState('');
  const [copied, setCopied] = useState(false);

  // Active selection for interactive ordering hint
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  const handleVerifyCaseCode = (e: React.FormEvent) => {
    e.preventDefault();
    setStage1Error('');

    const cleanInput = caseCodeInput.replace(/[\s\:\-\.]/g, '').trim();

    if (cleanInput === '472') {
      setStage1Unlocked(true);
    } else {
      setStage1Error('INCORRECT CASE CODE: Arrange the 3 evidence logs chronologically by timestamp (HH:MM:SS) and extract their numbers in order.');
    }
  };

  const handleCardClick = (id: string) => {
    if (selectedOrder.includes(id)) {
      setSelectedOrder(selectedOrder.filter(item => item !== id));
    } else {
      const next = [...selectedOrder, id];
      setSelectedOrder(next);
    }
  };

  const handleVerifyFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setStage2Error('');

    const cleanWord = task1WordInput.trim();
    const norm = cleanWord.toUpperCase();

    // Task 1 word check: SzdtUS00dk5wLVgy / K7MQ-4VNP-X2 / INVESTIGATE / K7MQ
    const isTask1Valid = (
      cleanWord === 'SzdtUS00dk5wLVgy' ||
      norm.includes('K7MQ') ||
      norm.includes('SZDTUS') ||
      norm.includes('INVESTIGATE')
    );

    if (isTask1Valid) {
      setFinalUnlocked(true);
    } else {
      setStage2Error('INVALID TASK 1 WORD: Enter the word or code recovered from Task 1\'s torn evidence document (e.g., SzdtUS00dk5wLVgy or K7MQ-4VNP-X2).');
    }
  };

  const handleCopyFlag = () => {
    navigator.clipboard.writeText('CYBER{K8Q-4MP-72X}');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 font-sans p-4 sm:p-8 relative selection:bg-cyan-500 selection:text-black">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10 font-chakra">
        {/* Top Navbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121927]/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                  DEAD DROP — THE FINAL EVIDENCE
                </h1>
                <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded text-[10px] font-mono font-bold uppercase">
                  TASK 10 FINAL
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">
                EVIDENCE RECONSTRUCTION TERMINAL (/dead-drop)
              </p>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 text-xs font-bold transition-all flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" /> Return to Workspace
          </button>
        </div>

        {/* STORY BRIEFING BANNER */}
        <div className="bg-[#121927]/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-center space-y-3">
          <p className="text-lg font-bold text-cyan-400 font-mono tracking-wider">
            "Three pieces of evidence were recovered. Only one sequence tells the truth."
          </p>
          <p className="text-xs text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            The investigation has almost reached its end. Three evidence cards were recovered from the robber's account. Notice the timestamps on each card and arrange them <strong>chronologically</strong> to extract the Case Code sequence.
          </p>
        </div>

        {/* 3 EVIDENCE CARDS DISPLAY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* CARD 1: BANK LOG */}
          <div
            onClick={() => handleCardClick('bank')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 text-center relative overflow-hidden ${
              selectedOrder.includes('bank')
                ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-[#121927] border-slate-800 hover:border-slate-700 hover:bg-[#182234]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-chakra">
                BANK LOG
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-slate-800 rounded-lg text-xs font-mono font-bold text-cyan-300 mt-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> 02:14:32
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
              EVIDENCE VALUE: <strong className="text-cyan-400 text-base font-black px-2 py-0.5 bg-cyan-500/20 rounded border border-cyan-500/40">7</strong>
            </div>
          </div>

          {/* CARD 2: CAMERA LOG */}
          <div
            onClick={() => handleCardClick('camera')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 text-center relative overflow-hidden ${
              selectedOrder.includes('camera')
                ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-[#121927] border-slate-800 hover:border-slate-700 hover:bg-[#182234]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-chakra">
                CAMERA LOG
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-slate-800 rounded-lg text-xs font-mono font-bold text-purple-300 mt-2">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> 02:11:48
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
              EVIDENCE VALUE: <strong className="text-purple-400 text-base font-black px-2 py-0.5 bg-purple-500/20 rounded border border-purple-500/40">4</strong>
            </div>
          </div>

          {/* CARD 3: TRANSFER LOG */}
          <div
            onClick={() => handleCardClick('transfer')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 text-center relative overflow-hidden ${
              selectedOrder.includes('transfer')
                ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-[#121927] border-slate-800 hover:border-slate-700 hover:bg-[#182234]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-chakra">
                TRANSFER LOG
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-slate-800 rounded-lg text-xs font-mono font-bold text-emerald-300 mt-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> 02:16:09
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
              EVIDENCE VALUE: <strong className="text-emerald-400 text-base font-black px-2 py-0.5 bg-emerald-500/20 rounded border border-emerald-500/40">2</strong>
            </div>
          </div>
        </div>

        {/* STAGE 1: CASE CODE VERIFICATION FORM */}
        <div className="bg-[#121927]/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" /> STAGE 1 — CHRONOLOGICAL CASE CODE
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              ORDER LOGS BY TIMESTAMP (EARLIEST &rarr; LATEST)
            </span>
          </div>

          <form onSubmit={handleVerifyCaseCode} className="space-y-4">
            {stage1Error && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{stage1Error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={caseCodeInput}
                  onChange={e => setCaseCodeInput(e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl font-chakra uppercase tracking-wider shadow-lg transition-all"
              >
                [ VERIFY CASE CODE ]
              </button>
            </div>
          </form>

          {/* STAGE 1 SUCCESS MESSAGE */}
          {stage1Unlocked && (
            <div className="p-5 bg-[#0f241a] border-2 border-emerald-500/60 rounded-2xl space-y-3 animate-in fade-in duration-300 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-chakra text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> CASE CODE VERIFIED: 472 (CAMERA &rarr; BANK &rarr; TRANSFER)
              </div>
              <div className="p-3 bg-black/70 rounded-xl border border-emerald-500/30 text-amber-300 space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">THE ROBBERS LEFT ONE LAST MESSAGE:</p>
                <p className="text-sm font-bold text-white font-sans">"Use what you recovered first."</p>
              </div>
            </div>
          )}
        </div>

        {/* STAGE 2: FINAL CONNECTION FORM (TASK 1 WORD + CASE CODE) */}
        {stage1Unlocked && (
          <div className="bg-[#121927]/90 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> STAGE 2 — FINAL EVIDENCE RECONSTRUCTION
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                TASK 1 RECOVERED WORD + TASK 10 CODE (472)
              </span>
            </div>

            <form onSubmit={handleVerifyFinal} className="space-y-4">
              {stage2Error && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{stage2Error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">
                  Enter Task 1's Recovered Word / Code
                </label>
                <input
                  type="text"
                  required
                  value={task1WordInput}
                  onChange={e => setTask1WordInput(e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-emerald-300 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm rounded-xl font-chakra uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" /> UNLOCK FINAL COMPETITION FLAG
              </button>
            </form>

            {/* FINAL FLAG REVEAL */}
            {finalUnlocked && (
              <div className="p-6 bg-[#0c2419] border-2 border-emerald-400 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-300 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    CASE CLOSED! THE ROBBERY HAS BEEN RECONSTRUCTED.
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    Copy and submit this final flag to complete the competition:
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="px-6 py-3 bg-black border border-emerald-500/50 rounded-xl text-emerald-300 font-mono text-xl font-black tracking-widest select-all shadow-inner">
                    CYBER&#123;K8Q-4MP-72X&#125;
                  </div>
                  <button
                    onClick={handleCopyFlag}
                    className="p-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Flag'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
