import { RecordEntry } from './types';

export function parseInput(input: string): RecordEntry | null {
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
      type: 'vote',
      data: {
        type: isSheriff ? 'sheriff_vote' : 'vote',
        target,
        voters
      },
      raw: input,
      timestamp
    };
  }

  // 2. Mark Role: b[player]:[role][weight?]
  const markMatch = normalized.match(/^b(\d+):([^\d\s,]+)([\d.]+)?$/);
  if (markMatch) {
    const playerId = parseInt(markMatch[1], 10);
    const role = markMatch[2];
    const weight = markMatch[3] ? parseFloat(markMatch[3]) : 1.0;
    
    return {
      type: 'mark',
      data: {
        playerId,
        role,
        weight
      },
      raw: input,
      timestamp
    };
  }

  // 3. Status: s[player]:[status]
  const statusMatch = normalized.match(/^s(\d+):([^\d\s]+)$/);
  if (statusMatch) {
    const playerId = parseInt(statusMatch[1], 10);
    const label = statusMatch[2];
    
    return {
      type: 'status',
      data: {
        playerId,
        label
      },
      raw: input,
      timestamp
    };
  }

  // 4. Speech: t[player]:[content]
  const speechMatch = normalized.match(/^t(\d+)[:](.+)$/);
  if (speechMatch) {
    const playerId = parseInt(speechMatch[1], 10);
    const content = speechMatch[2].trim();
    
    return {
      type: 'speech',
      data: {
        playerId,
        content
      },
      raw: input,
      timestamp
    };
  }

  return null;
}
