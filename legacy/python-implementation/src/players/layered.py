from typing import List, Dict
from .base import Player

class LayeredPlayer(Player):
    """
    LayeredPlayer:
    - Psych Use: Overlapping stimuli can create confusion and disorientation, perfect for deepening trance states.
      By layering audio lines or showing multiple images in quick succession, the subject is less likely to focus consciously,
      allowing suggestions to slip through.

    Example logic:
    - Slightly overlap each subsequent item in time or space.
    """

    def arrange_sequence(self, item_sequence: List[Dict]) -> List[Dict]:
        arranged = []
        overlap_offset = 0
        for i, item in enumerate(item_sequence):
            arrangement = {
                "item": item,
                # For audio, maybe slightly shift start times or reduce volume incrementally (TODO).
                "audio_pan": 0.0 if item["type"] == "audio" else None, 
                "image_pos": "center" if item["type"] == "image" else None,
                "start_offset_ms": overlap_offset
            }
            arranged.append(arrangement)
            overlap_offset += 1000  # start each new one slightly overlapping
        return arranged
