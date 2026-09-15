import React, { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';
import { sounds } from '../components/SoundEngine';

interface CountdownOverlayProps {
  onComplete?: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number>(3);
  const [text, setText] = useState<string>('3');

  useEffect(() => {
    sounds.playCountdownBeep(false);

    const timer1 = setTimeout(() => {
      setCount(2);
      setText('2');
      sounds.playCountdownBeep(false);
    }, 1000);

    const timer2 = setTimeout(() => {
      setCount(1);
      setText('1');
      sounds.playCountdownBeep(false);
    }, 2000);

    const timer3 = setTimeout(() => {
      setCount(0);
      setText('CYBER HUNT ’26 STARTED!');
      sounds.playCountdownBeep(true);
      sounds.playMissionStart();
    }, 3000);

    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-space-900/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 animate-pulse">
        <Rocket className="w-16 h-16 text-cyber-cyan mx-auto animate-bounce" />
        
        <h2 className="text-xl font-extrabold text-cyber-cyan uppercase font-chakra tracking-widest">
          MISSION STARTING
        </h2>

        <div className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyber-cyan to-blue-500 font-chakra tracking-tighter glow-cyan">
          {text}
        </div>

        <p className="text-sm font-semibold text-slate-400 font-chakra uppercase tracking-wider">
          Initializing Sequential Mission Tasks 01–10...
        </p>
      </div>
    </div>
  );
};
