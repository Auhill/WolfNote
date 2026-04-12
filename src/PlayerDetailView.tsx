import React, { useState } from 'react';
import { RecordEntry } from './types';
import { User } from 'lucide-react';

interface PlayerDetailViewProps {
  playerCount: number;
  records: RecordEntry[];
}

export const PlayerDetailView: React.FC<PlayerDetailViewProps> = ({ playerCount, records }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(1);

  const playerRecords = records.filter(r => {
    if (r.type === 'vote') {
      return r.data.target === selectedPlayer || r.data.voters.includes(selectedPlayer);
    }
    if (r.type === 'mark' || r.type === 'status') {
      return r.data.playerId === selectedPlayer;
    }
    if (r.type === 'speech') {
      return r.data.playerId === selectedPlayer;
    }
    return false;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex overflow-x-auto p-4 space-x-2 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800 scrollbar-hide">
        {Array.from({ length: playerCount }, (_, i) => i + 1).map(id => (
          <button
            key={id}
            onClick={() => setSelectedPlayer(id)}
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all font-bold ${
              selectedPlayer === id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-110' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h3 className="text-lg font-bold flex items-center mb-2">
          <User className="w-5 h-5 mr-2 text-blue-500" />
          {selectedPlayer} 号 玩家档案
        </h3>

        {playerRecords.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            该玩家暂无相关记录
          </div>
        ) : (
          playerRecords.map((r, i) => {
            const time = new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={r.timestamp + i} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-gray-400">{time}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    r.type === 'vote' ? 'bg-blue-100 text-blue-600' :
                    r.type === 'mark' ? 'bg-green-100 text-green-600' :
                    r.type === 'status' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {r.type === 'vote' ? '投票' : r.type === 'mark' ? '标记' : r.type === 'status' ? '状态' : '发言'}
                  </span>
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
                {r.type === 'speech' && (
                  <p className="text-sm italic text-gray-600 dark:text-gray-400">"{r.data.content}"</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
