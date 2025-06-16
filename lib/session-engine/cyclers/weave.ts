import { Cycler } from './base';
import { MediaItem } from '../types';

export class WeaveCycler extends Cycler {
  /**
   * WeaveCycler:
   * Psychological Use: Interlacing two sets of items creates subtle interplay of themes
   * (e.g., relaxation followed by obedience). This weaving primes the mind for complex
   * associations and layered suggestions.
   * 
   * Splits items into two halves and weaves them together alternately.
   */
  
  getSequence(): MediaItem[] {
    const half = Math.floor(this.items.length / 2);
    const setA = this.items.slice(0, half);
    const setB = this.items.slice(half);
    
    const woven: MediaItem[] = [];
    const maxLength = Math.max(setA.length, setB.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < setA.length) woven.push(setA[i]);
      if (i < setB.length) woven.push(setB[i]);
    }
    
    return woven;
  }
}