import React from 'react';
import { HelpCircle, Vote, CheckCircle2, Tag, MessageSquare, Skull, UserMinus, Quote } from 'lucide-react';

export const CommandHelpView: React.FC = () => {
  const commands = [
    {
      icon: <Quote className="w-5 h-5 text-indigo-500" />,
      title: '我的表达',
      syntax: 'm[玩家?]:[内容]',
      example: 'm9:发言有矛盾',
      desc: '记录自己的推导逻辑，会自动固定到“我的发言”视图。',
      fuzzy: '可以不带玩家ID，如 m:怀疑1,2是狼。'
    },
    {
      icon: <Vote className="w-5 h-5 text-blue-500" />,
      title: '投票记录',
      syntax: 'v[目标]:[投票者]',
      example: 'v3:1,2',
      desc: '记录1号和2号投给了3号。',
      fuzzy: '支持中英文冒号（: ：）、逗号（, ，）和顿号（、）。'
    },
    {
      icon: <Vote className="w-5 h-5 text-indigo-500" />,
      title: '警长投票',
      syntax: 'vs[目标]:[投票者]',
      example: 'vs3:1,2',
      desc: '记录警长竞选阶段的投票。'
    },
    {
      icon: <Vote className="w-5 h-5 text-gray-400" />,
      title: '弃票记录',
      syntax: 'v0:[投票者]',
      example: 'v0:5',
      desc: '记录5号玩家弃票（目标填0）。'
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      title: '身份标记',
      syntax: 'b[玩家]:[角色][权重?]',
      example: 'b1:预言家0.8',
      desc: '标记1号为预言家，嫌疑度/权重为0.8（默认为1）。'
    },
    {
      icon: <Tag className="w-5 h-5 text-purple-500" />,
      title: '状态标记',
      syntax: 's[玩家]:[状态]',
      example: 's1:倒钩',
      desc: '给1号打上“倒钩”、“冲锋”等逻辑状态标签。'
    },
    {
      icon: <Skull className="w-5 h-5 text-red-500" />,
      title: '玩家死亡',
      syntax: 'd[玩家]',
      example: 'd1',
      desc: '记录1号玩家在当前天死亡（夜间出人等）。'
    },
    {
      icon: <UserMinus className="w-5 h-5 text-orange-500" />,
      title: '投票出局',
      syntax: 'o[玩家]',
      example: 'o1',
      desc: '记录1号玩家在当前天被放逐出局。'
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-orange-500" />,
      title: '发言记录',
      syntax: 't[玩家]:[内容]',
      example: 't1:对话3号',
      desc: '简单记录1号的发言核心逻辑。'
    }
  ];

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto bg-gray-50 dark:bg-black">
      <div className="flex items-center space-x-2 mb-6">
        <HelpCircle className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold">指令速查表</h2>
      </div>

      <div className="space-y-4">
        {commands.map((cmd, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              {cmd.icon}
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{cmd.title}</h3>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono text-sm mb-2 border dark:border-gray-700">
              <span className="text-blue-600 dark:text-blue-400">{cmd.syntax}</span>
              <span className="text-gray-400 mx-2">→</span>
              <span className="text-green-600 dark:text-green-400">{cmd.example}</span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{cmd.desc}</p>
            {cmd.fuzzy && (
              <p className="text-[10px] text-orange-500 font-medium">💡 {cmd.fuzzy}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">模糊匹配说明</h4>
        <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
          为了方便手机输入，系统会自动识别并转换以下字符：
          <br />• 冒号：支持 <code className="bg-white px-1">:</code> 和 <code className="bg-white px-1">：</code>
          <br />• 分隔符：支持 <code className="bg-white px-1">,</code> <code className="bg-white px-1">，</code> 和 <code className="bg-white px-1">、</code>
        </p>
      </div>
    </div>
  );
};
