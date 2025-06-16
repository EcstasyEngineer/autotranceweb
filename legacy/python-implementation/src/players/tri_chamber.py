from typing import List, Dict
from .base import Player

class TriChamberPlayer(Player):
    """
    TriChamberPlayer:
    - Psych Use: Spreading stimuli across three "chambers" (e.g., left, center, right) can create a sense of 
      being surrounded. This immersive approach can deepen trance and facilitate a more embodied experience.

    Logic:
    - Distribute items in a round-robin across left, center, right.
    """

    def arrange_sequence(self, item_sequence: List[Dict]) -> List[Dict]:
        arranged = []
        audio_pans = [-0.5, 0.0, 0.5]
        image_positions = ["left", "center", "right"]

        for i, item in enumerate(item_sequence):
            if item["type"] == "audio":
                pan = audio_pans[i % 3]
                pos = None
            else:
                pos = image_positions[i % 3]
                pan = None
            arrangement = {
                "item": item,
                "audio_pan": pan,
                "image_pos": pos
            }
            arranged.append(arrangement)
        return arranged
