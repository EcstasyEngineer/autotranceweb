from typing import List, Dict
from .base import Player

class DirectPlayer(Player):
    """
    DirectPlayer:
    - Psych Use: Simple playback with no fancy effects.
      Good for straightforward affirmation sessions or when complexity is not desired.
    """

    def arrange_sequence(self, item_sequence: List[Dict]) -> List[Dict]:
        # No changes, just return items as-is.
        arranged = []
        for item in item_sequence:
            arrangement = {
                "item": item,
                "audio_pan": 0.0 if item["type"] == "audio" else None,  # center for audio
                "image_pos": "center" if item["type"] == "image" else None
            }
            arranged.append(arrangement)
        return arranged
