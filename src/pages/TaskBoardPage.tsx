import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, Award, CheckCircle2, Lock, Flag, AlertTriangle, 
  LogOut, Volume2, VolumeX, PauseCircle, ChevronRight, Zap, Target, Sparkles, LockKeyhole
} from 'lucide-react';
import { TaskWorkspace } from '../components/tasks/TaskWorkspace';
import { CrewmateAvatar } from '../components/CrewmateAvatar';
import { sounds } from '../components/SoundEngine';

interface TaskBoardPageProps {
  team: any;
  gameState: any;
  onLogout: () => void;
}

export const TaskBoardPage: React.FC<TaskBoardPageProps> = ({ team, gameState, onLogout }) => {
  const [tasksProgress, setTasksProgress] = useState<any[]>([]);
  const [selectedTaskNumber, setSelectedTaskNumber] = useState<number>(1);
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const [flagInput, setFlagInput] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.muted);

  // Completion Modal State
  const [completedModal, setCompletedModal] = useState<any>(null);

  const getTeamId = () => localStorage.getItem('cyber_hunt_team_id') || team?.id || '';
  const getSessionToken = () => localStorage.getItem('cyber_hunt_session_token') || '';

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/team/me', {
        headers: { 
          'X-Team-Id': getTeamId(),
          'X-Session-Token': getSessionToken()
        },
      });
      const data = await res.json();
      if (res.status === 403 && data.sessionTerminated) {
        alert(data.error || "SESSION TERMINATED: Another device has logged into this team account.");
        onLogout();
        return;
      }
      if (res.ok) {
        const progressList = data.progress || [];
        setTasksProgress(progressList);

        // Auto-select first unlocked incomplete task on initial load if not selected
        setSelectedTaskNumber(prev => {
          const currentProgress = progressList.find((p: any) => p.number === prev);
          if (currentProgress && currentProgress.is_unlocked) {
            return prev;
          }
          const active = progressList.find((p: any) => p.is_unlocked && !p.is_completed);
          if (active) return active.number;
          const highestUnlocked = [...progressList].reverse().find((p: any) => p.is_unlocked);
          return highestUnlocked ? highestUnlocked.number : 1;
        });
      }
    } catch (e) {
      console.error('Failed to load team progress:', e);
    }
  };

  const fetchTaskDetail = async (taskNum: number) => {
    try {
      const res = await fetch(`/api/tasks/${taskNum}`, {
        headers: { 
          'X-Team-Id': getTeamId(),
          'X-Session-Token': getSessionToken()
        },
      });
      const data = await res.json();
      if (res.status === 403 && data.sessionTerminated) {
        alert(data.error || "SESSION TERMINATED: Another device has logged into this team account.");
        onLogout();
        return;
      }
      if (res.ok) {
        setTaskDetail(data);
      } else {
        setTaskDetail(null);
      }
    } catch (e) {
      console.error('Failed to load task details:', e);
      setTaskDetail(null);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  useEffect(() => {
    if (selectedTaskNumber) {
      fetchTaskDetail(selectedTaskNumber);
      setFlagInput('');
      setSubmitError('');
    }
  }, [selectedTaskNumber]);

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setSubmitError('');

    if (!flagInput.trim()) {
      setSubmitError('Please enter a valid flag token.');
      sounds.playError();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTaskNumber}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-Id': getTeamId(),
          'X-Session-Token': getSessionToken(),
        },
        body: JSON.stringify({ flag: flagInput.trim() }),
      });

      const data = await res.json();

      if (res.status === 403 && data.sessionTerminated) {
        alert(data.error || "SESSION TERMINATED: Another device has logged into this team account.");
        onLogout();
        return;
      }

      if (!res.ok) {
        setSubmitError(data.message || 'ACCESS DENIED: The submitted flag is incorrect.');
        sounds.playError();
      } else {
        sounds.playTaskSuccess();
        setCompletedModal(data);
        await fetchProgress();
        await fetchTaskDetail(selectedTaskNumber);
      }
    } catch (e) {
      setSubmitError('Submission failed due to server communication error.');
      sounds.playError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSound = () => {
    sounds.muted = !sounds.muted;
    setIsMuted(sounds.muted);
    sounds.playClick();
  };

  const completedCount = tasksProgress.filter(p => p.is_completed).length;
  const progressPercent = Math.round((completedCount / 10) * 100);
  const currentTaskProgress = tasksProgress.find(p => p.number === selectedTaskNumber);
  const teamColor = team?.color || 'cyan';

  return (
    <div className="min-h-screen relative z-10 flex flex-col p-3 sm:p-6 max-w-7xl mx-auto space-y-5 bg-space-900 text-slate-100 font-sans">
      
      {/* Background Cyber Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyber-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyber-neon/10 rounded-full blur-3xl"></div>
      </div>

      {/* GAME PAUSED OVERLAY */}
      {gameState.status === 'PAUSED' && (
        <div className="fixed inset-0 z-50 bg-space-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center border-2 border-amber-500/30">
          <PauseCircle className="w-20 h-20 text-amber-400 animate-pulse mb-4" />
          <h2 className="text-4xl font-black text-amber-300 font-chakra uppercase tracking-wider drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            MISSION PAUSED BY CONTROL
          </h2>
          <p className="text-slate-300 font-semibold max-w-lg mt-3 font-chakra text-sm sm:text-base leading-relaxed">
            MISSION CONTROL HAS TEMPORARILY PAUSED THE CYBER HUNT. SUSPEND ALL CHALLENGES UNTIL RESUMED.
          </p>
        </div>
      )}

      {/* TOP HEADER BAR - Cyber Theme */}
      <div className="glass-panel-glow rounded-2xl p-4 sm:p-5 border border-cyber-cyan/40 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden z-10">
        <div className="flex items-center gap-4">
          <div className="p-1 rounded-xl bg-space-800 border border-cyber-cyan/30 shadow-lg">
            <CrewmateAvatar color={teamColor} size={44} animated={false} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-black text-white font-chakra tracking-tight drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                CYBER HUNT '26
              </h1>
              <span className="px-2.5 py-0.5 bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan rounded-md text-[11px] font-mono-code font-bold uppercase tracking-wider">
                {team?.team_code || 'DEMO'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300 font-chakra">
              <span>TEAM: <strong className="text-white font-extrabold">{team?.team_name || 'Cyber Squad'}</strong></span>
            </div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-3 font-mono-code">
          <div className="px-4 py-2 bg-space-800/90 rounded-xl border border-cyber-cyan/30 flex items-center gap-2.5 shadow-inner">
            <Clock className="w-4 h-4 text-cyber-cyan animate-pulse" />
            <span className="text-[11px] text-slate-400 font-bold uppercase">TIME:</span>
            <span className="text-sm font-extrabold text-cyber-cyan tracking-wider">{gameState.elapsed_time || '00:00:00'}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-space-800 border border-slate-700 hover:border-cyber-cyan text-slate-300 hover:text-cyber-cyan transition-all shadow-md"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyber-cyan" />}
          </button>

          <button
            onClick={() => { sounds.playClick(); onLogout(); }}
            className="px-4 py-2 rounded-xl bg-space-800 border border-slate-700 hover:border-rose-500/80 text-slate-300 hover:text-rose-400 font-chakra text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5" /> Leave
          </button>
        </div>
      </div>

      {/* SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1 relative z-10">
        
        {/* LEFT COLUMN: SEQUENTIAL TASK DIRECTORY */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 font-chakra border border-cyber-cyan/20 flex flex-col justify-between">
          <div>
            {/* Room Progress Box */}
            <div className="bg-space-800/80 p-4 rounded-xl border border-slate-800 space-y-2.5 mb-4 shadow-inner">
              <div className="flex justify-between items-center text-xs font-bold font-chakra">
                <span className="text-slate-300 uppercase tracking-wider">PROGRESS</span>
                <span className="text-cyber-neon font-mono-code">{completedCount} / 10 SOLVED</span>
              </div>
              <div className="w-full h-3 bg-space-900 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyber-neon rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-center font-mono-code pt-0.5">
                {progressPercent === 100 ? '🎉 MISSION FULLY ACCOMPLISHED!' : `${10 - completedCount} tasks remaining to reach target`}
              </div>
            </div>

            {/* Task List Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5 font-chakra">
                <Target className="w-3.5 h-3.5" /> TASK DIRECTORY
              </span>
              <span className="text-[10px] text-slate-400 font-mono-code font-semibold">SEQUENTIAL UNLOCK</span>
            </div>

            {/* Tasks Accordion List */}
            <div className="space-y-2">
              {[...tasksProgress].sort((a, b) => a.number - b.number).map((tp) => {
                const isSelected = tp.number === selectedTaskNumber;
                const isLocked = !tp.is_unlocked;
                const isCompleted = tp.is_completed;

                return (
                  <div key={tp.number} className="relative group">
                    <button
                      disabled={isLocked}
                      onClick={() => { 
                        if (!isLocked) {
                          sounds.playClick(); 
                          setSelectedTaskNumber(tp.number); 
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-space-700/90 border-cyber-cyan text-white font-bold shadow-[0_0_15px_rgba(0,243,255,0.25)] ring-1 ring-cyber-cyan/50'
                          : isCompleted
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                          : isLocked
                          ? 'bg-space-900/60 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-60'
                          : 'bg-space-800/60 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-space-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0">
                          {isCompleted ? (
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold text-xs">
                              ✓
                            </span>
                          ) : isSelected ? (
                            <span className="w-6 h-6 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan flex items-center justify-center font-bold text-xs animate-pulse">
                              {tp.number}
                            </span>
                          ) : isLocked ? (
                            <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center text-xs">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-lg bg-space-900 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs">
                              {tp.number}
                            </span>
                          )}
                        </div>

                        <div className="truncate min-w-0">
                          <div className={`font-extrabold text-xs truncate ${isSelected ? 'text-white' : isCompleted ? 'text-emerald-300' : isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
                            Task {tp.number}. {tp.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono-code">
                            <span className={isLocked ? 'text-slate-600' : 'text-slate-400'}>
                              {isLocked ? `🔒 Locked` : `Diff: ${tp.difficulty}`}
                            </span>
                            {isCompleted && (
                              <span className="text-emerald-400 font-bold">
                                ✓ SOLVED ({tp.time_from_start || (tp.completed_at ? new Date(tp.completed_at).toLocaleTimeString() : 'DONE')})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && !isLocked && (
                        <ChevronRight className="w-4 h-4 text-cyber-cyan shrink-0 animate-pulse" />
                      )}
                    </button>

                    {/* Locked tooltip on hover */}
                    {isLocked && (
                      <div className="hidden group-hover:block absolute left-full ml-2 top-1/2 -translate-y-1/2 z-30 px-3 py-1.5 bg-space-900 border border-rose-500/40 text-rose-300 text-xs font-mono-code rounded-lg shadow-xl whitespace-nowrap">
                        🔒 Complete Task {tp.number - 1} first to unlock!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono-code text-center">
            CYBER HUNT '26 PROTOCOL
          </div>
        </div>

        {/* RIGHT COLUMN: TASK BRIEFING & CHALLENGE WORKSPACE */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-5 sm:p-6 space-y-6 border border-cyber-cyan/20 flex flex-col justify-between">
          {taskDetail && taskDetail.task ? (
            <>
              <div className="space-y-5">
                {/* Task Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan text-xs font-mono-code font-bold rounded-lg uppercase tracking-wider">
                        TASK {String(taskDetail.task.number).padStart(2, '0')}
                      </span>
                      <span className={`text-xs font-extrabold uppercase font-chakra px-2.5 py-1 rounded-lg border ${
                        currentTaskProgress?.is_completed 
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' 
                          : 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
                      }`}>
                        STATUS: {currentTaskProgress?.is_completed ? 'SOLVED & VERIFIED' : 'IN PROGRESS'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white font-chakra mt-2 tracking-tight">
                      {taskDetail.task.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono-code mt-1">
                      {taskDetail.task.subtitle} — Difficulty: <span className="text-amber-400 font-bold">{taskDetail.task.difficulty}</span>
                    </p>
                  </div>
                </div>

                {/* Challenge Workspace Component */}
                <div className="bg-space-800/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-inner">
                  <TaskWorkspace
                    taskNumber={selectedTaskNumber}
                    payload={taskDetail.payload}
                    teamCode={team?.team_code || 'DEMO'}
                  />
                </div>
              </div>

              {/* FLAG SUBMISSION FORM CARD */}
              <div className="bg-space-800/90 border border-cyber-cyan/30 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xl font-chakra mt-4">
                <form onSubmit={handleFlagSubmit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Flag className="w-4 h-4 text-cyber-cyan animate-bounce" /> SUBMIT EVIDENCE FLAG
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        disabled={currentTaskProgress?.is_completed}
                        value={flagInput}
                        onChange={e => setFlagInput(e.target.value)}
                        className="w-full bg-space-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono-code text-cyber-cyan placeholder-slate-500 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan focus:outline-none disabled:opacity-60 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={currentTaskProgress?.is_completed || isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl font-chakra uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all shrink-0 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      {isSubmitting ? 'Verifying...' : 'Submit Flag'}
                    </button>
                  </div>
                </form>

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono-code text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{submitError}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 font-chakra space-y-3">
              <LockKeyhole className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <div className="text-lg font-bold text-slate-300">
                {tasksProgress.find(p => p.number === selectedTaskNumber)?.is_unlocked === false
                  ? `Task ${selectedTaskNumber} is Locked`
                  : 'Loading Task Briefing...'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-mono-code">
                {tasksProgress.find(p => p.number === selectedTaskNumber)?.is_unlocked === false
                  ? `You must solve Task ${selectedTaskNumber - 1} and submit its flag before Task ${selectedTaskNumber} unlocks.`
                  : 'Fetching mission parameters from server...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TASK COMPLETED MODAL */}
      {completedModal && (
        <div className="fixed inset-0 z-50 bg-space-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 text-center space-y-5 border-2 border-emerald-500 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(57,255,20,0.4)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white font-chakra tracking-tight">
                FLAG VERIFIED!
              </h2>
              <p className="text-xs text-emerald-400 font-mono-code font-bold uppercase tracking-wider">
                EVIDENCE SUCCESSFULLY LOGGED & DECRYPTED
              </p>
            </div>

            <div className="p-4 bg-space-800/90 rounded-2xl border border-slate-800 font-mono-code space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>Task Solved:</span>
                <span className="text-white font-bold">Task {selectedTaskNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Submission Time:</span>
                <span className="text-cyber-cyan font-bold">{completedModal.timeFromStart || (completedModal.completedAt ? new Date(completedModal.completedAt).toLocaleTimeString() : 'Verified')}</span>
              </div>
              {completedModal.nextUnlockedTask && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-cyber-cyan font-bold">
                  <span>UNLOCKED:</span>
                  <span>Task {completedModal.nextUnlockedTask} is now accessible!</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                const nextTask = completedModal.nextUnlockedTask;
                setCompletedModal(null);
                if (nextTask) {
                  setSelectedTaskNumber(nextTask);
                }
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-space-900 font-black text-xs rounded-xl font-chakra uppercase tracking-wider shadow-lg transition-all"
            >
              Continue to Next Task →
            </button>
          </div>
        </div>
      )}

      {/* FINAL STORY REVEAL MODAL WHEN ALL 10 TASKS SOLVED */}
      {completedCount === 10 && (
        <div className="fixed inset-0 z-50 bg-space-900/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 text-center border-2 border-emerald-400 shadow-[0_0_50px_rgba(57,255,20,0.3)] animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-950/80 border border-emerald-500/60 rounded-full text-emerald-400 font-mono-code text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-emerald-400" /> ALL EVIDENCE VERIFIED
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white font-chakra tracking-tight">
                CASE FULLY SOLVED!
              </h2>
              <p className="text-slate-300 font-sans text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                The bank robbery was a multi-stage cyber operation. By following every trail, analyzing traffic, and uncovering hidden records, <strong>your team successfully completed the investigation.</strong>
              </p>
            </div>

            {/* Evidence Chain Flow Visualizer */}
            <div className="bg-space-900 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono-code text-xs text-left">
              <span className="text-[10px] text-cyber-cyan font-bold block uppercase tracking-wider">
                COMPLETED INVESTIGATION CHAIN:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-slate-300 text-center text-[11px]">
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">1. Jigsaw</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">2. Encoded</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">3. Webpage</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">4. Archive</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">5. Statement</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">6. Security</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">7. Bank Login</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">8. Visitor</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-slate-700 rounded-lg">9. Database</span>
                <span className="text-cyber-cyan">→</span>
                <span className="px-2.5 py-1 bg-space-800 border border-emerald-500 text-emerald-300 font-bold rounded-lg shadow-sm">10. Black Box</span>
              </div>
            </div>

            <div className="p-4 bg-space-900 border border-slate-800 rounded-2xl font-mono-code text-xs space-y-1 text-slate-300">
              <p className="font-bold text-slate-100 uppercase">OFFICIAL CERTIFICATION</p>
              <p className="text-cyber-cyan font-bold text-sm">TEAM: {team?.team_name} ({team?.team_code})</p>
              <p className="text-emerald-400 font-bold mt-1">10 / 10 TASKS SOLVED • ALL FLAGS VERIFIED</p>
            </div>

            <button
              onClick={() => setSelectedTaskNumber(10)}
              className="px-6 py-3 bg-space-800 hover:bg-space-700 text-slate-200 font-chakra font-bold text-xs rounded-xl border border-slate-700 transition-all"
            >
              Close Summary & View Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
