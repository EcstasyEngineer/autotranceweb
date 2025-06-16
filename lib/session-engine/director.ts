import { MediaItem, SessionState } from './types';

export interface SemanticVector {
  embedding: number[];
  theme: string;
  intensity: number;
}

export interface DirectorConfig {
  startTheme: string;
  goalTheme: string;
  sessionDuration: number;
  intensityProgression: 'linear' | 'exponential' | 'adaptive';
}

export class HypnoDirector {
  private config: DirectorConfig;
  private currentState: SessionState;
  private semanticVectors: Map<string, SemanticVector> = new Map();

  constructor(config: DirectorConfig) {
    this.config = config;
    this.currentState = {
      arousal: 0.1,
      focus: 0.1,
      depth: 0.1,
      timestamp: new Date()
    };
  }

  // Semantic vector space navigation
  selectNextItem(availableItems: MediaItem[]): MediaItem {
    // TODO: Implement semantic embedding-based selection
    // For now, return adaptive selection based on session state
    
    const filteredItems = this.filterByIntensity(availableItems);
    return this.adaptiveSelection(filteredItems);
  }

  updateSessionState(newState: Partial<SessionState>) {
    this.currentState = {
      ...this.currentState,
      ...newState,
      timestamp: new Date()
    };
  }

  private filterByIntensity(items: MediaItem[]): MediaItem[] {
    const targetIntensity = this.calculateTargetIntensity();
    
    return items.filter(item => {
      if (!item.difficulty) return true;
      
      const intensityMap = {
        'BASIC': 0.1,
        'LIGHT': 0.3,
        'MODERATE': 0.5,
        'DEEP': 0.7,
        'EXTREME': 0.9
      };
      
      const itemIntensity = intensityMap[item.difficulty];
      return Math.abs(itemIntensity - targetIntensity) < 0.3;
    });
  }

  private calculateTargetIntensity(): number {
    // Combine session progress with user state
    const sessionProgress = this.getSessionProgress();
    const stateIntensity = (this.currentState.arousal + this.currentState.depth) / 2;
    
    return Math.min(0.9, sessionProgress * 0.7 + stateIntensity * 0.3);
  }

  private adaptiveSelection(items: MediaItem[]): MediaItem {
    // Bias selection based on current session state
    if (this.currentState.focus < 0.3) {
      // Low focus - prefer simpler content
      return items.find(item => 
        !item.difficulty || ['BASIC', 'LIGHT'].includes(item.difficulty)
      ) || items[0];
    }
    
    if (this.currentState.arousal > 0.7) {
      // High arousal - prefer intense content
      return items.find(item => 
        item.difficulty && ['DEEP', 'EXTREME'].includes(item.difficulty)
      ) || items[items.length - 1];
    }
    
    // Default to random selection from filtered items
    return items[Math.floor(Math.random() * items.length)];
  }

  private getSessionProgress(): number {
    // TODO: Calculate based on elapsed time vs total session duration
    return 0.5; // Placeholder
  }

  // Future: Load semantic embeddings for themes
  async loadSemanticVectors(vectorData: Array<{ theme: string; embedding: number[]; intensity: number }>) {
    vectorData.forEach(data => {
      this.semanticVectors.set(data.theme, {
        embedding: data.embedding,
        theme: data.theme,
        intensity: data.intensity
      });
    });
  }

  // Future: Calculate semantic similarity between themes
  private calculateSimilarity(theme1: string, theme2: string): number {
    const vector1 = this.semanticVectors.get(theme1);
    const vector2 = this.semanticVectors.get(theme2);
    
    if (!vector1 || !vector2) return 0;
    
    // Cosine similarity calculation
    const dotProduct = vector1.embedding.reduce((sum, val, i) => 
      sum + val * vector2.embedding[i], 0);
    const magnitude1 = Math.sqrt(vector1.embedding.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.embedding.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitude1 * magnitude2);
  }
}