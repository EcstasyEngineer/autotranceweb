from typing import List, Dict
from .base import Player

class RotationalPlayer(Player):
    """
    RotationalPlayer:
    - Psych Use: Rotating sound or image positions can disorient the subject,
      making them feel as if the environment is moving around them.
      Perfect for deep trance or confusion techniques.

    Example logic:
    - For audio: cycle through L, C, R.
    - For images: cycle through left, center, right placements.
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
