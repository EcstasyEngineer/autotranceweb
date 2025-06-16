import { MediaItem, ArrangedItem } from '../types';

export abstract class Player {
  abstract arrangeSequence(sequence: MediaItem[]): ArrangedItem[];
}