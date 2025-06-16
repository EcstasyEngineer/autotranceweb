import { Player } from './base';
import { MediaItem, ArrangedItem } from '../types';

export class TriChamberPlayer extends Player {
  arrangeSequence(sequence: MediaItem[]): ArrangedItem[] {
    const arranged: ArrangedItem[] = [];
    const audioPans = [-0.5, 0.0, 0.5]; // left, center, right
    const imagePositions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];

    sequence.forEach((item, index) => {
      const arrangement: ArrangedItem = {
        item,
        audioPan: item.type === 'SEGMENT' ? audioPans[index % 3] : undefined,
        imagePos: item.type === 'VISUAL' ? imagePositions[index % 3] : undefined
      };
      arranged.push(arrangement);
    });

    return arranged;
  }
}