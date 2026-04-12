import React, { useState } from 'react';
import { Role } from './types';

interface SetupViewProps {
  onStart: (playerCount: number, initialRoles: { role: Role; count: number }[]) => void;
}

const DEFAULT_ROLES: { role: Role; count: number }[] = [
  { role: '普通村民', count: 4 },
  { role: '预言家', count: 1 },
  { role: '女巫', count: 1 },
  { role: '猎人', count: 1 },
  { role: '守卫', count: 1 },
  { role: '白痴', count: 0 },
  { role: '狼人', count: 4 },
];

export const SetupView: React.FC<SetupViewProps> = ({ onStart }) => {
  const [playerCount, setPlayerCount] = useState(12);
  const [roles, setRoles] = useState(DEFAULT_ROLES);

  const updateRoleCount = (index: number, delta: number) => {
    const newRoles = [...roles];
    newRoles[index].count = Math.max(0, newRoles[index].count + delta);
    setRoles(newRoles);
    
    // Auto-update total player count based on roles
    const total = newRoles.reduce((sum, r) => sum + r.count, 0);
    setPlayerCount(total);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">新开一局</h1>
      
      <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <label className="block text-sm font-medium mb-2">玩家总数: {playerCount}</label>
        <input 
          type="range" 
          min="6" 
          max="18" 
          value={playerCount} 
          onChange={(e) => setPlayerCount(parseInt(e.target.value))}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">身份配置</h2>
        {roles.map((r, i) => (
          <div key={r.role} className="flex items-center justify-between p-2 border-b dark:border-gray-700">
            <span>{r.role}</span>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => updateRoleCount(i, -1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full"
              >-</button>
              <span className="w-6 text-center">{r.count}</span>
              <button 
                onClick={() => updateRoleCount(i, 1)}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full"
              >+</button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => onStart(playerCount, roles.filter(r => r.count > 0))}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-transform"
      >
        开始对局
      </button>
    </div>
  );
};
