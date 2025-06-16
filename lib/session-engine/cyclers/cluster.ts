import { Cycler } from './base';
import { MediaItem } from '../types';

export class ClusterCycler extends Cycler {
  /**
   * ClusterCycler:
   * Psychological Use: Presents items in small thematic clusters.
   * Clusters create mini-narratives or concept reinforcement sets before moving on.
   * Useful for building patterns like "three lines of relaxation, then three lines of submission".
   */
  
  private clusterSize: number;

  constructor(items: MediaItem[], clusterSize: number = 3) {
    super(items);
    this.clusterSize = clusterSize;
  }

  getSequence(): MediaItem[] {
    const result: MediaItem[] = [];
    
    for (let i = 0; i < this.items.length; i += this.clusterSize) {
      const cluster = this.items.slice(i, i + this.clusterSize);
      result.push(...cluster);
    }
    
    return result;
  }
}