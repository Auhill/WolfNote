import React from 'react';
import { RecordEntry } from './types';
import { 
  Pin, 
  PinOff, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  MessageSquare, 
  Vote, 
  CheckCircle2, 
  Tag, 
  Skull, 
  UserMinus,
  Quote
} from 'lucide-react';

interface MySpeechViewProps {
  records: RecordEntry[];
  pinnedOrder: string[];
  onUpdateOrder: (newOrder: string[]) => void;
  onTogglePin: (recordId: string) => void;
  onClearAll: () => void;
}

export const MySpeechView: React.FC<MySpeechViewProps> = ({ 
  records, 
  pinnedOrder, 
  onUpdateOrder, 
  onTogglePin,
  onClearAll
}) => {
  const pinnedRecords = pinnedOrder
    .map(id => records.find(r => r.id === id))
    .filter((r): r is RecordEntry => !!r);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...pinnedOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onUpdateOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === pinnedOrder.length - 1) return;
    const newOrder = [...pinnedOrder];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    onUpdateOrder(newOrder);
  };

  const renderRecordIcon = (type: string) => {
    switch (type) {
      case 'vote': return <Vote className="w-4 h-4 text-blue-500" />;
      case 'mark': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'status': return <Tag className="w-4 h-4 text-purple-500" />;
      case 'death': return <Skull className="w-4 h-4 text-red-500" />;
      case 'out': return <UserMinus className="w-4 h-4 text-orange-500" />;
      case 'speech': return <MessageSquare className="w-4 h-4 text-gray-500" />;
      case 'expression': return <Quote className="w-4 h-4 text-indigo-500" />;
      default: return null;
    }
  };

  const renderRecordContent = (record: RecordEntry) => {
    switch (record.type) {
      case 'vote':
        return (
          <p className="text-sm">
            {record.data.type === 'sheriff_vote' ? '[警长] ' : ''}
            {record.data.voters.join(', ')} 号 投给 {record.data.target === 0 ? '弃票' : `${record.data.target} 号`}
          </p>
        );
      case 'mark':
        return (
          <p className="text-sm">
            {record.data.playerId} 号: <span className="font-bold">{record.data.role}</span> (权重: {record.data.weight})
          </p>
        );
      case 'status':
        return (
          <p className="text-sm">
            {record.data.playerId} 号: <span className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-[10px] font-bold">{record.data.label}</span>
          </p>
        );
      case 'death':
        return <p className="text-sm">{record.data.playerId} 号 玩家死亡</p>;
      case 'out':
        return <p className="text-sm">{record.data.playerId} 号 玩家被投票出局</p>;
      case 'speech':
        return (
          <p className="text-sm italic">
            {record.data.playerId} 号: "{record.data.content}"
          </p>
        );
      case 'expression':
        return (
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {record.data.playerId ? `${record.data.playerId} 号: ` : ''}{record.data.content}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <h2 className="text-lg font-bold flex items-center">
          <Quote className="w-5 h-5 mr-2 text-indigo-500" />
          我的发言
        </h2>
        {pinnedRecords.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-xs text-red-500 font-medium flex items-center hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            全部清空
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pinnedRecords.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 px-8">
            <Pin className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">还没有固定的发言信息</p>
            <p className="text-xs mt-2">在主页或人员视图点击 Pin 图标，或使用 m 指令添加个人表达信息</p>
          </div>
        ) : (
          pinnedRecords.map((record, index) => (
            <div 
              key={record.id}
              className="group flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all"
            >
              {/* Drag/Reorder Handles */}
              <div className="flex flex-col space-y-1">
                <button 
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${index === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => moveDown(index)}
                  disabled={index === pinnedRecords.length - 1}
                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${index === pinnedRecords.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                {renderRecordIcon(record.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[10px] text-gray-400">Day {record.day}</span>
                  <button 
                    onClick={() => onTogglePin(record.id)}
                    className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    title="取消固定"
                  >
                    <PinOff className="w-3 h-3" />
                  </button>
                </div>
                {renderRecordContent(record)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
