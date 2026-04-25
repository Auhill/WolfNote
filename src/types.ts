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

export interface ExpressionRecord {
  playerId?: number;
  content: string;
}

export interface RecordEntryBase {
  id: string;
  raw: string;
  timestamp: number;
  day: number;
  pinned?: boolean;
  pinnedAt?: number;
}

export type RecordEntry = 
  | (RecordEntryBase & { type: 'vote'; data: VoteRecord })
  | (RecordEntryBase & { type: 'speech'; data: SpeechRecord })
  | (RecordEntryBase & { type: 'mark'; data: RoleMarkRecord })
  | (RecordEntryBase & { type: 'status'; data: StatusMarkRecord })
  | (RecordEntryBase & { type: 'death'; data: DeathRecord })
  | (RecordEntryBase & { type: 'out'; data: OutRecord })
  | (RecordEntryBase & { type: 'expression'; data: ExpressionRecord });

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
  pinnedOrder: string[]; // IDs of pinned records in order
}
