import React, { useState, useEffect } from 'react';
import { GameState, RecordEntry, Role, Hypothesis } from './types';
import { SetupView } from './SetupView';
import { MainLogView } from './MainLogView';
import { PlayerDetailView } from './PlayerDetailView';
import { RoleOverviewView } from './RoleOverviewView';
import { CommandHelpView } from './CommandHelpView';
import { MySpeechView } from './MySpeechView';
import { LayoutList, User, Layers, RotateCcw, HelpCircle, MessageSquare } from 'lucide-react';

type View = 'setup' | 'main' | 'player' | 'overview' | 'help' | 'myspeech';

const STORAGE_KEY = 'wolf_note_state';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    
    // Migration: ensure records have IDs
    let changed = false;
    if (parsed && parsed.records) {
      parsed.records = parsed.records.map((r: any) => {
        if (!r.id) {
          changed = true;
          return { ...r, id: Math.random().toString(36).substring(2, 11) };
        }
        return r;
      });
    }

    // Migration: ensure pinnedOrder exists
    if (parsed && !parsed.pinnedOrder) {
      changed = true;
      parsed.pinnedOrder = parsed.records
        .filter((r: RecordEntry) => r.pinned)
        .sort((a: RecordEntry, b: RecordEntry) => (b.pinnedAt || 0) - (a.pinnedAt || 0))
        .map((r: RecordEntry) => r.id);
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
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
      currentDay: 1,
      pinnedOrder: [],
    };
    setGameState(newState);
    setCurrentView('main');
  };

  const handleNextDay = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      currentDay: gameState.currentDay + 1,
    });
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
    const newRecords = [...gameState.records, record];
    let newPinnedOrder = [...gameState.pinnedOrder];
    
    if (record.pinned) {
      newPinnedOrder = [record.id, ...newPinnedOrder];
    }

    setGameState({
      ...gameState,
      records: newRecords,
      pinnedOrder: newPinnedOrder,
    });
  };

  const handleTogglePin = (recordId: string) => {
    if (!gameState) return;
    const record = gameState.records.find(r => r.id === recordId);
    if (!record) return;

    const isPinned = !!record.pinned;
    const timestamp = Date.now();

    const newRecords = gameState.records.map(r => 
      r.id === recordId 
        ? { ...r, pinned: !isPinned, pinnedAt: !isPinned ? timestamp : undefined } 
        : r
    );

    let newPinnedOrder = [...gameState.pinnedOrder];
    if (!isPinned) {
      // Add to top
      newPinnedOrder = [recordId, ...newPinnedOrder];
    } else {
      // Remove
      newPinnedOrder = newPinnedOrder.filter(id => id !== recordId);
    }

    setGameState({
      ...gameState,
      records: newRecords,
      pinnedOrder: newPinnedOrder,
    });
  };

  const handleUpdatePinnedOrder = (newOrder: string[]) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      pinnedOrder: newOrder,
    });
  };

  const handleClearAllPinned = () => {
    if (!gameState) return;
    if (!confirm('确定要清空所有已固定的发言信息吗？')) return;

    const newRecords = gameState.records.map(r => ({
      ...r,
      pinned: false,
      pinnedAt: undefined
    }));

    setGameState({
      ...gameState,
      records: newRecords,
      pinnedOrder: [],
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
            currentDay={gameState.currentDay}
            onNextDay={handleNextDay}
            onTogglePin={handleTogglePin}
          />
        )}
        {currentView === 'player' && (
          <PlayerDetailView 
            playerCount={gameState.playerCount} 
            records={gameState.records} 
            onTogglePin={handleTogglePin}
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
        {currentView === 'myspeech' && (
          <MySpeechView 
            records={gameState.records}
            pinnedOrder={gameState.pinnedOrder}
            onUpdateOrder={handleUpdatePinnedOrder}
            onTogglePin={handleTogglePin}
            onClearAll={handleClearAllPinned}
          />
        )}
        {currentView === 'help' && (
          <CommandHelpView />
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
          onClick={() => setCurrentView('myspeech')}
          className={`flex-1 py-3 flex flex-col items-center justify-center space-y-1 ${
            currentView === 'myspeech' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">我的发言</span>
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
        <button 
          onClick={() => setCurrentView('help')}
          className={`flex-1 py-3 flex flex-col items-center justify-center space-y-1 ${
            currentView === 'help' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <HelpCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">指令说明</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
