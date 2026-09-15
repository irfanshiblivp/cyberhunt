import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { BackgroundVideo } from './components/BackgroundVideo';
import { AuthPages } from './pages/AuthPages';
import { LobbyPage } from './pages/LobbyPage';
import { CountdownOverlay } from './pages/CountdownOverlay';
import { TaskBoardPage } from './pages/TaskBoardPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { BankLoginPage } from './pages/BankLoginPage';
import { CollegePage } from './pages/CollegePage';
import { EmployeePage } from './pages/EmployeePage';
import { DeadDropPage } from './pages/DeadDropPage';
import { Trophy, Award, Clock, Shield } from 'lucide-react';
import { sounds } from './components/SoundEngine';

export const App: React.FC = () => {
  const [team, setTeam] = useState<any>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [gameState, setGameState] = useState<any>({ status: 'WAITING', elapsed_time: '00:00:00' });
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/admin');
  const isLoginRoute = typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/login');
  const isCollegeRoute = typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/college');
  const isEmployeesRoute = typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/employees');
  const isDeadDropRoute = typeof window !== 'undefined' && (
    window.location.pathname.toLowerCase().startsWith('/dead-drop') ||
    window.location.pathname.toLowerCase().startsWith('/dead-switch')
  );

  useEffect(() => {
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    s.on('game:countdown_start', () => {
      setShowCountdown(true);
    });

    s.on('game:started', () => {
      setShowCountdown(false);
      fetchGameState();
    });

    s.on('game:paused', () => {
      fetchGameState();
    });

    s.on('game:resumed', () => {
      fetchGameState();
    });

    s.on('game:ended', () => {
      fetchGameState();
    });

    s.on('game:reset', () => {
      localStorage.removeItem('cyber_hunt_team_id');
      setTeam(null);
      fetchGameState();
    });

    s.on('team:registered', () => {
      fetchGameState();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const fetchGameState = async () => {
    try {
      const res = await fetch('/api/game/status');
      const data = await res.json();
      setGameState(data);
    } catch (e) {
      console.error('Failed to sync game state:', e);
    }
  };

  const fetchTeamMe = async () => {
    const savedTeamId = localStorage.getItem('cyber_hunt_team_id');
    const savedSessionToken = localStorage.getItem('cyber_hunt_session_token');
    if (!savedTeamId) return;

    try {
      const res = await fetch('/api/team/me', {
        headers: { 
          'X-Team-Id': savedTeamId,
          'X-Session-Token': savedSessionToken || ''
        },
      });
      const data = await res.json();
      if (res.status === 403 && data.sessionTerminated) {
        alert(data.error || "SESSION TERMINATED: Another device has logged into this team account.");
        handleLogout();
        return;
      }
      if (res.ok) {
        setTeam(data.team);
      }
    } catch (e) {
      console.error('Failed to auto-restore team session:', e);
    }
  };

  useEffect(() => {
    fetchGameState();
    fetchTeamMe();

    const savedAdminToken = localStorage.getItem('cyber_hunt_admin_token');
    if (savedAdminToken) setIsAdminLoggedIn(true);

    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sounds.playClick();
    localStorage.removeItem('cyber_hunt_team_id');
    localStorage.removeItem('cyber_hunt_session_token');
    localStorage.removeItem('cyber_hunt_admin_token');
    setTeam(null);
    setIsAdminLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-space-900 text-slate-100 relative font-['Outfit',sans-serif]">
      {/* Background Video (public/bgvideo.mp4) */}
      <BackgroundVideo />

      {/* Global CRT Scanline Overlay */}
      <div className="crt-overlay fixed inset-0 z-40 pointer-events-none opacity-40"></div>

      {/* Countdown Overlay Trigger */}
      {showCountdown && (
        <CountdownOverlay onComplete={() => setShowCountdown(false)} />
      )}

      {/* ROUTING LOGIC */}
      {isDeadDropRoute ? (
        <DeadDropPage />
      ) : isEmployeesRoute ? (
        <EmployeePage />
      ) : isCollegeRoute ? (
        <CollegePage />
      ) : isLoginRoute ? (
        <BankLoginPage />
      ) : isAdminRoute ? (
        isAdminLoggedIn ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <AuthPages
            isAdminRoute={true}
            onTeamLogin={(t) => setTeam(t)}
            onAdminLogin={() => setIsAdminLoggedIn(true)}
          />
        )
      ) : team ? (
        gameState.status === 'WAITING' ? (
          <LobbyPage
            team={team}
            totalTeamsReady={gameState.total_teams || 1}
            onLogout={handleLogout}
          />
        ) : gameState.status === 'ENDED' ? (
          <div className="min-h-screen relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-cyber-yellow/20 border border-cyber-yellow flex items-center justify-center text-cyber-yellow mx-auto">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-yellow via-white to-amber-500 font-chakra uppercase tracking-tight">
              CYBER HUNT '26 COMPLETED
            </h1>

            <div className="p-6 glass-panel rounded-2xl border border-cyber-yellow/40 w-full space-y-4 font-chakra">
              <h2 className="text-xl font-bold text-white">TEAM: {team.team_name}</h2>
              <div className="grid grid-cols-2 gap-4 font-mono-code text-center">
                <div className="p-3 bg-space-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono-code">STATUS</span>
                  <span className="text-xl font-black text-cyber-neon font-mono-code">COMPLETED</span>
                </div>
                <div className="p-3 bg-space-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">TOTAL ELAPSED TIME</span>
                  <span className="text-2xl font-black text-cyber-cyan">{gameState.elapsed_time}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-space-800 border border-slate-700 hover:border-cyber-cyan text-slate-200 font-bold text-xs rounded-xl font-chakra uppercase tracking-wider"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <TaskBoardPage
            team={team}
            gameState={gameState}
            onLogout={handleLogout}
          />
        )
      ) : (
        <AuthPages
          isAdminRoute={false}
          onTeamLogin={(t) => setTeam(t)}
          onAdminLogin={() => setIsAdminLoggedIn(true)}
        />
      )}
    </div>
  );
};

export default App;
