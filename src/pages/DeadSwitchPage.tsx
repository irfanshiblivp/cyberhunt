import React, { useState } from 'react';
import { 
  ShieldAlert, Clock, FileText, Volume2, ArrowLeft, Play, Pause, Lock, Zap, CheckCircle2, Copy, AlertTriangle, Radio
} from 'lucide-react';

export const DeadSwitchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'log' | 'audio' | 'terminal'>('log');
  
  // Audio state
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [analyzed, setAnalyzed] = useState<boolean>(false);

  // Decryption terminal input state
  const [channelInput, setChannelInput] = useState('');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionLogs, setDecryptionLogs] = useState<string[]>([]);
  const [decryptedFlag, setDecryptedFlag] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAudioToggle = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleExecuteDecryption = (e: React.FormEvent) => {
    e.preventDefault();
    setDecryptError('');
    setDecryptedFlag(null);
    setDecryptionLogs([]);

    const cleanChannel = channelInput.trim().toUpperCase();
    const cleanPass = passphraseInput.trim().toUpperCase();

    if (cleanChannel !== 'DELTA-9' && cleanChannel !== 'DELTA9') {
      setDecryptError('INVALID CHANNEL: Verified transmission channel from system logs is required (e.g., DELTA-9).');
      return;
    }

    if (cleanPass !== 'DEAD-SWITCH-99' && cleanPass !== 'DEADSWITCH99') {
      setDecryptError('INVALID PASSPHRASE: Decrypted audio signal passphrase is required (e.g., DEAD-SWITCH-99).');
      return;
    }

    setIsDecrypting(true);
    const logs = [
      '[+] Connecting to Robbers\' Dead Man\'s Switch Server...',
      '[+] Validating Transmission Channel DELTA-9...',
      '[+] Channel Signature Verified: ACCESS_GRANTED',
      '[+] Injecting Decryption Passphrase DEAD-SWITCH-99...',
      '[+] Bypassing Secondary Hardware Lock...',
      '[✓] DECRYPTION SUCCESSFUL! Final Evidence Flag Unlocked.'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setDecryptionLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setIsDecrypting(false);
          setDecryptedFlag('X9Q-7MK-42P-L8');
        }
      }, (index + 1) * 600);
    });
  };

  const handleCopyFlag = () => {
    if (decryptedFlag) {
      navigator.clipboard.writeText(`CYBER{${decryptedFlag}}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 font-sans p-4 sm:p-8 relative selection:bg-cyan-500 selection:text-black">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121927]/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-chakra tracking-tight text-white">
                  DEAD MAN'S SWITCH
                </h1>
                <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded text-[10px] font-mono font-bold uppercase">
                  TASK 10 FINAL CORE
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">
                DISTRIBUTED FORENSIC DECRYPTION TERMINAL
              </p>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 font-chakra text-xs font-bold transition-all flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" /> Return to Workspace
          </button>
        </div>

        {/* WORKSTATION HEADER BRIEFING */}
        <div className="bg-[#121927]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-3 font-chakra">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" /> INVESTIGATION BRIEFING & WORKSTATION
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Investigators recovered the robber's final encrypted terminal. To unlock the final evidence flag, you must extract two parameters from the evidence files:
            <strong className="text-cyan-400"> 1. Transmission Channel</strong> from the System Log, and 
            <strong className="text-cyan-400"> 2. Audio Passphrase</strong> by slowing down playback speed in the Audio Signal Analyzer.
          </p>
        </div>

        {/* WORKSTATION TAB CONTROLS */}
        <div className="flex flex-wrap gap-3 font-chakra">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
              activeTab === 'log'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30'
                : 'bg-[#121927] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> 1. System Transmission Log
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
              activeTab === 'audio'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-2 ring-purple-400/30'
                : 'bg-[#121927] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" /> 2. Audio Signal Frequency
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
              activeTab === 'terminal'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/30'
                : 'bg-[#121927] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" /> 3. Override Decryptor Terminal
          </button>
        </div>

        {/* TAB 1: SYSTEM TRANSMISSION LOG */}
        {activeTab === 'log' && (
          <div className="bg-[#0c1017] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-cyan-400 font-bold flex items-center gap-2 font-chakra">
                <FileText className="w-4 h-4" /> TRANSMISSION_LOG_021419.LOG
              </span>
              <span className="text-[10px] text-slate-500">RAW SYSTEM CAPTURE</span>
            </div>

            <div className="bg-black/80 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-slate-300">
              <div className="text-slate-500">[02:11:00] INIT_DAEMON: Server monitoring active on local socket...</div>
              <div className="text-slate-500">[02:12:45] AUTH_CHECK: Master key ping broadcasted.</div>
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-lg text-cyan-300 space-y-1">
                <div className="font-bold text-white">[02:14:19] ALERT: Dead Man's Switch packet broadcast detected!</div>
                <div>TRANSMISSION CHANNEL: <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-black tracking-wider border border-cyan-400">DELTA-9</span></div>
                <div>SIGNAL TYPE: High-Frequency Audio Stream</div>
              </div>
              <div className="text-slate-500">[02:16:45] SYSTEM_IDLE: Session locked. Waiting for override passphrase...</div>
            </div>

            <div className="p-4 bg-[#121927] border border-slate-800 rounded-xl text-slate-300 font-chakra text-xs flex justify-between items-center">
              <div>
                <span className="text-cyan-400 font-bold block">PARAMETER EXTRACTED #1:</span>
                Transmission Channel = <code className="text-white font-mono font-bold bg-black px-2 py-0.5 rounded">DELTA-9</code>
              </div>
              <button
                onClick={() => {
                  setChannelInput('DELTA-9');
                  setActiveTab('audio');
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold rounded-xl transition-all text-xs"
              >
                Use DELTA-9 & Next Step →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO SIGNAL FREQUENCY */}
        {activeTab === 'audio' && (
          <div className="bg-[#0c1017] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-purple-400 font-bold flex items-center gap-2 font-chakra">
                <Volume2 className="w-4 h-4" /> AUDIO_SIGNAL_DELTA9.WAV
              </span>
              <span className="text-[10px] text-slate-500">PLAYBACK SPEED ANALYSIS</span>
            </div>

            <div className="bg-[#121927] p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAudioToggle}
                    className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg transition-all"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-white font-chakra">
                      {isPlayingAudio ? 'PLAYING AUDIO STREAM...' : 'SIGNAL READY'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Current Speed: <strong className="text-purple-300 font-mono">{audioSpeed}x</strong>
                    </div>
                  </div>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-chakra font-bold">Playback Speed:</span>
                  {[0.5, 1.0, 2.0].map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        setAudioSpeed(speed);
                        if (speed === 0.5) setAnalyzed(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                        audioSpeed === speed
                          ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated Waveform Representation */}
              <div className="h-16 bg-black rounded-xl p-3 flex items-center justify-center gap-1 border border-slate-800">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isPlayingAudio
                        ? 'bg-gradient-to-t from-purple-500 to-cyan-400 animate-pulse'
                        : 'bg-slate-800'
                    }`}
                    style={{
                      height: isPlayingAudio
                        ? `${Math.max(15, Math.floor(Math.sin((i + Date.now()/200) * 0.5) * 40 + 40))}%`
                        : `${(i % 5 + 2) * 15}%`
                    }}
                  />
                ))}
              </div>

              {/* Decoded Output Notice */}
              {audioSpeed === 0.5 || analyzed ? (
                <div className="p-4 bg-purple-950/40 border border-purple-500/50 rounded-xl space-y-1 animate-in fade-in duration-300">
                  <div className="text-xs font-bold text-white font-chakra flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SLOW PLAYBACK (0.5x) DECODED SIGNAL:
                  </div>
                  <div className="text-sm font-extrabold text-purple-300 font-mono tracking-wider bg-black/60 p-2 rounded border border-purple-500/30">
                    PASSPHRASE: DEAD-SWITCH-99
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-chakra">
                  ⚠️ Audio plays at high-frequency burst at 1.0x speed. <strong>Set playback speed to 0.5x</strong> to clearly decipher the spoken passphrase.
                </div>
              )}
            </div>

            <div className="p-4 bg-[#121927] border border-slate-800 rounded-xl text-slate-300 font-chakra text-xs flex justify-between items-center">
              <div>
                <span className="text-purple-400 font-bold block">PARAMETER EXTRACTED #2:</span>
                Audio Passphrase = <code className="text-white font-mono font-bold bg-black px-2 py-0.5 rounded">DEAD-SWITCH-99</code>
              </div>
              <button
                onClick={() => {
                  setPassphraseInput('DEAD-SWITCH-99');
                  setActiveTab('terminal');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl transition-all text-xs"
              >
                Use Passphrase & Proceed to Terminal →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: OVERRIDE DECRYPTOR TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="bg-[#0c1017] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-chakra">
              <span className="text-emerald-400 font-bold flex items-center gap-2">
                <Zap className="w-4 h-4" /> DEAD MAN'S SWITCH DECRYPTION TERMINAL
              </span>
              <span className="text-[10px] text-slate-500">FINAL VERIFICATION</span>
            </div>

            <form onSubmit={handleExecuteDecryption} className="space-y-4 font-chakra">
              {decryptError && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{decryptError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">
                    1. Transmission Channel
                  </label>
                  <input
                    type="text"
                    required
                    value={channelInput}
                    onChange={e => setChannelInput(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">
                    2. Decrypted Passphrase
                  </label>
                  <input
                    type="text"
                    required
                    value={passphraseInput}
                    onChange={e => setPassphraseInput(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-purple-300 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isDecrypting}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black font-black text-sm rounded-xl font-chakra uppercase tracking-wider shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                {isDecrypting ? 'Executing Terminal Decryption...' : 'EXECUTE DEAD MAN\'S SWITCH OVERRIDE'}
              </button>
            </form>

            {/* Execution Console Logs */}
            {decryptionLogs.length > 0 && (
              <div className="bg-black p-4 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-xs">
                {decryptionLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('✓') ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* FINAL FLAG RESULT REVEAL */}
            {decryptedFlag && (
              <div className="p-6 bg-[#0c2419] border-2 border-emerald-400 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-300 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1 font-chakra">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    FINAL EVIDENCE FLAG UNLOCKED!
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    Copy and submit this flag into the Task 10 workspace form:
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="px-5 py-3 bg-black border border-emerald-500/50 rounded-xl text-emerald-300 font-mono text-lg font-black tracking-widest select-all shadow-inner">
                    CYBER&#123;{decryptedFlag}&#125;
                  </div>
                  <button
                    onClick={handleCopyFlag}
                    className="p-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-chakra font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
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
