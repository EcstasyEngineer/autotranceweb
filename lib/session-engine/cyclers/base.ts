import { MediaItem } from '../types';

export abstract class Cycler {
  protected items: MediaItem[];

  constructor(items: MediaItem[]) {
    this.items = items;
  }

  abstract getSequence(): MediaItem[];
}