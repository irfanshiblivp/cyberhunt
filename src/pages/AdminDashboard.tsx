import React, { useState, useEffect } from 'react';
import { Shield, Play, Pause, Square, RefreshCw, Download, Users, CheckCircle2, Clock, Eye, AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import { sounds } from '../components/SoundEngine';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [gameState, setGameState] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamDetailData, setTeamDetailData] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ action: string; title: string; desc: string } | null>(null);

  const getAdminToken = () => localStorage.getItem('cyber_hunt_admin_token') || 'admin_session_valid_cyberhunt26';

  const fetchData = async () => {
    try {
      const resStatus = await fetch('/api/game/status');
      if (resStatus.ok) {
        const dataStatus = await resStatus.json();
        setGameState(dataStatus);
      }

      const resTeams = await fetch('/api/admin/teams', {
        headers: { Authorization: getAdminToken() },
      });
      if (resTeams.ok) {
        const dataTeams = await resTeams.json();
        setTeams(dataTeams.teams || []);
      }

      const resLb = await fetch('/api/leaderboard');
      if (resLb.ok) {
        const dataLb = await resLb.json();
        setLeaderboard(dataLb.leaderboard || []);
      }
    } catch (e) {
      console.error('Failed to fetch admin dashboard data:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGameAction = async (action: 'start' | 'pause' | 'resume' | 'end' | 'reset') => {
    sounds.playClick();
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/game/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const textText = await res.text();
        console.error('Non-JSON response:', textText);
        alert(`Server error (${res.status}): Server returned non-JSON content.`);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        fetchData();
      } else {
        alert(data.error || `Action failed (${res.status})`);
      }
    } catch (e: any) {
      console.error('Game action error:', e);
      alert(`Error triggering game action: ${e.message || 'Network error'}`);
    } finally {
      setConfirmModal(null);
    }
  };

  const handleFetchTeamDetails = async (teamId: string) => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        headers: { Authorization: getAdminToken() },
      });
      if (res.ok) {
        const data = await res.json();
        setTeamDetailData(data);
        setSelectedTeam(data.team);
      }
    } catch (e) {
      console.error('Error fetching team details:', e);
    }
  };

  const handleResetTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to reset progress for this team?')) return;
    sounds.playClick();
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/reset`, {
        method: 'POST',
        headers: { Authorization: getAdminToken() },
      });
      if (res.ok) {
        alert('Team progress reset.');
        fetchData();
        setSelectedTeam(null);
      }
    } catch (e) {
      alert('Reset failed.');
    }
  };

  const handleExportCsv = () => {
    sounds.playClick();
    window.open('/api/admin/export', '_blank');
  };

  return (
    <div className="min-h-screen relative z-10 p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Admin Navbar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-rose-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white font-chakra tracking-tight">
              CYBER HUNT '26 ADMIN CONTROL CENTER
            </h1>
            <p className="text-xs text-rose-400 font-mono-code uppercase font-bold">
              SS CYBER HUNT MISSION COMMAND
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-chakra">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-space-800 border border-slate-700 hover:border-cyber-cyan text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-cyber-cyan" /> Export Results CSV
          </button>
          <button
            onClick={() => { sounds.playClick(); onLogout(); }}
            className="px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-500/50 hover:bg-rose-900 text-rose-300 font-bold text-xs transition-colors"
          >
            Admin Logout
          </button>
        </div>
      </div>

      {/* GLOBAL GAME CONTROLS & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Status & Control Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-rose-500/20 space-y-4 font-chakra">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">MISSION CONTROL STATUS</span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono-code ${
              gameState?.status === 'RUNNING' ? 'bg-cyber-neon/20 text-cyber-neon border border-cyber-neon' :
              gameState?.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500' :
              'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {gameState?.status || 'WAITING'}
            </span>
          </div>

          {/* Action Control Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2 font-chakra">
            <button
              disabled={gameState?.status === 'RUNNING' || gameState?.status === 'PAUSED'}
              onClick={() => handleGameAction('start')}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Start Game
            </button>

            {gameState?.status === 'RUNNING' ? (
              <button
                onClick={() => handleGameAction('pause')}
                className="py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Pause className="w-4 h-4" /> Pause Game
              </button>
            ) : (
              <button
                disabled={gameState?.status !== 'PAUSED'}
                onClick={() => handleGameAction('resume')}
                className="py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Play className="w-4 h-4" /> Resume Game
              </button>
            )}

            <button
              disabled={gameState?.status === 'WAITING' || gameState?.status === 'ENDED'}
              onClick={() => setConfirmModal({
                action: 'end',
                title: 'END COMPETITION NOW?',
                desc: 'This will lock all tasks, finalize completion times, and reveal final standings.'
              })}
              className="py-3 px-4 bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Square className="w-4 h-4 fill-current" /> End Game
            </button>

            <button
              onClick={() => setConfirmModal({
                action: 'reset',
                title: 'RESET GLOBAL COMPETITION?',
                desc: 'CAUTION: This will reset all team progress, clear scores, and return the competition to initial WAITING state.'
              })}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-rose-500/40 text-rose-300 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" /> Reset Game
            </button>
          </div>
        </div>

        {/* Real-time Event Metrics */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-code">
          <div className="p-4 bg-space-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">REGISTERED TEAMS</span>
            <span className="text-2xl font-black text-white">{teams.length}</span>
          </div>

          <div className="p-4 bg-space-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">READY CREWMATES</span>
            <span className="text-2xl font-black text-cyber-neon">{teams.length}</span>
          </div>

          <div className="p-4 bg-space-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">MISSION CLOCK</span>
            <span className="text-2xl font-black text-cyber-cyan">{gameState?.elapsed_time || '00:00:00'}</span>
          </div>

          <div className="p-4 bg-space-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">LEADER TIME</span>
            <span className="text-2xl font-black text-cyber-yellow">
              {leaderboard.length > 0 ? leaderboard[0].elapsedTime : '00:00:00'}
            </span>
          </div>
        </div>
      </div>

      {/* REGISTERED TEAMS TABLE & REAL-TIME MONITOR */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between font-chakra">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-cyber-cyan" /> Registered Teams & Mission Progress
          </h3>
          <span className="text-xs text-slate-400 font-mono-code font-bold">
            TOTAL TEAMS: {teams.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-chakra text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Team Code / Name</th>
                <th className="py-3 px-3">Members</th>
                <th className="py-3 px-3">Current Chapter</th>
                <th className="py-3 px-3">Completed</th>
                <th className="py-3 px-3">Total Time</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono-code">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-chakra">
                    No teams registered yet.
                  </td>
                </tr>
              ) : (
                teams.map((t) => (
                  <tr key={t.id} className="hover:bg-space-800/50 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-cyber-yellow">#{t.rank || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-chakra">{t.team_name}</div>
                      <div className="text-[10px] text-cyber-cyan">{t.team_code}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] font-chakra">
                      {[t.member1, t.member2, t.member3].filter(Boolean).join(', ')}
                    </td>
                    <td className="py-3 px-3 font-bold text-cyber-cyan">Chapter {t.currentTask || 1}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{t.completedCount || 0} / 10</td>
                    <td className="py-3 px-3 text-slate-300">{t.totalTime}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleFetchTeamDetails(t.id)}
                        className="px-2.5 py-1 bg-space-800 border border-slate-700 hover:border-cyber-cyan text-cyber-cyan rounded-lg text-[11px] font-bold font-chakra"
                      >
                        Inspect Timeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-rose-500/50 space-y-4 font-chakra">
            <h3 className="text-lg font-extrabold text-white">{confirmModal.title}</h3>
            <p className="text-xs text-slate-300">{confirmModal.desc}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-space-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGameAction(confirmModal.action as any)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEAM DETAIL & TIMELINE DRAWER MODAL */}
      {teamDetailData && selectedTeam && (
        <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 border border-cyber-cyan/40 space-y-6 font-chakra max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedTeam.team_name}</h3>
                <span className="text-xs text-cyber-cyan font-mono-code">ID: {selectedTeam.team_code}</span>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-3 py-1 bg-space-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Timeline Breakdown */}
            <div className="space-y-3 font-mono-code text-xs">
              <h4 className="font-bold text-cyber-cyan uppercase font-chakra">Task Completion & Time Records:</h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl p-3 bg-slate-950">
                {(!teamDetailData.submissions || teamDetailData.submissions.filter((sub: any) => sub.is_correct).length === 0) ? (
                  <p className="text-slate-500 py-3 text-center font-chakra">No completed tasks recorded yet.</p>
                ) : (
                  teamDetailData.submissions.filter((sub: any) => sub.is_correct).map((sub: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </span>
                        <span className="text-white font-bold font-chakra">Task #{sub.task_id}</span>
                        <span className="text-slate-400 font-mono-code text-[10px]">({sub.submitted_flag})</span>
                      </div>
                      <div className="text-slate-300 font-mono-code flex items-center gap-3">
                        <span className="text-cyber-cyan font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                          ⏱️ Elapsed: {sub.time_from_start}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          🕒 {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => handleResetTeam(selectedTeam.id)}
                className="px-4 py-2 bg-rose-950 border border-rose-500/50 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Reset Team Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
