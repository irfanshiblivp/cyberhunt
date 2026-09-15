import React, { useState } from 'react';
import { Terminal, Code, Cpu, Eye, FileText, Camera, Send, Zap, Database, ShieldAlert, Image, Lock, Search, Archive, Layers } from 'lucide-react';
import { sounds } from '../SoundEngine';
import { JigsawPuzzle } from './JigsawPuzzle';

interface TaskWorkspaceProps {
  taskNumber: number;
  payload: any;
  teamCode: string;
}

export const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({ taskNumber, payload, teamCode }) => {
  // Task 1 Jigsaw Puzzle Keyword
  const [jigsawKeyword, setJigsawKeyword] = useState(payload?.keyword || 'SzdtUS00dk5wLVgy');

  // Task 3 DOM Inspection
  const [showDom, setShowDom] = useState(false);

  // Task 4 Web Browser URL
  const [urlInput, setUrlInput] = useState('/robots.txt');
  const [browserContent, setBrowserContent] = useState('');
  const [browserLoading, setBrowserLoading] = useState(false);

  // Task 6 EXIF Inspector
  const [showExif, setShowExif] = useState(false);

  // Task 7 Request Builder
  const [headerAgent, setHeaderAgent] = useState('');
  const [headerAuth, setHeaderAuth] = useState('');
  const [reqResponse, setReqResponse] = useState<any>(null);

  // Task 8 Race Condition Ledger
  const [transferAmt, setTransferAmt] = useState('150');
  const [ledgerBalance, setLedgerBalance] = useState(payload?.txState?.balance || 100);
  const [ledgerHistory, setLedgerHistory] = useState<any[]>(payload?.txState?.history || []);
  const [unlockedTransferId, setUnlockedTransferId] = useState('');

  // Task 9 Blind SQL Injection
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResponse, setSqlResponse] = useState<any>(null);

  // Task 10 Black Box Verification
  const [t5TxInput, setT5TxInput] = useState('');
  const [t8TransferInput, setT8TransferInput] = useState('');
  const [t9PasscodeInput, setT9PasscodeInput] = useState('');
  const [layer2KeyInput, setLayer2KeyInput] = useState('');
  const [layer3MasterInput, setLayer3MasterInput] = useState('');
  const [bbResult, setBbResult] = useState<any>(null);

  const getTeamId = () => localStorage.getItem('cyber_hunt_team_id') || '';

  // Task 4: Browser Navigation
  const handleNavigateBrowser = async () => {
    sounds.playClick();
    setBrowserLoading(true);
    try {
      if (urlInput.endsWith('/robots.txt')) {
        const res = await fetch('/api/tasks/4/robots.txt', {
          headers: { 'X-Team-Id': getTeamId() },
        });
        const text = await res.text();
        setBrowserContent(text);
      } else if (urlInput.includes('/evidence-archive-')) {
        const parts = urlInput.split('/evidence-archive-');
        const route = parts[parts.length - 1];
        const res = await fetch(`/api/tasks/4/chamber/${route}`, {
          headers: { 'X-Team-Id': getTeamId() },
        });
        const data = await res.json();
        if (data.found) {
          setBrowserContent(`[200 OK — HIDDEN ARCHIVE ACCESSED]\n\n${data.title}\n===============================\n${data.content}`);
        } else {
          setBrowserContent('HTTP 404 NOT FOUND: The requested evidence directory does not exist.');
        }
      } else {
        setBrowserContent('HTTP 404 NOT FOUND: Route disallowed or unknown.');
      }
    } catch (e) {
      setBrowserContent('Network Error: Could not connect to bank terminal server.');
    } finally {
      setBrowserLoading(false);
    }
  };

  // Task 7: Send Portal Auth Request
  const handleSendRequest = async () => {
    sounds.playClick();
    try {
      const res = await fetch('/api/tasks/7/request-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-Id': getTeamId(),
          'X-Bank-Agent': headerAgent,
          'X-Bank-Auth': headerAuth,
        },
      });
      const data = await res.json();
      setReqResponse(data);
    } catch (e) {
      setReqResponse({ success: false, message: 'Portal Auth Request Failed.' });
    }
  };

  // Task 8: Transfer Money & Race Exploit
  const handleLedgerTransfer = async (isRaceMode = false) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/tasks/8/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-Id': getTeamId(),
        },
        body: JSON.stringify({ amount: transferAmt, isSimultaneous: isRaceMode }),
      });
      const data = await res.json();
      if (data.balance !== undefined) setLedgerBalance(data.balance);
      if (data.transferId) setUnlockedTransferId(data.transferId);

      setLedgerHistory(prev => [
        {
          txId: `TX-${Math.floor(Math.random() * 9000 + 1000)}`,
          type: isRaceMode ? 'SIMULTANEOUS_RACE_TRANSFER' : 'TRANSFER',
          amount: isRaceMode ? Number(transferAmt) * 2 : Number(transferAmt),
          status: data.success ? 'SUCCESS' : 'FAILED',
          message: data.message
        },
        ...prev
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  // Task 9: Blind SQL Query
  const handleExecuteSql = async () => {
    sounds.playClick();
    try {
      const res = await fetch('/api/tasks/9/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-Id': getTeamId(),
        },
        body: JSON.stringify({ query: sqlQuery }),
      });
      const data = await res.json();
      setSqlResponse(data);
    } catch (e) {
      setSqlResponse({ match: false, message: 'Query Execution Failed.' });
    }
  };

  // Task 10: Verify Standalone Multi-Layer Black Box
  const handleVerifyBlackbox = async () => {
    sounds.playClick();
    try {
      const res = await fetch('/api/tasks/10/verify-blackbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-Id': getTeamId(),
        },
        body: JSON.stringify({
          layer1Key: t5TxInput,
          layer2Override: layer2KeyInput
        }),
      });
      const data = await res.json();
      setBbResult(data);
    } catch (e) {
      setBbResult({ success: false, message: 'Verification API Failed.' });
    }
  };

  switch (taskNumber) {
    case 1:
      return (
        <div className="space-y-4">
          <JigsawPuzzle
            targetWord={payload?.keyword || 'SzdtUS00dk5wLVgy'}
            onSolve={(kw) => setJigsawKeyword(kw)}
          />
        </div>
      );

    case 2:
      return (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-4">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Lock className="w-4 h-4" /> EVIDENCE #2 — ENCODED MESSAGE STREAM
            </h4>
            <div className="p-4 bg-slate-950 rounded-lg font-mono text-xs text-amber-300 break-all select-all border border-slate-800 tracking-wider">
              {payload?.encodedTrace || 'QkFOS19TRUNSRVQ='}
            </div>
            <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-xs text-slate-400 font-sans space-y-1">
              <p className="font-bold text-slate-300">Investigators' Note:</p>
              <p>The word from the torn document was not the message itself. It was a key to this encoded string. Identify the encoding format (e.g. Base64) and decode it to recover the Task 2 flag.</p>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <Eye className="w-4 h-4" /> EVIDENCE #3 — WEBPAGE /K7mQ-4vNp-X2
              </span>
              <a
                href="/K7mQ-4vNp-X2"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-cyan-950 border border-cyan-500 hover:bg-cyan-900 text-cyan-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 font-mono"
              >
                Open /K7mQ-4vNp-X2 ↗
              </a>
            </div>

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3">
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono rounded-full font-bold uppercase">
                TARGET URL: /K7mQ-4vNp-X2
              </span>
              <p className="text-xs text-slate-300 max-w-md mx-auto font-sans leading-relaxed pt-2">
                Open page <code className="text-cyan-400 font-bold font-mono">/K7mQ-4vNp-X2</code> in a new tab. It displays "something hidden here".
              </p>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-4 font-chakra">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#131b24] to-[#0b1016] border-2 border-cyan-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                    EVIDENCE #4 — THE HIDDEN ARCHIVE
                  </h4>
                  <p className="text-[11px] text-cyan-400 font-mono font-bold">
                    SECURITY LEVEL: DISCOVERY
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#070d14] border border-cyan-900/50 rounded-xl space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-mono">
                💡 INVESTIGATORS' HINT:
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Sometimes all pages are not visible in standard navigation or search engine indexes.              </p>
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-4 font-chakra">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4" /> EVIDENCE #5 — OBFUSCATED TRANSACTION LOG
            </h4>
            <div className="p-4 bg-slate-950 rounded-lg font-mono text-xs text-amber-300 break-all select-all tracking-wider border border-slate-800">
              {payload?.doubleBase64 || 'VkZKVU1FOUVTVUZVVEVsUFQwWlBUMDA9'}
            </div>
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 font-sans space-y-1.5">
              <p className="font-bold text-slate-200 uppercase text-[11px] tracking-wider font-mono">Transaction Trail Briefing:</p>
              <p>The recovered document contains an intercepted transaction payload. Multiple layers of encoding were applied to conceal the sensitive key stream. Analyze and reverse the encoding transformation to extract the Task 5 flag.</p>
            </div>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-4 font-chakra">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs font-mono">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>EVIDENCE #6: SECURITY CAMERA SNAPSHOT (image.jpg)</span>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-4 text-center">
              <div className="max-w-sm rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-lg p-2">
                <img
                  src="/image.jpg"
                  alt="Security Camera Snapshot (image.jpg)"
                  className="w-full max-h-64 object-contain rounded"
                />
              </div>

              <div className="space-y-3 max-w-md">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  The Investigation Team found a image from their mobile phone.inspect file properties to find the exact time the photo was taken (Format: HH:MM:SS).
                </p>
                <div>
                  <a
                    href="/image.jpg"
                    download="image.jpg"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-bold underline transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Download image.jpg
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 7:
      return (
        <div className="space-y-4 font-chakra">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Send className="w-4 h-4" /> EVIDENCE #7 — BANK INTERNAL SYSTEM (/login)
              </h4>
              <a
                href="/login"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 font-mono shadow-md"
              >
                Open /login Portal ↗
              </a>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono rounded-full font-bold uppercase font-bold">
                TARGET ROUTE: /login
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                The robbers managed to access the bank's internal system. Access <code className="text-cyan-400 font-bold font-mono">/login</code> and find the SQL Injection vulnerability in the staff login form to bypass authentication and retrieve the flag.
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-cyan-900/50 rounded-xl space-y-2 font-mono text-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                💡 INVESTIGATOR HINT:
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Test boolean <strong>SQL Injection</strong> payloads in the Employee ID or Access Code input fields at <code className="text-cyan-400 font-bold font-mono">/login</code>.
              </p>
            </div>
          </div>
        </div>
      );

    case 8:
      return (
        <div className="space-y-4 font-chakra">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Search className="w-4 h-4 text-indigo-400" /> EVIDENCE #8 — THE VISITOR THAT NEVER EXISTED (/college)
              </h4>
              <a
                href="/college"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 font-mono shadow-md"
              >
                Open /college Website ↗
              </a>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="px-2.5 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-mono rounded-full font-bold uppercase">
                TARGET ROUTE: /college &bull; VISITOR ID: VST-4821
              </span>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">RECOVERED LOG ENTRY:</p>
                <p>VISITOR: COLLEGE-WEB | ACCESS: 03:17:42 | IDENTITY: UNKNOWN</p>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                Open <code className="text-cyan-400 font-bold font-mono">/college</code>, enter visitor ID <code className="text-cyan-400 font-bold font-mono">VST-4821</code>, and analyze the HTTP request parameters in DevTools Network tab to discover the internal ID transformation and restore the record.
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-cyan-900/50 rounded-xl space-y-2 font-mono text-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                💡 INVESTIGATOR HINT:
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Open <strong>Chrome/Edge Inspect &rarr; Network tab</strong> while checking visitor ID <code className="text-cyan-400 font-bold font-mono">VST-4821</code> to discover the transformed archive reference and 404 behavior.
              </p>
            </div>
          </div>
        </div>
      );


    case 9:
      return (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-space-900 border border-cyber-cyan/40 space-y-4 font-chakra">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-cyber-cyan" /> TASK 9 — THE VANISHING EMPLOYEE
              </h4>
              <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[10px] font-mono-code font-bold rounded-md uppercase">
                BROWSER STORAGE & RECOVERY LOGIC
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Investigators recovered a damaged employee access report: <strong>EMP-4817</strong>, Department: Operations, Last Access: 02:17:43. Record Status: DELETED. Search for EMP-4817 in the Bank Employee Directory and analyze browser storage & state transitions to recover the record.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/employees"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl font-chakra uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
              >
                <Search className="w-4 h-4" /> Open Employee Directory (/employees)
              </a>
            </div>

            <div className="p-4 bg-space-800/80 border border-slate-800 rounded-xl space-y-2">
              <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] font-mono-code rounded-full font-bold uppercase">
                TARGET ROUTE: /employees &bull; MISSING EMPLOYEE: EMP-4817
              </span>
              <div className="p-3 bg-space-900 rounded-lg border border-slate-800 font-mono-code text-xs text-amber-300 space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">RECOVERED REPORT:</p>
                <p>EMPLOYEE: EMP-4817 | DEPARTMENT: Operations | LAST ACCESS: 02:17:43 | RECORD STATUS: DELETED</p>
              </div>
            </div>

            <div className="p-4 bg-space-800/60 border border-cyan-900/50 rounded-xl space-y-2 font-mono-code text-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                💡 INVESTIGATOR HINT:
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                The application persists search state in browser storage. Inspect Application state and JavaScript behavior using browser DevTools to discover hidden directory modes and recovery mechanisms.
              </p>
            </div>
          </div>
        </div>
      );

    case 10:
      return (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-space-900 border border-cyber-cyan/50 space-y-5 font-chakra shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-cyber-cyan uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" /> TASK 10 — THE FINAL EVIDENCE
              </h4>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono-code font-bold rounded-lg uppercase">
                HARD FINAL INVESTIGATION
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              The investigation has almost reached its end. Three evidence cards were recovered from the robber's account at <strong>/dead-drop</strong>: Bank Log (02:14:32), Camera Log (02:11:48), and Transfer Log (02:16:09). Arrange them chronologically to extract the Case Code, then combine with Task 1's recovered word to unlock the final competition flag.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/dead-drop"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs rounded-xl font-chakra uppercase tracking-wider shadow-lg transition-all flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Open Dead Drop Terminal (/dead-drop) →
              </a>
            </div>

            <div className="p-4 bg-space-800/80 border border-slate-800 rounded-xl space-y-2 font-mono-code text-xs">
              <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] rounded-full font-bold uppercase">
                TARGET ROUTE: /dead-drop &bull; RECOVERED EVIDENCE: 3 LOG CARDS
              </span>
              <div className="p-3 bg-space-900 rounded-lg border border-slate-800 text-amber-300 space-y-1 text-xs">
                <p className="text-[10px] text-slate-400 uppercase font-bold">RECOVERED DEAD DROP NOTE:</p>
                <p>"Three pieces of evidence were recovered. Only one sequence tells the truth."</p>
              </div>
            </div>

            <div className="p-4 bg-space-800/60 border border-cyan-900/50 rounded-xl space-y-2 font-mono-code text-center text-xs">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                💡 INVESTIGATOR HINT:
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                1. Order the 3 logs by timestamp (Camera 02:11:48 &rarr; Bank 02:14:32 &rarr; Transfer 02:16:09). <br/>
                2. Extract the numbers in chronological order to get Case Code <strong>472</strong>. <br/>
                3. Enter Case Code 472 and Task 1's recovered word (<code>SzdtUS00dk5wLVgy</code>) at <code>/dead-drop</code> to unlock final flag <code>K8Q-4MP-72X</code>.
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

