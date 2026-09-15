import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Users, Volume2, VolumeX, LogOut, Copy, Check, Settings, Shield, Award, Sparkles
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { CrewmateAvatar } from '../components/CrewmateAvatar';
import { sounds } from '../components/SoundEngine';

interface LobbyPageProps {
  team: any;
  totalTeamsReady: number;
  onLogout: () => void;
}

interface PlayerPosition {
  socketId: string;
  teamId: string;
  teamCode: string;
  teamName: string;
  color: string;
  x: number;
  y: number;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ team, totalTeamsReady, onLogout }) => {
  const [isMuted, setIsMuted] = useState(sounds.muted);
  const [players, setPlayers] = useState<PlayerPosition[]>([]);
  const [myPos, setMyPos] = useState({ x: 50, y: 55 });
  const [copiedCode, setCopiedCode] = useState(false);

  // Joystick & touch control state
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  const dropshipRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const myPosRef = useRef(myPos);

  myPosRef.current = myPos;

  const teamColor = team?.color || 'cyan';
  const teamCode = team?.team_code || 'DEMO';
  const teamName = team?.team_name || 'Cyber Squad';

  const toggleSound = () => {
    sounds.muted = !sounds.muted;
    setIsMuted(sounds.muted);
    sounds.playClick();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamCode);
    setCopiedCode(true);
    sounds.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 1. Socket.IO Multiplayer Lobby Sync & Reconnection
  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('lobby:join', {
        teamId: team?.id || `team_${Date.now()}`,
        teamCode,
        teamName,
        color: teamColor,
        x: myPosRef.current.x,
        y: myPosRef.current.y
      });
    });

    socket.on('lobby:players_update', (updatedPlayers: PlayerPosition[]) => {
      setPlayers(updatedPlayers);
      // Sync local player position if assigned by server
      const me = updatedPlayers.find(p => p.teamId === team?.id);
      if (me && (myPosRef.current.x === 50 && myPosRef.current.y === 55)) {
        setMyPos({ x: me.x, y: me.y });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [team?.id, teamCode, teamName, teamColor]);

  // Fallback player rendering so avatar is always visible even before socket connection
  const displayPlayers = players.length > 0 ? players : [
    {
      socketId: 'local',
      teamId: team?.id || 'local_team',
      teamCode,
      teamName,
      color: teamColor,
      x: myPos.x,
      y: myPos.y
    }
  ];

  // Movement handler - completely open room
  const moveMyPlayer = (newX: number, newY: number) => {
    let targetX = Math.max(6, Math.min(94, newX));
    let targetY = Math.max(16, Math.min(86, newY));

    setMyPos({ x: targetX, y: targetY });

    if (socketRef.current) {
      socketRef.current.emit('lobby:move', { x: targetX, y: targetY });
    }
  };

  // 2. Keyboard Controls (WASD & Arrow Keys with Collision)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 2.0;
      let { x, y } = myPosRef.current;
      let moved = false;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        y -= step;
        moved = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        y += step;
        moved = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        x -= step;
        moved = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        x += step;
        moved = true;
      }

      if (moved) {
        moveMyPlayer(x, y);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. Floor Click / Tap to Walk
  const handleDropshipClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dropshipRef.current) return;
    const rect = dropshipRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    moveMyPlayer(clickX, clickY);
  };

  // 4. Virtual Touch Joystick Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    setJoystickActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickActive) return;
    const touch = e.touches[0];
    const target = e.currentTarget.getBoundingClientRect();
    const centerX = target.left + target.width / 2;
    const centerY = target.top + target.height / 2;

    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    const distance = Math.min(40, Math.hypot(deltaX, deltaY));
    const angle = Math.atan2(deltaY, deltaX);

    const jX = Math.cos(angle) * distance;
    const jY = Math.sin(angle) * distance;
    setJoystickPos({ x: jX, y: jY });

    const moveStepX = (deltaX / 40) * 1.8;
    const moveStepY = (deltaY / 40) * 1.8;
    moveMyPlayer(myPosRef.current.x + moveStepX, myPosRef.current.y + moveStepY);
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
  };

  const [isStartingGame, setIsStartingGame] = useState(false);

  const handleStartGameDirect = async () => {
    sounds.playClick();
    setIsStartingGame(true);
    try {
      const res = await fetch('/api/admin/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin_session_valid_cyberhunt26'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to start game');
        setIsStartingGame(false);
      }
    } catch (e: any) {
      console.error(e);
      setIsStartingGame(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans p-3 sm:p-5 relative select-none flex flex-col justify-between overflow-hidden">
      {/* AMONG US TOP CONTROL HEADER BAR */}
      <div className="w-full bg-[#1b2229] border-4 border-[#353e47] rounded-2xl px-4 py-2 flex items-center justify-between shadow-2xl z-30">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#38fedc] border-2 border-white shadow-[0_0_12px_#38fedc] animate-pulse" />
          <span className="text-xs font-bold text-slate-300 font-mono-code uppercase tracking-wider">
            THE SKELD DROPSHIP LOBBY &bull; SHARED PRE-GAME WAITING ROOM
          </span>
        </div>

        {/* Top Right Among Us Icon Buttons & START GAME Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartGameDirect}
            disabled={isStartingGame}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-among-us text-base font-bold transition-all flex items-center gap-1.5 shadow-lg border-2 border-emerald-400 disabled:opacity-50"
          >
            <Rocket className="w-4 h-4 animate-bounce" /> {isStartingGame ? 'STARTING...' : 'START GAME'}
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-[#28323c] border-2 border-slate-600 hover:border-[#38fedc] text-slate-300 transition-all"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#38fedc]" />}
          </button>

          <button
            onClick={() => { sounds.playClick(); onLogout(); }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-950 border-2 border-rose-500 hover:bg-rose-900 text-rose-200 font-among-us text-lg font-bold transition-all flex items-center gap-1.5 shadow-lg"
          >
            <LogOut className="w-4 h-4" /> LEAVE
          </button>
        </div>
      </div>

      {/* MAIN LOBBY VIEWPORT: DROPSHIP ROOM + AMONG US OVERLAYS */}
      <div className="relative flex-1 my-3 flex items-center justify-center">
        <div 
          ref={dropshipRef}
          onClick={handleDropshipClick}
          className="w-full max-w-6xl aspect-[16/9] min-h-[460px] max-h-[660px] bg-[#141b22] border-4 border-[#353e47] rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-crosshair"
        >
          {/* Outer Space Background & Stars through Curved Window */}
          <div className="absolute inset-0 bg-[#05070a] z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
            {/* Stars */}
            <div className="absolute top-4 left-10 w-1 h-1 bg-white rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-12 left-1/3 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-1/4 w-1 h-1 bg-white rounded-full opacity-50"></div>
          </div>

          {/* DROPSHIP METALLIC INTERIOR GRAPHICS */}
          <div className="absolute inset-x-6 top-8 bottom-6 bg-[#1a232c] border-4 border-[#2c3742] rounded-3xl z-10 flex flex-col justify-between shadow-2xl overflow-hidden">
            
            {/* Top Wall & Passenger Seats (The Skeld Chairs) & PROMINENT COMPETITION LOGO */}
            <div className="w-full h-24 bg-[#11171f] border-b-4 border-[#2b3541] relative flex items-center justify-between px-8">
              {/* Left Passenger Seat Row */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-12 bg-[#253240] border-2 border-[#3b4b5c] rounded-t-xl shadow-inner relative">
                    <div className="w-6 h-3 bg-[#17212b] rounded-t mx-auto mt-1 border-b border-slate-700"></div>
                  </div>
                ))}
              </div>

              {/* Center PROMINENT CYBER HUNT '26 LOGO & WINDOW FRAME */}
              <div className="w-64 h-full bg-[#1c2633] border-x-4 border-[#334252] flex flex-col items-center justify-center space-y-1 shadow-inner px-2 text-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#38fedc] animate-pulse" />
                  <span className="text-xl sm:text-2xl font-black font-among-us tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#38fedc] via-white to-cyan-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    CYBER HUNT '26
                  </span>
                  <Sparkles className="w-4 h-4 text-[#38fedc] animate-pulse" />
                </div>
                <div className="w-36 h-4 bg-[#090d14] border border-cyan-500/40 rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-mono-code text-cyan-400 font-bold tracking-widest uppercase">
                    PRE-GAME LOBBY
                  </span>
                </div>
              </div>

              {/* Right Passenger Seat Row */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-12 bg-[#253240] border-2 border-[#3b4b5c] rounded-t-xl shadow-inner relative">
                    <div className="w-6 h-3 bg-[#17212b] rounded-t mx-auto mt-1 border-b border-slate-700"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* OPEN DROPSHIP FLOOR GRID ARENA */}
            <div className="flex-1 relative bg-[linear-gradient(to_right,#26323e_1px,transparent_1px),linear-gradient(to_bottom,#26323e_1px,transparent_1px)] bg-[size:40px_40px]">
              
              {/* RENDERING MULTIPLAYER CREWMATE PLAYERS */}
              {displayPlayers.map((p) => {
                const isMe = p.teamId === team?.id || p.socketId === 'local';
                const renderX = isMe ? myPos.x : p.x;
                const renderY = isMe ? myPos.y : p.y;

                return (
                  <div
                    key={p.socketId || p.teamId}
                    className="absolute z-20 transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${renderX}%`, top: `${renderY}%` }}
                  >
                    <div className="flex flex-col items-center">
                      {/* Unique Team Name Label displayed above character */}
                      <div className="px-2.5 py-0.5 rounded-full bg-black/85 border border-slate-700 text-white font-chakra text-[11px] font-bold shadow-lg whitespace-nowrap mb-1">
                        {p.teamName} {isMe && <span className="text-[#38fedc] font-black">(YOU)</span>}
                      </div>

                      {/* Among Us Crewmate Avatar */}
                      <CrewmateAvatar
                        color={p.color || 'cyan'}
                        size={56}
                        animated={isMe}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>



          {/* AMONG US RIGHT ROOM CODE & CAPACITY TABLET (MATCHING UPLOADED SCREENSHOT) */}
          <div className="absolute top-12 right-10 z-20 bg-[#161e27]/90 backdrop-blur-md border-3 border-[#323f4d] rounded-2xl p-4 text-white font-among-us shadow-2xl space-y-3 min-w-[210px]">
            {/* ROOM CODE BOX */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-mono-code font-bold block uppercase tracking-wider">
                ROOM CODE
              </span>
              <div className="flex items-center justify-between bg-[#0a0f16] border-2 border-[#2b3947] rounded-xl px-3 py-1.5">
                <span className="text-xl font-bold text-[#38fedc] tracking-widest font-mono-code select-all">
                  {teamCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-[#202b36] hover:bg-[#2e3e4f] text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="Copy Room Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ROOM SETTINGS */}
            <div className="space-y-2 pt-1 border-t border-[#2b3947] text-xs">
              <span className="text-[10px] text-slate-400 font-mono-code font-bold uppercase block">
                ROOM SETTINGS
              </span>

              <div className="flex justify-between items-center bg-[#0e151f] p-2 rounded-xl border border-slate-800">
                <span className="text-slate-300 text-sm">MAP</span>
                <span className="text-[#38fedc] font-bold text-sm tracking-wider">THE SKELD</span>
              </div>

              <div className="flex justify-between items-center bg-[#0e151f] p-2 rounded-xl border border-slate-800 font-mono-code">
                <span className="text-slate-300 text-xs">TEAMS WAITING</span>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white"></div>
                  <span>{players.length || totalTeamsReady} / 15</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono-code">
                <span className="text-slate-400">PRIVACY</span>
                <span className="text-emerald-400 font-bold uppercase">PUBLIC</span>
              </div>
            </div>
          </div>

          {/* CENTER BOTTOM: "WAITING FOR GAME TO START" OVERLAY BANNER */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md border-3 border-slate-700 px-8 py-2.5 rounded-2xl text-center space-y-0.5 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-300 font-among-us tracking-widest uppercase">
              WAITING FOR GAME TO START
            </h2>
            <p className="text-[10px] text-[#38fedc] font-mono-code font-bold uppercase tracking-wider">
              HOST (ADMIN) WILL START COMPETITION FOR ALL PARTICIPANTS
            </p>
          </div>

          {/* VIRTUAL TOUCH JOYSTICK FOR MOBILE / TOUCH USERS (BOTTOM LEFT) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute bottom-8 left-8 z-30 w-24 h-24 rounded-full bg-black/50 border-2 border-slate-600/80 flex items-center justify-center touch-none sm:hidden"
          >
            <div
              className="w-10 h-10 rounded-full bg-[#38fedc]/80 border-2 border-white shadow-lg transition-transform duration-75"
              style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
            />
          </div>

          {/* DESKTOP KEYBOARD CONTROLS HINT (BOTTOM RIGHT) */}
          <div className="hidden sm:block absolute bottom-10 right-10 z-20 bg-black/70 backdrop-blur-md border border-slate-700 px-3.5 py-2 rounded-xl text-[10px] font-mono-code text-slate-400 shadow-xl">
            ⌨️ Move: <strong className="text-white font-bold">WASD / Arrow Keys</strong> or <strong className="text-[#38fedc]">Click Floor</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
