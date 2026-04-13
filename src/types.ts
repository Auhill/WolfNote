export type Role = '普通村民' | '预言家' | '女巫' | '猎人' | '守卫' | '白痴' | '狼人' | string;
export type PlayerStatusLabel = '倒钩' | '冲锋' | string;

export interface PlayerStatus {
  id: number;
  roles: { role: Role; weight: number }[];
  statusLabels: PlayerStatusLabel[];
  isAlive: boolean;
}

export interface VoteRecord {
  type: 'vote' | 'sheriff_vote';
  target: number; // 0 for abstention
  voters: number[];
}

export interface SpeechRecord {
  playerId: number;
  content: string;
}

export interface RoleMarkRecord {
  playerId: number;
  role: Role;
  weight: number;
}

export interface StatusMarkRecord {
  playerId: number;
  label: PlayerStatusLabel;
}

export interface DeathRecord {
  playerId: number;
}

export interface OutRecord {
  playerId: number;
}

export type RecordEntry = 
  | { type: 'vote'; data: VoteRecord; raw: string; timestamp: number; day: number }
  | { type: 'speech'; data: SpeechRecord; raw: string; timestamp: number; day: number }
  | { type: 'mark'; data: RoleMarkRecord; raw: string; timestamp: number; day: number }
  | { type: 'status'; data: StatusMarkRecord; raw: string; timestamp: number; day: number }
  | { type: 'death'; data: DeathRecord; raw: string; timestamp: number; day: number }
  | { type: 'out'; data: OutRecord; raw: string; timestamp: number; day: number };

export interface Hypothesis {
  id: string;
  title: string;
  assumptions: { playerId: number; role: Role }[];
  deductions: string[];
}

export interface GameState {
  playerCount: number;
  players: PlayerStatus[];
  records: RecordEntry[];
  hypotheses: Hypothesis[];
  currentHypothesisId: string | null;
  currentDay: number;
}
