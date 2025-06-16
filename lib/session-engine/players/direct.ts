import { Player } from './base';
import { MediaItem, ArrangedItem } from '../types';

export class DirectPlayer extends Player {
  arrangeSequence(sequence: MediaItem[]): ArrangedItem[] {
    return sequence.map(item => ({
      item,
      audioPan: 0, // center
      imagePos: 'center' as const
    }));
  }
}