import React, { useState, useEffect } from 'react';
import { GameState, RecordEntry, Role, Hypothesis } from './types';
import { SetupView } from './SetupView';
import { MainLogView } from './MainLogView';
import { PlayerDetailView } from './PlayerDetailView';
import { RoleOverviewView } from './RoleOverviewView';
import { LayoutList, User, Layers, RotateCcw } from 'lucide-react';

type View = 'setup' | 'main' | 'player' | 'overview';

const STORAGE_KEY = 'wolf_note_state';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState<View>(gameState ? 'main' : 'setup');

  useEffect(() => {
    if (gameState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const handleStartGame = (playerCount: number, _initialRoles: { role: Role; count: number }[]) => {
    const newState: GameState = {
      playerCount,
      players: Array.from({ length: playerCount }, (_, i) => ({
        id: i + 1,
        roles: [],
        statusLabels: [],
        isAlive: true,
      })),
      records: [],
      hypotheses: [],
      currentHypothesisId: null,
    };
    setGameState(newState);
    setCurrentView('main');
  };

  const handleReset = () => {
    if (confirm('确定要清空当前对局重新开始吗？')) {
      localStorage.removeItem(STORAGE_KEY);
      setGameState(null);
      setCurrentView('setup');
    }
  };

  const handleAddRecord = (record: RecordEntry) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      records: [...gameState.records, record],
    });
  };

  const handleAddHypothesis = (h: Hypothesis) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      hypotheses: [...gameState.hypotheses, h],
    });
  };

  const handleDeleteHypothesis = (id: string) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      hypotheses: gameState.hypotheses.filter(h => h.id !== id),
    });
  };

  if (!gameState || currentView === 'setup') {
    return <SetupView onStart={handleStartGame} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 max-w-lg mx-auto overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 flex justify-between items-center border-b dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="font-black text-xl tracking-tight text-blue-600">WOLFNOTE</h1>
        <button 
          onClick={handleReset}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="重新开始"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'main' && (
          <MainLogView 
            records={gameState.records} 
            onAddRecord={handleAddRecord} 
          />
        )}
        {currentView === 'player' && (
          <PlayerDetailView 
            playerCount={gameState.playerCount} 
            records={gameState.records} 
          />
        )}
        {currentView === 'overview' && (
          <RoleOverviewView 
            playerCount={gameState.playerCount} 
            records={gameState.records}
            hypotheses={gameState.hypotheses}
            onAddHypothesis={handleAddHypothesis}
            onDeleteHypothesis={handleDeleteHypothesis}
          />
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="flex border-t dark:border-gray-800 bg-white dark:bg-black pb-safe">
        <button 
          onClick={() => setCurrentView('main')}
          className={`flex-1 py-3 flex flex-col items-center justify-center space-y-1 ${
            currentView === 'main' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <LayoutList className="w-6 h-6" />
          <span className="text-[10px] font-medium">主页记录</span>
        </button>
        <button 
          onClick={() => setCurrentView('player')}
          className={`flex-1 py-3 flex flex-col items-center justify-center space-y-1 ${
            currentView === 'player' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">人员视图</span>
        </button>
        <button 
          onClick={() => setCurrentView('overview')}
          className={`flex-1 py-3 flex flex-col items-center justify-center space-y-1 ${
            currentView === 'overview' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Layers className="w-6 h-6" />
          <span className="text-[10px] font-medium">总览分线</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
