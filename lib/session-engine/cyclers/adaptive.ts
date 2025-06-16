import { Cycler } from './base';
import { MediaItem, SessionState } from '../types';

export class AdaptiveCycler extends Cycler {
  private sessionState?: SessionState;

  constructor(items: MediaItem[], sessionState?: SessionState) {
    super(items);
    this.sessionState = sessionState;
  }

  getSequence(): MediaItem[] {
    if (!this.sessionState) {
      return this.items;
    }

    const { arousal, focus, depth } = this.sessionState;
    
    // Adapt based on user state
    let adaptedItems = [...this.items];
    
    // If focus is low, prioritize simpler content
    if (focus < 0.3) {
      adaptedItems = adaptedItems.filter(item => 
        !item.difficulty || ['BASIC', 'LIGHT'].includes(item.difficulty)
      );
    }
    
    // If arousal is high, prioritize more intense content
    if (arousal > 0.7) {
      adaptedItems = adaptedItems.filter(item => 
        item.difficulty && ['DEEP', 'EXTREME'].includes(item.difficulty)
      );
    }
    
    // If depth is increasing, reduce quantity but increase intensity
    if (depth > 0.5) {
      const half = Math.floor(adaptedItems.length / 2);
      adaptedItems = adaptedItems.slice(0, half);
    }
    
    return adaptedItems.length > 0 ? adaptedItems : this.items;
  }
}