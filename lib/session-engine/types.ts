export interface MediaItem {
  id: string;
  type: 'SEGMENT' | 'MANTRA' | 'VISUAL';
  content: string;
  theme?: string;
  difficulty?: 'BASIC' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXTREME';
  points?: number;
  duration?: number;
  filepath?: string;
  channel?: 'L' | 'R' | 'C';
  voice?: string;
  flashRate?: number;
  filters?: {
    difficultyMin?: 'BASIC' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXTREME';
    difficultyMax?: 'BASIC' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXTREME';
    dominantName?: string;
    submissiveName?: string;
    themeFilter?: string;
  };
}

export interface ArrangedItem {
  item: MediaItem;
  audioPan?: number;
  imagePos?: 'left' | 'center' | 'right';
  startTime?: number;
  volume?: number;
  effect?: string;
}

export interface SessionState {
  arousal: number;
  focus: number;
  depth: number;
  timestamp: Date;
}

export interface PhaseConfig {
  name: string;
  duration: number;
  cycler: CyclerType;
  player: PlayerType;
  items: MediaItem[];
}

export enum CyclerType {
  CHAIN = 'CHAIN',
  RANDOM = 'RANDOM',
  WEAVE = 'WEAVE',
  BRIDGE = 'BRIDGE',
  ADAPTIVE = 'ADAPTIVE',
  CLUSTER = 'CLUSTER'
}

export enum PlayerType {
  DIRECT = 'DIRECT',
  STEREO_SPLIT = 'STEREO_SPLIT',
  ROTATIONAL = 'ROTATIONAL',
  LAYERED = 'LAYERED',
  TRI_CHAMBER = 'TRI_CHAMBER',
  COMPOSITE = 'COMPOSITE'
}