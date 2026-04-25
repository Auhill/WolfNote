import { RecordEntry } from './types';

const generateId = () => Math.random().toString(36).substring(2, 11);

export function parseInput(input: string, day: number): RecordEntry | null {
  const timestamp = Date.now();
  
  // Normalize input: Replace Chinese colons, commas and ideographic commas with English ones
  const normalized = input
    .replace(/[：]/g, ':')
    .replace(/[，、]/g, ',');

  // 1. Vote: v[target]:[voters] or vs[target]:[voters] (sheriff)
  const voteMatch = normalized.match(/^(vs|v)(\d+):([\d,]+)$/);
  if (voteMatch) {
    const isSheriff = voteMatch[1] === 'vs';
    const target = parseInt(voteMatch[2], 10);
    const voters = voteMatch[3].split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
    
    // Support v0:5 (abstain) where 0 is the target
    return {
      id: generateId(),
      type: 'vote',
      data: {
        type: isSheriff ? 'sheriff_vote' : 'vote',
        target,
        voters
      },
      raw: input,
      timestamp,
      day
    };
  }

  // 2. Mark Role: b[player]:[role][weight?]
  const markMatch = normalized.match(/^b(\d+):([^\d\s,]+)([\d.]+)?$/);
  if (markMatch) {
    const playerId = parseInt(markMatch[1], 10);
    const role = markMatch[2];
    const weight = markMatch[3] ? parseFloat(markMatch[3]) : 1.0;
    
    return {
      id: generateId(),
      type: 'mark',
      data: {
        playerId,
        role,
        weight
      },
      raw: input,
      timestamp,
      day
    };
  }

  // 3. Status: s[player]:[status]
  const statusMatch = normalized.match(/^s(\d+):([^\d\s]+)$/);
  if (statusMatch) {
    const playerId = parseInt(statusMatch[1], 10);
    const label = statusMatch[2];
    
    return {
      id: generateId(),
      type: 'status',
      data: {
        playerId,
        label
      },
      raw: input,
      timestamp,
      day
    };
  }

  // 4. Death: d[player]
  const deathMatch = normalized.match(/^d(\d+)$/);
  if (deathMatch) {
    const playerId = parseInt(deathMatch[1], 10);
    return {
      id: generateId(),
      type: 'death',
      data: { playerId },
      raw: input,
      timestamp,
      day
    };
  }

  // 5. Out: o[player]
  const outMatch = normalized.match(/^o(\d+)$/);
  if (outMatch) {
    const playerId = parseInt(outMatch[1], 10);
    return {
      id: generateId(),
      type: 'out',
      data: { playerId },
      raw: input,
      timestamp,
      day
    };
  }

  // 6. Speech: t[player]:[content]
  const speechMatch = normalized.match(/^t(\d+)[:](.+)$/);
  if (speechMatch) {
    const playerId = parseInt(speechMatch[1], 10);
    const content = speechMatch[2].trim();
    
    return {
      id: generateId(),
      type: 'speech',
      data: {
        playerId,
        content
      },
      raw: input,
      timestamp,
      day
    };
  }

  // 7. Expression: m[player]:[content] or m:[content]
  const expressionMatch = normalized.match(/^m(\d*)[:](.+)$/);
  if (expressionMatch) {
    const playerId = expressionMatch[1] ? parseInt(expressionMatch[1], 10) : undefined;
    const content = expressionMatch[2].trim();
    
    return {
      id: generateId(),
      type: 'expression',
      data: {
        playerId,
        content
      },
      raw: input,
      timestamp,
      day,
      pinned: true,
      pinnedAt: timestamp
    };
  }

  return null;
}
