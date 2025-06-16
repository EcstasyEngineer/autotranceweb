import random
from typing import List, Dict
from .base import Player

class CompositePlayer(Player):
    """
    CompositePlayer:
    - Psych Use: Combining multiple sequences or mixing multiple media streams into a single experience
      can create rich, immersive states. Using multiple sources at once can overload and confuse the conscious mind,
      while the subconscious absorbs the intended message.

    Example logic:
    - Divide sequence into halves, assign different spatial attributes.
    - Could overlay images semi-transparently or cycle audio channels.

    TODO: For images, might consider overlay effects or simultaneous display.
    """

    def arrange_sequence(self, item_sequence: List[Dict]) -> List[Dict]:
        half = len(item_sequence)//2
        arranged = []
        for i, item in enumerate(item_sequence):
            # First half: left side, second half: right side
            if item["type"] == "audio":
                pan = -0.5 if i < half else 0.5
                arranged.append({
                    "item": item,
                    "audio_pan": pan,
                    "image_pos": None
                })
            else:
                pos = "left" if i < half else "right"
                arranged.append({
                    "item": item,
                    "audio_pan": None,
                    "image_pos": pos
                })
        return arranged
