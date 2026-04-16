import React, { useState } from 'react';
import { RecordEntry, Hypothesis, Role } from './types';
import { Layers, Plus, ChevronRight, Trash2, FileText, Copy, X } from 'lucide-react';

interface RoleOverviewViewProps {
  playerCount: number;
  records: RecordEntry[];
  hypotheses: Hypothesis[];
  onAddHypothesis: (h: Hypothesis) => void;
  onDeleteHypothesis: (id: string) => void;
}

export const RoleOverviewView: React.FC<RoleOverviewViewProps> = ({ 
  playerCount, 
  records, 
  hypotheses, 
  onAddHypothesis,
  onDeleteHypothesis
}) => {
  const [showAddH, setShowAddH] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [newH, setNewH] = useState({ title: '', assumptions: [] as { playerId: number; role: Role }[] });

  // Generate the structured text for AI analysis
  const generateSummaryText = () => {
    let text = `狼人杀对局概览 (用于逻辑推导分析)\n`;
    text += `玩家总数: ${playerCount}\n`;
    text += `当前进度: 第 ${records.length > 0 ? Math.max(...records.map(r => r.day)) : 1} 天\n\n`;

    text += `--- 对局详细记录 ---\n`;
    const days = Array.from(new Set(records.map(r => r.day))).sort((a, b) => a - b);
    
    days.forEach(day => {
      text += `[第 ${day} 天]\n`;
      const dayRecords = records.filter(r => r.day === day).sort((a, b) => a.timestamp - b.timestamp);
      
      dayRecords.forEach(r => {
        switch (r.type) {
          case 'speech':
            text += `- ${r.data.playerId}号发言: "${r.data.content}"\n`;
            break;
          case 'vote':
            const typeStr = r.data.type === 'sheriff_vote' ? '警长投票' : '放逐投票';
            text += `- ${typeStr}: ${r.data.voters.join(',')} 投给 ${r.data.target === 0 ? '弃票' : r.data.target + '号'}\n`;
            break;
          case 'mark':
            text += `- 标记: ${r.data.playerId}号 为 ${r.data.role} (权重:${r.data.weight})\n`;
            break;
          case 'status':
            text += `- 状态: ${r.data.playerId}号 被标记为 "${r.data.label}"\n`;
            break;
          case 'death':
            text += `- 死亡事件: ${r.data.playerId}号 玩家死亡\n`;
            break;
          case 'out':
            text += `- 出局事件: ${r.data.playerId}号 玩家被投票放逐\n`;
            break;
        }
      });
      text += `\n`;
    });

    if (hypotheses.length > 0) {
      text += `--- 现有逻辑假设 ---\n`;
      hypotheses.forEach(h => {
        text += `分线: ${h.title}\n`;
        h.assumptions.forEach(a => {
          text += `  - 假设 ${a.playerId}号 是 ${a.role}\n`;
        });
        h.deductions.forEach(d => {
          text += `  - 推论: ${d}\n`;
        });
        text += `\n`;
      });
    }

    text += `\n请根据以上信息，分析当前的局势，判断谁最有可能是真预言家，谁最有可能是狼人，并给出逻辑理由。`;
    return text;
  };

  const copyToClipboard = () => {
    const text = generateSummaryText();
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板，快去粘贴给 AI 吧！');
    });
  };

  // Calculate most probable roles for each player based on marks
  const getProbableRoles = (pid: number) => {
    const marks = records.filter(r => r.type === 'mark' && r.data.playerId === pid);
    if (marks.length === 0) return '未知';
    
    const latest = marks[marks.length - 1];
    if (latest.type !== 'mark') return '未知';
    return `${latest.data.role} (${latest.data.weight})`;
  };

  const getStatusLabels = (pid: number) => {
    const statusRecords = records.filter(r => r.type === 'status' && r.data.playerId === pid);
    // Get unique status labels (most recent for each label or just all unique?)
    // Let's show all unique labels applied to this player.
    const labels = Array.from(new Set(statusRecords.map(r => {
      if (r.type === 'status') return r.data.label;
      return null;
    }).filter((l): l is string => l !== null)));
    return labels;
  };

  const addAssumption = (pid: number, role: Role) => {
    setNewH({
      ...newH,
      assumptions: [...newH.assumptions.filter(a => a.playerId !== pid), { playerId: pid, role }]
    });
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Layers className="w-5 h-5 mr-2 text-blue-500" />
          身份总览
        </h2>
        <button 
          onClick={() => setShowSummary(true)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>AI 分析概览</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {Array.from({ length: playerCount }, (_, i) => i + 1).map(id => (
          <div key={id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-bold mb-1">{id}</span>
              <div className="flex flex-wrap gap-1">
                {getStatusLabels(id).map(label => (
                  <span key={label} className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[8px] rounded font-bold uppercase">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-sm font-medium">{getProbableRoles(id)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">身份分线 (Hypotheses)</h3>
        <button 
          onClick={() => setShowAddH(true)}
          className="p-2 bg-blue-600 text-white rounded-full shadow-md"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {hypotheses.map(h => (
          <div key={h.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 relative">
            <button 
              onClick={() => onDeleteHypothesis(h.id)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">{h.title}</h4>
            <div className="space-y-1 mb-4">
              {h.assumptions.map((a, i) => (
                <div key={i} className="text-sm flex items-center">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  <span>{a.playerId} 号 是 <span className="font-bold">{a.role}</span></span>
                </div>
              ))}
            </div>

            {h.deductions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800 space-y-1">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">逻辑推导</p>
                {h.deductions.map((d, i) => (
                  <p key={i} className="text-xs text-blue-700 dark:text-blue-300">· {d}</p>
                ))}
              </div>
            )}

            <button 
              onClick={() => {
                const d = prompt('输入该分线的逻辑推导 (如: 2,3,5是狼)');
                if (d) {
                  const updatedH = { ...h, deductions: [...h.deductions, d] };
                  onDeleteHypothesis(h.id);
                  onAddHypothesis(updatedH);
                }
              }}
              className="mt-3 text-[10px] bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-bold flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> 添加推导
            </button>
          </div>
        ))}
      </div>

      {showAddH && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-center">新增身份分线</h3>
            <input 
              type="text" 
              placeholder="分线标题 (如: 1号真预)" 
              value={newH.title}
              onChange={(e) => setNewH({ ...newH, title: e.target.value })}
              className="w-full px-4 py-2 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="mb-4 max-h-40 overflow-y-auto border-y py-2 dark:border-gray-800">
              <p className="text-xs text-gray-500 mb-2">添加假设 (点击玩家 ID):</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: playerCount }, (_, i) => i + 1).map(id => (
                  <button 
                    key={id}
                    onClick={() => {
                      const role = prompt(`${id}号假设身份为? (预言家/狼人/...)`);
                      if (role) addAssumption(id, role);
                    }}
                    className={`w-8 h-8 rounded-full border text-xs flex items-center justify-center ${
                      newH.assumptions.find(a => a.playerId === id) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowAddH(false)}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (newH.title && newH.assumptions.length > 0) {
                    onAddHypothesis({
                      id: Date.now().toString(),
                      title: newH.title,
                      assumptions: newH.assumptions,
                      deductions: []
                    });
                    setNewH({ title: '', assumptions: [] });
                    setShowAddH(false);
                  }
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl flex flex-col max-h-[80vh] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-800 dark:text-gray-200">AI 分析概览文本</h3>
              </div>
              <button onClick={() => setShowSummary(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                {generateSummaryText()}
              </pre>
            </div>

            <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex space-x-3">
              <button 
                onClick={() => setShowSummary(false)}
                className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold active:scale-95 transition-all"
              >
                关闭
              </button>
              <button 
                onClick={copyToClipboard}
                className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>复制全部文本</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
