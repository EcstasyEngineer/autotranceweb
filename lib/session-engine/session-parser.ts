import { MediaItem, PhaseConfig, CyclerType, PlayerType } from './types';

export interface SessionEffect {
  type: 'REVERB' | 'ECHO' | 'PITCH_SHIFT';
  roomSize?: number;
  damp?: number;
  delay?: number;
  decay?: number;
  shift?: number;
  random_range?: number;
}

export interface SessionItem {
  type: 'SEGMENT' | 'MANTRA' | 'VISUAL';
  theme_file?: string;
  file?: string;
  channel: 'L' | 'R' | 'C';
  voice?: string;
  flash_rate?: number;
  filters?: {
    difficulty?: {
      min: 'light' | 'medium' | 'hard';
      max: 'light' | 'medium' | 'hard';
    };
    dominant?: string;
    submissive?: string;
    theme?: string;
  };
}

export interface SessionJSON {
  session: {
    duration?: number;
    phases: Array<{
      name: string;
      timing: {
        type: 'fixed' | 'match_length_of';
        value: number;
      };
      player: string;
      cycler: string;
      effects?: SessionEffect[];
      items: SessionItem[];
    }>;
  };
}

export class SessionParser {
  static parseSessionJSON(sessionJSON: SessionJSON): PhaseConfig[] {
    return sessionJSON.session.phases.map(phase => ({
      name: phase.name,
      duration: phase.timing.value,
      cycler: this.mapCyclerType(phase.cycler),
      player: this.mapPlayerType(phase.player),
      items: phase.items.map(item => this.parseMediaItem(item))
    }));
  }

  private static parseMediaItem(item: SessionItem): MediaItem {
    return {
      id: Math.random().toString(36),
      type: item.type,
      content: item.theme_file || item.file || '',
      channel: item.channel,
      voice: item.voice,
      flashRate: item.flash_rate,
      filters: item.filters ? {
        difficultyMin: this.mapDifficulty(item.filters.difficulty?.min),
        difficultyMax: this.mapDifficulty(item.filters.difficulty?.max),
        dominantName: item.filters.dominant,
        submissiveName: item.filters.submissive,
        themeFilter: item.filters.theme
      } : undefined
    };
  }

  private static mapCyclerType(cycler: string): CyclerType {
    const cyclerMap: Record<string, CyclerType> = {
      'ChainCycler': CyclerType.CHAIN,
      'RandomCycler': CyclerType.RANDOM,
      'AdaptiveCycler': CyclerType.ADAPTIVE,
      'WeaveCycler': CyclerType.WEAVE,
      'BridgeCycler': CyclerType.BRIDGE,
      'ClusterCycler': CyclerType.CLUSTER
    };
    return cyclerMap[cycler] || CyclerType.RANDOM;
  }

  private static mapPlayerType(player: string): PlayerType {
    const playerMap: Record<string, PlayerType> = {
      'DirectPlayer': PlayerType.DIRECT,
      'TriChamberPlayer': PlayerType.TRI_CHAMBER,
      'StereoSplitPlayer': PlayerType.STEREO_SPLIT,
      'RotationalPlayer': PlayerType.ROTATIONAL,
      'LayeredPlayer': PlayerType.LAYERED,
      'CompositePlayer': PlayerType.COMPOSITE
    };
    return playerMap[player] || PlayerType.DIRECT;
  }

  private static mapDifficulty(difficulty?: string): 'BASIC' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXTREME' | undefined {
    const difficultyMap: Record<string, 'BASIC' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXTREME'> = {
      'light': 'LIGHT',
      'medium': 'MODERATE', 
      'hard': 'DEEP'
    };
    return difficulty ? difficultyMap[difficulty] : undefined;
  }
}