import React, { useState } from 'react';
import { Shield, Key, Users, UserPlus, LogIn, AlertCircle, Play, CreditCard, HelpCircle, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sounds } from '../components/SoundEngine';
import { CrewmateAvatar } from '../components/CrewmateAvatar';

interface AuthPagesProps {
  onTeamLogin: (team: any) => void;
  onAdminLogin: (token: string) => void;
  isAdminRoute?: boolean;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onTeamLogin, onAdminLogin, isAdminRoute = false }) => {
  const [activeMenu, setActiveMenu] = useState<'play' | 'rules' | 'login'>('play');
  const [isMuted, setIsMuted] = useState(sounds.muted);

  // Register Form State
  const [regTeamName, setRegTeamName] = useState('');
  const [regM1, setRegM1] = useState('');
  const [regM2, setRegM2] = useState('');
  const [regM3, setRegM3] = useState('');
  const [regError, setRegError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  // Login Form State
  const [loginTeamCode, setLoginTeamCode] = useState('');
  const [loginAccessCode, setLoginAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Form State
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  const toggleSound = () => {
    sounds.muted = !sounds.muted;
    setIsMuted(sounds.muted);
    sounds.playClick();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setRegError('');

    if (!regTeamName.trim() || !regM1.trim()) {
      setRegError('Team name and Member 1 name are required.');
      sounds.playError();
      return;
    }

    try {
      const res = await fetch('/api/auth/team/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: regTeamName,
          member1: regM1,
          member2: regM2,
          member3: regM3,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Registration failed.');
        sounds.playError();
      } else {
        sounds.playTaskSuccess();
        if (data.session_token) {
          localStorage.setItem('cyber_hunt_session_token', data.session_token);
        }
        setCreatedCredentials(data);
      }
    } catch (err) {
      setRegError('Network connection error.');
      sounds.playError();
    }
  };

  const handleTeamLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setLoginError('');

    try {
      const res = await fetch('/api/auth/team/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_code: loginTeamCode,
          access_code: loginAccessCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed.');
        sounds.playError();
      } else {
        sounds.playMissionStart();
        localStorage.setItem('cyber_hunt_team_id', data.team.id);
        if (data.session_token) {
          localStorage.setItem('cyber_hunt_session_token', data.session_token);
        }
        onTeamLogin(data.team);
      }
    } catch (err) {
      setLoginError('Server connection failed.');
      sounds.playError();
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setAdminError('');

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Invalid admin credentials.');
        sounds.playError();
      } else {
        sounds.playMissionStart();
        localStorage.setItem('cyber_hunt_admin_token', data.token);
        onAdminLogin(data.token);
      }
    } catch (err) {
      setAdminError('Server connection failed.');
      sounds.playError();
    }
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col p-3 sm:p-6 max-w-7xl mx-auto justify-between select-none">
      {/* 1. TOP AMONG US MENU BAR */}
      <div className="w-full bg-[#1b2229] border-3 border-[#37414b] rounded-2xl px-5 py-2.5 flex items-center justify-between shadow-2xl mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#d824d8] border-2 border-white shadow-[0_0_12px_#d824d8]" />
          <span className="text-xs font-bold text-slate-300 font-mono-code uppercase tracking-wider">
            MISSION CONTROL ONLINE
          </span>
        </div>

        <div className="flex items-center gap-3 font-among-us text-xl">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl bg-[#28323c] border-2 border-slate-600 hover:border-[#38fedc] text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#38fedc]" />}
          </button>
          <div className="px-4 py-1 bg-[#326965] border-2 border-[#4da8a2] rounded-xl text-white font-bold tracking-widest uppercase">
            FRIENDS
          </div>
        </div>
      </div>

      {/* 2. AMONG US MAIN TITLE LOGO */}
      <div className="flex items-center gap-3 my-2">
        <div className="w-12 h-14 shrink-0">
          <CrewmateAvatar color="red" size={55} animated={false} />
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-white font-among-us tracking-widest drop-shadow-[0_6px_0_#000] uppercase">
          CYBER HUNT '26
        </h1>
      </div>

      {/* 3. MAIN AMONG US MENU SCREEN (LEFT NAVIGATION TABLET & RIGHT WINDOW VIEWPORT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 my-2 items-stretch">
        {/* LEFT COLUMN: AMONG US MENU TABLET (4 COLS) */}
        <div className="lg:col-span-4 bg-[#1b2229] border-4 border-[#353e47] rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl space-y-4">
          {/* Top Glossy Action Buttons */}
          <div className="space-y-3 font-among-us">
            {/* PLAY BUTTON */}
            <button
              onClick={() => { sounds.playClick(); setActiveMenu('play'); }}
              className={`w-full p-3 rounded-2xl border-3 border-black text-left flex items-center justify-between transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg ${
                activeMenu === 'play'
                  ? 'bg-[#38fedc] text-[#0b131a] ring-4 ring-[#38fedc]/40'
                  : 'bg-[#29cfb3] text-[#0b131a] hover:bg-[#38fedc]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 border-2 border-black flex items-center justify-center text-white shrink-0">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <span className="text-3xl sm:text-4xl font-bold tracking-widest uppercase">
                  PLAY
                </span>
              </div>
            </button>

            {/* HOW TO PLAY BUTTON */}
            <button
              onClick={() => { sounds.playClick(); setActiveMenu('rules'); }}
              className={`w-full p-3 rounded-2xl border-3 border-black text-left flex items-center justify-between transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg ${
                activeMenu === 'rules'
                  ? 'bg-[#38fedc] text-[#0b131a] ring-4 ring-[#38fedc]/40'
                  : 'bg-[#29cfb3] text-[#0b131a] hover:bg-[#38fedc]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 border-2 border-black flex items-center justify-center text-white shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-3xl sm:text-4xl font-bold tracking-widest uppercase">
                  HOW TO PLAY
                </span>
              </div>
            </button>
          </div>

          {/* Bottom Utility Menu Buttons */}
          <div className="space-y-2 font-among-us pt-2 border-t-2 border-[#2b353f]">
            <button
              onClick={() => { sounds.playClick(); setActiveMenu('login'); }}
              className={`w-full p-2.5 rounded-xl border-2 border-slate-900 text-left flex items-center justify-between transition-colors ${
                activeMenu === 'login'
                  ? 'bg-[#3e4a57] text-[#38fedc] border-[#38fedc]'
                  : 'bg-[#2b353f] text-slate-200 hover:bg-[#36424e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span className="text-2xl font-bold uppercase tracking-wider">
                  RETURNING TEAM LOGIN
                </span>
              </div>
            </button>
          </div>

          <div className="text-[11px] font-mono-code text-slate-500 text-center font-bold">
            v26.0 (build num: 2026)
          </div>
        </div>

        {/* RIGHT COLUMN: AMONG US SPACESHIP WINDOW TABLET VIEWPORT (8 COLS) */}
        <div className="lg:col-span-8 bg-[#262f38] border-4 border-[#3e4954] rounded-3xl p-3 sm:p-5 flex flex-col justify-between shadow-2xl min-h-[420px] relative overflow-hidden">
          {/* Inner Space Display Window */}
          <div className="w-full h-full bg-[#05080d] border-2 border-[#161d26] rounded-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-y-auto">
            {/* ADMIN ROUTE VIEW */}
            {isAdminRoute ? (
              <div className="max-w-md mx-auto w-full space-y-4 my-auto">
                <div className="text-center space-y-1">
                  <Shield className="w-12 h-12 text-rose-500 mx-auto" />
                  <h2 className="text-4xl font-bold text-white font-among-us tracking-widest uppercase">
                    ADMIN CONTROL CENTER
                  </h2>
                  <p className="text-xs text-rose-400 font-mono-code font-bold uppercase">
                    CYBER HUNT '26 RESTRICTED LOGIN
                  </p>
                </div>

                <form onSubmit={handleAdminLoginSubmit} className="space-y-4 font-chakra">
                  {adminError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Username</label>
                    <input
                      type="text"
                      required
                      value={adminUser}
                      onChange={e => setAdminUser(e.target.value)}
                      className="w-full bg-[#121924] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono-code focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Password</label>
                    <input
                      type="password"
                      required
                      value={adminPass}
                      onChange={e => setAdminPass(e.target.value)}
                      className="w-full bg-[#121924] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono-code focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl font-chakra uppercase tracking-wider shadow-lg"
                  >
                    Login to Admin Panel
                  </button>
                </form>
              </div>
            ) : activeMenu === 'play' ? (
              /* REGISTRATION VIEW (PLAY MENU) */
              <div className="max-w-md mx-auto w-full space-y-4 my-auto">
                {createdCredentials ? (
                  <div className="space-y-4 text-center">
                    <div className="p-4 bg-[#0f241a] border-2 border-emerald-500 rounded-2xl space-y-3 font-chakra">
                      <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h3 className="text-xl font-extrabold text-white uppercase font-among-us tracking-wider">
                        CREWMATE TEAM REGISTERED!
                      </h3>
                      <p className="text-xs text-slate-300">
                        Save your unique Team ID and Access Code to log back in anytime:
                      </p>

                      <div className="p-3 bg-[#070d14] rounded-xl text-left border border-slate-800 font-mono-code space-y-2">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Team ID:</span>
                          <span className="text-sm font-extrabold text-[#38fedc] select-all">
                            {createdCredentials.team_code}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-bold">Access Code:</span>
                          <span className="text-sm font-extrabold text-[#f5f557] select-all">
                            {createdCredentials.access_code}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playMissionStart();
                        localStorage.setItem('cyber_hunt_team_id', createdCredentials.team.id);
                        if (createdCredentials.session_token) {
                          localStorage.setItem('cyber_hunt_session_token', createdCredentials.session_token);
                        }
                        onTeamLogin(createdCredentials.team);
                      }}
                      className="w-full py-3 bg-[#38fedc] text-[#0b131a] font-extrabold text-sm rounded-xl font-chakra uppercase tracking-wider shadow-lg"
                    >
                      Enter Spaceship Lobby
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-3">
                      <h2 className="text-4xl font-bold text-white font-among-us tracking-widest uppercase">
                        TEAM REGISTRATION
                      </h2>
                      <p className="text-xs text-slate-400 font-chakra">
                        Create a Crewmate Team (3 Mandatory Members)
                      </p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-3 font-chakra">
                      {regError && (
                        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{regError}</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 uppercase">Team Name</label>
                        <input
                          type="text"
                          required
                          value={regTeamName}
                          onChange={e => setRegTeamName(e.target.value)}
                          className="w-full bg-[#121924] border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono-code text-slate-100 focus:border-[#38fedc] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-300 uppercase">Member 1 *</label>
                          <input
                            type="text"
                            required
                            value={regM1}
                            onChange={e => setRegM1(e.target.value)}
                            className="w-full bg-[#121924] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-[#38fedc] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-300 uppercase">Member 2 *</label>
                          <input
                            type="text"
                            required
                            value={regM2}
                            onChange={e => setRegM2(e.target.value)}
                            className="w-full bg-[#121924] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-[#38fedc] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-300 uppercase">Member 3 *</label>
                          <input
                            type="text"
                            required
                            value={regM3}
                            onChange={e => setRegM3(e.target.value)}
                            className="w-full bg-[#121924] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-[#38fedc] focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#38fedc] hover:bg-[#20e0bf] text-[#0b131a] font-extrabold text-sm rounded-xl font-chakra uppercase tracking-wider shadow-lg transition-all"
                      >
                        Create Team & Generate Credentials
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : activeMenu === 'login' ? (
              /* TEAM LOGIN VIEW */
              <div className="max-w-md mx-auto w-full space-y-4 my-auto">
                <div className="text-center space-y-1">
                  <LogIn className="w-10 h-10 text-[#38fedc] mx-auto" />
                  <h2 className="text-4xl font-bold text-white font-among-us tracking-widest uppercase">
                    RETURNING TEAM LOGIN
                  </h2>
                  <p className="text-xs text-slate-400 font-chakra">
                    Enter your Team Code and Access Code
                  </p>
                </div>

                <form onSubmit={handleTeamLoginSubmit} className="space-y-3 font-chakra">
                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Team ID</label>
                    <input
                      type="text"
                      required
                      value={loginTeamCode}
                      onChange={e => setLoginTeamCode(e.target.value)}
                      className="w-full bg-[#121924] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono-code focus:border-[#38fedc] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Access Code</label>
                    <input
                      type="text"
                      required
                      value={loginAccessCode}
                      onChange={e => setLoginAccessCode(e.target.value)}
                      className="w-full bg-[#121924] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono-code focus:border-[#38fedc] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#38fedc] hover:bg-[#20e0bf] text-[#0b131a] font-extrabold text-sm rounded-xl font-chakra uppercase tracking-wider shadow-lg transition-all"
                  >
                    Authenticate Team Session
                  </button>
                </form>
              </div>
            ) : (
              /* HOW TO PLAY / RULES VIEW */
              <div className="max-w-md mx-auto w-full space-y-4 my-auto text-slate-300 font-chakra">
                <h2 className="text-4xl font-bold text-white font-among-us tracking-widest uppercase text-center">
                  HOW TO PLAY
                </h2>
                <div className="space-y-2 text-xs bg-[#101722] p-4 rounded-xl border border-slate-800">
                  <p className="font-bold text-[#38fedc]">1. Register Your Team</p>
                  <p>Create a team with up to 3 crewmate members on the Play menu.</p>
                  <p className="font-bold text-[#38fedc] pt-1">2. Wait in the Lobby</p>
                  <p>All teams wait inside the lobby until the Admin starts the game.</p>
                  <p className="font-bold text-[#38fedc] pt-1">3. Solve 10 Chapters</p>
                  <p>Missions unlock sequentially in order. Submit flags to verify evidence and advance!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
