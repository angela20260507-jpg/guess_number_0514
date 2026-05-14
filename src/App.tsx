import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCcw, Send, Trophy, History, AlertCircle } from 'lucide-react';

/**
 * 遊戲狀態型別定義
 */
type GameStatus = 'playing' | 'won';

interface GuessRecord {
  guess: number;
  hint: 'too_small' | 'too_big' | 'correct';
}

export default function App() {
  // --- 遊戲狀態管理 ---
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [history, setHistory] = useState<GuessRecord[]>([]);
  const [feedback, setFeedback] = useState<string>('請輸入 1 到 100 之間的數字並提交您的猜測！');
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 初始化/重新開始遊戲
   */
  const initGame = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(newTarget);
    setGuess('');
    setStatus('playing');
    setHistory([]);
    setFeedback('新局開始！請輸入 1 到 100 之間的數字。');
    setError(null);
    // 聚焦輸入框
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // 組件掛載時初始化遊戲
  useEffect(() => {
    initGame();
  }, []);

  /**
   * 處理提交猜測
   */
  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'won') return;

    const numGuess = parseInt(guess);

    // 驗證輸入
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setError('請輸入有效的數字 (1-100)');
      return;
    }

    setError(null);
    let hint: GuessRecord['hint'];

    if (numGuess < targetNumber) {
      hint = 'too_small';
      setFeedback('太小了！');
    } else if (numGuess > targetNumber) {
      hint = 'too_big';
      setFeedback('太大了！');
    } else {
      hint = 'correct';
      setFeedback('恭喜！猜對了！');
      setStatus('won');
    }

    // 記錄歷史
    setHistory(prev => [{ guess: numGuess, hint }, ...prev]);
    setGuess('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* 標題區域 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-900 mb-2">
            猜數字遊戲(熱更新)
          </h1>
          <p className="text-slate-500 font-medium">1 - 100 之間的一個秘密數字</p>
        </motion.div>

        {/* 遊戲主卡片 */}
        <motion.div 
          layout
          className="brutalist-card p-6 mb-6"
        >
          <AnimatePresence mode="wait">
            {status === 'playing' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className={`text-lg font-bold mb-1 ${feedback.includes('恭喜') ? 'text-brand-accent' : feedback.includes('大') || feedback.includes('小') ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {feedback}
                  </p>
                  {error && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center gap-1 text-brand-secondary text-sm font-bold"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleGuess} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="number"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="輸入數字..."
                    className="brutalist-input flex-1 text-lg font-mono"
                    autoFocus
                  />
                  <button type="submit" className="brutalist-button flex items-center gap-2">
                    提交 <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center text-sm text-slate-400 font-mono">
                  已嘗試次數: <span className="font-bold text-slate-900">{history.length}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="won"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-brand-accent/20 p-4 rounded-full"
                  >
                    <Trophy className="w-16 h-16 text-brand-accent" />
                  </motion.div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-display font-extrabold text-slate-900">太棒了！</h2>
                  <p className="text-lg text-slate-600 mt-2">
                    數字就是 <span className="text-brand-primary font-mono font-bold">{targetNumber}</span>
                  </p>
                  <p className="text-slate-500">
                    您僅用了 <span className="text-indigo-600 font-bold">{history.length}</span> 次就猜中了！
                  </p>
                </div>

                <button 
                  onClick={initGame}
                  className="brutalist-button w-full flex items-center justify-center gap-2 text-lg"
                >
                  <RefreshCcw className="w-5 h-5" /> 重新開始
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 歷史紀錄 */}
        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold px-1">
              <History className="w-4 h-4" /> 猜測紀錄
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {history.map((record, index) => (
                  <motion.div
                    key={history.length - index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                    className={`flex items-center justify-between p-3 brutalist-card !shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                      record.hint === 'correct' ? 'bg-emerald-50 border-emerald-900' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md text-[10px] font-mono text-slate-500 border border-slate-200">
                        {history.length - index}
                      </span>
                      <span className="font-mono font-bold text-lg">{record.guess}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      record.hint === 'too_small' ? 'text-blue-600' : 
                      record.hint === 'too_big' ? 'text-rose-600' : 
                      'text-emerald-600'
                    }`}>
                      {record.hint === 'too_small' && '太小了 ↓'}
                      {record.hint === 'too_big' && '太大了 ↑'}
                      {record.hint === 'correct' && '準確！ ✓'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
