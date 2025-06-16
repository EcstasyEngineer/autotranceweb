import { Player } from './base';
import { MediaItem, ArrangedItem } from '../types';

export class RotationalPlayer extends Player {
  /**
   * RotationalPlayer:
   * Psychological Use: Rotating sound or image positions can disorient the subject,
   * making them feel as if the environment is moving around them.
   * Perfect for deep trance or confusion techniques.
   */
  
  arrangeSequence(sequence: MediaItem[]): ArrangedItem[] {
    const arranged: ArrangedItem[] = [];
    const audioPans = [-0.5, 0.0, 0.5]; // left, center, right
    const imagePositions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];

    sequence.forEach((item, index) => {
      const arrangement: ArrangedItem = {
        item,
        audioPan: item.type === 'SEGMENT' ? audioPans[index % 3] : undefined,
        imagePos: item.type === 'VISUAL' ? imagePositions[index % 3] : undefined,
        // Add rotation effect by cycling through positions
        rotation: index % 360 // degrees for visual rotation effect
      };
      arranged.push(arrangement);
    });

    return arranged;
  }
}