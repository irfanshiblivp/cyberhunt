import React from 'react';
import { Rocket, Users, Volume2, VolumeX, LogOut } from 'lucide-react';
import { CrewmateAvatar } from '../components/CrewmateAvatar';
import { sounds } from '../components/SoundEngine';

interface LobbyPageProps {
  team: any;
  totalTeamsReady: number;
  onLogout: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ team, totalTeamsReady, onLogout }) => {
  const [isMuted, setIsMuted] = React.useState(sounds.muted);

  const toggleSound = () => {
    sounds.muted = !sounds.muted;
    setIsMuted(sounds.muted);
    sounds.playClick();
  };

  const members = [team.member1, team.member2, team.member3].filter(Boolean);
  const teamColor = team.color || 'cyan';

  return (
    <div className="min-h-screen relative z-10 flex flex-col p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Top Navbar */}
      <div className="flex items-center justify-between glass-panel rounded-2xl px-6 py-4 mb-6 border border-cyber-cyan/30">
        <div className="flex items-center gap-3">
          <CrewmateAvatar color={teamColor} size={42} animated={false} />
          <div>
            <h1 className="text-lg font-extrabold text-white font-chakra tracking-tight">
              CYBER HUNT '26
            </h1>
            <p className="text-[11px] text-cyber-cyan font-bold font-mono-code uppercase">
              MISSION CONTROL LOBBY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-space-800 border border-slate-700 hover:border-cyber-cyan text-slate-300 hover:text-cyber-cyan transition-colors"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyber-cyan" />}
          </button>
          <button
            onClick={() => { sounds.playClick(); onLogout(); }}
            className="px-3.5 py-2 rounded-xl bg-space-800 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 font-chakra text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Leave Session
          </button>
        </div>
      </div>

      {/* Main Waiting Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Team Profile Card */}
        <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyber-cyan uppercase font-chakra tracking-wider">
                YOUR TEAM SESSION
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan font-mono-code text-[11px] font-bold">
                {team.team_code}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white font-chakra tracking-tight">
              {team.team_name}
            </h2>

            <div className="p-4 bg-space-900/80 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-chakra block">
                CREWMATE MEMBERS ({members.length}/3)
              </span>
              <ul className="space-y-1.5 font-chakra text-sm text-slate-200 font-semibold">
                {members.map((m, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-neon"></span>
                    <span>{m} {idx === 0 && '(Leader)'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3 font-chakra">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">SESSION STATUS</span>
              <span className="text-amber-400 font-bold tracking-widest uppercase">WAITING FOR GAME</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">MISSION STATUS</span>
              <span className="text-slate-400 font-bold tracking-widest uppercase">NOT STARTED</span>
            </div>
          </div>
        </div>

        {/* Center Column: Crewmates Deck & Live Count */}
        <div className="lg:col-span-2 glass-panel-glow rounded-2xl p-6 border border-cyber-cyan/30 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="py-2 px-4 rounded-full bg-space-900 border border-cyber-neon/40 text-cyber-neon text-xs font-bold font-chakra tracking-widest uppercase shadow-lg">
            WAITING FOR ADMIN START
          </div>

          {/* Crewmates Room */}
          <div className="my-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 py-6 px-4 bg-space-900/60 rounded-2xl border border-slate-800/80 w-full">
            {members.map((m, idx) => (
              <CrewmateAvatar
                key={idx}
                color={teamColor}
                size={95}
                label={m}
                isReady={true}
                animated={false}
              />
            ))}
          </div>

          {/* Global Ready Counter & Briefing */}
          <div className="w-full space-y-4">
            <div className="p-4 rounded-xl bg-space-900/90 border border-cyber-cyan/30 inline-flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyber-cyan" />
              </div>
              <div className="text-left font-chakra">
                <span className="text-xs text-slate-400 font-bold block uppercase">
                  TEAMS REGISTERED
                </span>
                <span className="text-2xl font-black text-cyber-cyan font-mono-code">
                  TEAMS READY: {totalTeamsReady}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-space-900/60 border border-slate-800 text-slate-400 text-xs max-w-xl mx-auto space-y-1">
              <p className="font-semibold text-slate-300">
                All crewmates remain in Mission Control until Admin starts the competition.
              </p>
              <p>
                Once started, Task 1 will unlock automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
