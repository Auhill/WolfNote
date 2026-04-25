import React, { useState } from 'react';
import { RecordEntry } from './types';
import { User, Calendar, Skull, Pin } from 'lucide-react';

interface PlayerDetailViewProps {
  playerCount: number;
  records: RecordEntry[];
  onTogglePin: (recordId: string) => void;
}

export const PlayerDetailView: React.FC<PlayerDetailViewProps> = ({ playerCount, records, onTogglePin }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(1);

  const playerRecords = records.filter(r => {
    if (r.type === 'vote') {
      return r.data.target === selectedPlayer || r.data.voters.includes(selectedPlayer);
    }
    if (r.type === 'mark' || r.type === 'status' || r.type === 'death' || r.type === 'out') {
      return r.data.playerId === selectedPlayer;
    }
    if (r.type === 'speech') {
      return r.data.playerId === selectedPlayer;
    }
    if (r.type === 'expression') {
      return r.data.playerId === selectedPlayer;
    }
    return false;
  });

  // Group records by day
  const groupedRecords = playerRecords.reduce((groups, record) => {
    const day = record.day;
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(record);
    return groups;
  }, {} as Record<number, RecordEntry[]>);

  const sortedDays = Object.keys(groupedRecords).map(Number).sort((a, b) => b - a); // Newest day first

  const isDead = records.some(r => (r.type === 'death' || r.type === 'out') && r.data.playerId === selectedPlayer);

  return (
    <div className="flex flex-col h-full">
      <div className="flex overflow-x-auto p-4 space-x-2 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800 scrollbar-hide">
        {Array.from({ length: playerCount }, (_, i) => i + 1).map(id => {
          const playerIsDead = records.some(r => (r.type === 'death' || r.type === 'out') && r.data.playerId === id);
          return (
            <button
              key={id}
              onClick={() => setSelectedPlayer(id)}
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all font-bold relative ${
                selectedPlayer === id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-110' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              } ${playerIsDead ? 'opacity-50' : ''}`}
            >
              {id}
              {playerIsDead && <Skull className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-500" />
            {selectedPlayer} 号 玩家档案
          </h3>
          {isDead && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded flex items-center">
              <Skull className="w-3 h-3 mr-1" /> 已出局
            </span>
          )}
        </div>

        {sortedDays.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            该玩家暂无相关记录
          </div>
        ) : (
          sortedDays.map(day => (
            <div key={day} className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                <span>第 {day} 天</span>
              </div>
              
              <div className="space-y-3">
                {groupedRecords[day].map((r, i) => {
                  const time = new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={r.id || r.timestamp + i} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 group relative">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-gray-400">{time}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            r.type === 'vote' ? 'bg-blue-100 text-blue-600' :
                            r.type === 'mark' ? 'bg-green-100 text-green-600' :
                            r.type === 'status' ? 'bg-purple-100 text-purple-600' :
                            r.type === 'death' ? 'bg-red-100 text-red-600' :
                            r.type === 'out' ? 'bg-orange-100 text-orange-600' :
                            r.type === 'expression' ? 'bg-indigo-100 text-indigo-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {r.type === 'vote' ? '投票' : 
                             r.type === 'mark' ? '标记' : 
                             r.type === 'status' ? '状态' : 
                             r.type === 'death' ? '死亡' : 
                             r.type === 'out' ? '出局' : 
                             r.type === 'expression' ? '我的表达' :
                             '发言'}
                          </span>
                        </div>
                        <button 
                          onClick={() => onTogglePin(r.id)}
                          className={`p-1 rounded-full transition-colors ${r.pinned ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                          title={r.pinned ? "取消固定" : "固定到我的发言"}
                        >
                          <Pin className={`w-3 h-3 ${r.pinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      {r.type === 'vote' && (
                        <p className="text-sm">
                          {r.data.voters.includes(selectedPlayer) 
                            ? `投票给 ${r.data.target === 0 ? '弃票' : `${r.data.target} 号`}` 
                            : `被 ${r.data.voters.join(', ')} 号 投了`}
                          {r.data.type === 'sheriff_vote' && <span className="text-blue-500 ml-1 font-semibold">(警长)</span>}
                        </p>
                      )}
                      {r.type === 'mark' && (
                        <p className="text-sm">
                          被标记为 <span className="font-bold">{r.data.role}</span> (权重: {r.data.weight})
                        </p>
                      )}
                      {r.type === 'status' && (
                        <p className="text-sm">
                          被标记状态: <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-800 rounded text-xs font-bold">{r.data.label}</span>
                        </p>
                      )}
                      {r.type === 'death' && (
                        <p className="text-sm text-red-600 font-bold">在该天死亡</p>
                      )}
                      {r.type === 'out' && (
                        <p className="text-sm text-orange-600 font-bold">在该天被投票出局</p>
                      )}
                      {r.type === 'speech' && (
                        <p className="text-sm italic text-gray-600 dark:text-gray-400">"{r.data.content}"</p>
                      )}
                      {r.type === 'expression' && (
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          {r.data.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
