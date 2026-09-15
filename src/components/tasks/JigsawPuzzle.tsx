import React, { useState, useEffect } from 'react';
import { Copy, Check, Puzzle } from 'lucide-react';
import { sounds } from '../SoundEngine';

interface JigsawPuzzleProps {
  onSolve?: (keyword: string) => void;
  targetWord?: string;
  imageSrc?: string;
}

const COLS = 4;
const ROWS = 3;

export const JigsawPuzzle: React.FC<JigsawPuzzleProps> = ({
  onSolve,
  targetWord = 'SzdtUS00dk5wLVgy',
  imageSrc = '/puzzle.jpg'
}) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    shufflePieces();
  }, []);

  const shufflePieces = () => {
    const arr = [5, 2, 9, 0, 11, 4, 1, 7, 10, 3, 8, 6];
    setPieces(arr);
    setIsSolved(false);
    setSelectedIdx(null);
    setDraggedIdx(null);
    setCopied(false);
  };

  const swapPieces = (idxA: number, idxB: number) => {
    if (idxA === idxB || isSolved) return;
    const newPieces = [...pieces];
    const temp = newPieces[idxA];
    newPieces[idxA] = newPieces[idxB];
    newPieces[idxB] = temp;

    setPieces(newPieces);
    setSelectedIdx(null);
    setDraggedIdx(null);

    const solved = newPieces.every((val, idx) => val === idx);
    if (solved) {
      setIsSolved(true);
      if (onSolve) onSolve(targetWord);
    }
  };

  const handlePieceClick = (index: number) => {
    if (isSolved) return;
    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else {
      swapPieces(selectedIdx, index);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isSolved) return;
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = draggedIdx !== null ? draggedIdx : Number(sourceIndexStr);
    if (sourceIndex !== null && !isNaN(sourceIndex)) {
      swapPieces(sourceIndex, targetIndex);
    }
  };

  const handleCopyFlag = () => {
    sounds.playClick();
    navigator.clipboard.writeText(targetWord);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5 shadow-2xl space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h3 className="text-cyan-400 font-bold text-base flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-cyan-400" /> EVIDENCE #1 — RECONSTRUCT DOCUMENT
        </h3>
        <button
          onClick={shufflePieces}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-all font-mono"
        >
          Reshuffle
        </button>
      </div>

      {/* Jigsaw Grid Container */}
      <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-xl mx-auto select-none space-y-4">
        <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
          {pieces.map((pieceVal, currentPosIdx) => {
            const isSelected = selectedIdx === currentPosIdx;
            const isBeingDragged = draggedIdx === currentPosIdx;

            const col = pieceVal % COLS;
            const row = Math.floor(pieceVal / COLS);
            const posX = (col * 100) / (COLS - 1);
            const posY = (row * 100) / (ROWS - 1);

            return (
              <div
                key={currentPosIdx}
                draggable={!isSolved}
                onDragStart={(e) => handleDragStart(e, currentPosIdx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, currentPosIdx)}
                onClick={() => handlePieceClick(currentPosIdx)}
                style={{
                  backgroundImage: `url('${imageSrc}')`,
                  backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                  backgroundPosition: `${posX}% ${posY}%`
                }}
                className={`
                  relative h-28 sm:h-32 rounded cursor-grab active:cursor-grabbing transition-all duration-200 border-2 overflow-hidden shadow-md
                  ${isSelected ? 'border-cyan-400 scale-105 shadow-cyan-500/60 shadow-xl z-20 ring-2 ring-cyan-400' : ''}
                  ${isBeingDragged ? 'opacity-40 scale-95 border-dashed border-cyan-400' : ''}
                  ${!isSelected && !isBeingDragged && isSolved ? 'border-emerald-400 shadow-emerald-500/30' : 'border-slate-700 hover:border-cyan-400 hover:scale-[1.02]'}
                `}
              >
                {/* Selection Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-cyan-500/20 border-2 border-cyan-400 animate-pulse pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Solved Flag Banner with Copy Button */}
        {isSolved && (
          <div className="p-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-xl text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
              PUZZLE SOLVED — FLAG RECOVERED
            </div>
            
            <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
              <div className="flex-1 bg-slate-950 border border-emerald-500/80 rounded-lg p-2.5 text-amber-300 font-bold text-base tracking-widest select-all font-mono shadow-inner">
                {targetWord}
              </div>
              <button
                onClick={handleCopyFlag}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-md ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Flag
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
