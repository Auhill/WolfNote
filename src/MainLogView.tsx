import React, { useState, useRef, useEffect } from 'react';
import { RecordEntry } from './types';
import { parseInput } from './parser';
import { Send, CheckCircle2, MessageSquare, Vote, Tag, Skull, UserMinus, Calendar, Pin, Quote } from 'lucide-react';

interface MainLogViewProps {
  records: RecordEntry[];
  onAddRecord: (record: RecordEntry) => void;
  currentDay: number;
  onNextDay: () => void;
  onTogglePin: (recordId: string) => void;
}

export const MainLogView: React.FC<MainLogViewProps> = ({ records, onAddRecord, currentDay, onNextDay, onTogglePin }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [records]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const record = parseInput(input.trim(), currentDay);
    if (record) {
      onAddRecord(record);
      setInput('');
      setError(null);
    } else {
      setError('格式错误，请检查输入格式');
    }
  };

  const renderRecord = (record: RecordEntry) => {
    const time = new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const pinButton = (
      <button 
        onClick={() => onTogglePin(record.id)}
        className={`p-1.5 rounded-full transition-colors ${record.pinned ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title={record.pinned ? "取消固定" : "固定到我的发言"}
      >
        <Pin className={`w-3.5 h-3.5 ${record.pinned ? 'fill-current' : ''}`} />
      </button>
    );

    switch (record.type) {
      case 'vote':
        return (
          <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group">
            <Vote className="w-5 h-5 text-blue-500 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-blue-700 dark:text-blue-300">
                  {record.data.type === 'sheriff_vote' ? '警长投票' : '放逐投票'}
                </p>
                {pinButton}
              </div>
              <p className="text-sm">
                {record.data.voters.join(', ')} 号 投给 {record.data.target === 0 ? '弃票' : `${record.data.target} 号`}
              </p>
              <span className="text-[10px] text-gray-400">第 {record.day} 天 | {time} | {record.raw}</span>
            </div>
          </div>
        );
      case 'mark':
        return (
          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg group">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-green-700 dark:text-green-300">身份标记</p>
                {pinButton}
              </div>
              <p className="text-sm">
                {record.data.playerId} 号: <span className="font-bold">{record.data.role}</span> (权重: {record.data.weight})
              </p>
              <span className="text-[10px] text-gray-400">第 {record.day} 天 | {time} | {record.raw}</span>
            </div>
          </div>
        );
      case 'status':
        return (
          <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg group">
            <Tag className="w-5 h-5 text-purple-500 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-purple-700 dark:text-purple-300">状态标记</p>
                {pinButton}
              </div>
              <p className="text-sm">
                {record.data.playerId} 号: <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-800 rounded text-xs font-bold uppercase">{record.data.label}</span>
              </p>
              <span className="text-[10px] text-gray-400">第 {record.day} 天 | {time} | {record.raw}</span>
            </div>
          </div>
        );
      case 'death':
        return (
          <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg group">
            <Skull className="w-5 h-5 text-red-500 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-red-700 dark:text-red-300">玩家死亡</p>
                {pinButton}
              </div>
              <p className="text-sm">
                {record.data.playerId} 号 玩家 <span className="font-bold text-red-600">死亡</span>
              </p>
              <span className="text-[10px] text-gray-400">第 {record.day} 天 | {time} | {record.raw}</span>
            </div>
          </div>
        );
      case 'out':
        return (
          <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg group">
            <UserMinus className="w-5 h-5 text-orange-500 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-orange-700 dark:text-orange-300">投票出局</p>
                {pinButton}
              </div>
              <p className="text-sm">
                {record.data.playerId} 号 玩家 <span className="font-bold text-orange-600">被放逐出局</span>
              </p>
              <span className="text-[10px] text-gray-400">第 {record.day} 天 | {time} | {record.raw}</span>
            </div>
          </div>
        );
      case 'speech':
        return (
          <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group">
            <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-700 dark:text-gray-300">{record.data.playerId} 号 发言</p>
                {pinButton}
              </div>
              <p className="text-sm italic">"{record.data.content}"</p>
              <span className="text-[10px] text-gray-400">第 {record.day} 天 | {time} | {record.raw}</span>
            </div>
          </div>
        );
      case 'expression':
        return (
          <div className="flex items-start space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg group border border-indigo-100 dark:border-indigo-800">
            <Quote className="w-5 h-5 text-indigo-500 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300">我的表达</p>
                {pinButton}
              </div>
              <p className="text-sm font-medium">
                {record.data.playerId ? `${record.data.playerId} 号: ` : ''}{record.data.content}
              </p>
              <span className="text-[10px] text-gray-400">第 {record.day} 天 | {time} | {record.raw}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 flex justify-between items-center border-b dark:border-gray-800">
        <div className="flex items-center space-x-2 text-blue-600 font-bold">
          <Calendar className="w-4 h-4" />
          <span>第 {currentDay} 天</span>
        </div>
        <button 
          onClick={onNextDay}
          className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm active:scale-95 transition-transform"
        >
          进入下一天
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {records.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p>还没有记录，请在下方输入：</p>
            <div className="mt-4 text-xs text-left max-w-[200px] mx-auto space-y-1">
              <p>• v3:1,2 (1,2号投3)</p>
              <p>• vs3:1,2 (警长投票)</p>
              <p>• s1:倒钩 (1号标记状态)</p>
              <p>• b1:预言家0.8 (1号标记为预言家)</p>
              <p>• t1:跳预言家 (1号发言记录)</p>
              <p>• d1 (1号死亡) | o1 (1号出局)</p>
            </div>
          </div>
        ) : (
          records.map((r, i) => (
            <div key={r.timestamp + i}>
              {renderRecord(r)}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-black">
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入指令 (如 v3:1,2)"
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full active:scale-90 transition-transform shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
