from typing import List, Dict
from .base import Player

class StereoSplitPlayer(Player):
    """
    StereoSplitPlayer:
    - Psych Use: Alternating each line (audio or image) left/right creates a ping-pong effect.
      This can be used for a mild confusion or to break monotony, making the subject follow the shifts and 
      reducing their ability to maintain a critical mindset.

    Even index: left, Odd index: right.
    """

    def arrange_sequence(self, item_sequence: List[Dict]) -> List[Dict]:
        arranged = []
        for i, item in enumerate(item_sequence):
            if item["type"] == "audio":
                pan = -0.5 if i % 2 == 0 else 0.5
                pos = None
            else:
                pos = "left" if i % 2 == 0 else "right"
                pan = None
            arrangement = {
                "item": item,
                "audio_pan": pan,
                "image_pos": pos
            }
            arranged.append(arrangement)
        return arranged
