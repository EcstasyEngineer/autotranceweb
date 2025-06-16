import random
from typing import List, Dict
from .base import Player

class AdaptivePlayer(Player):
    """
    AdaptivePlayer:
    - Psych Use: If session intensity is high, centralize audio (less disorienting) and maybe show fewer images
      or more focused images. If low, alternate channels widely or shuffle images to maintain alertness.

    Current logic (example):
    - If intense_mode: center audio, maybe fewer images or simplified arrangement.
    - Else: alternate audio channels, random image positions (if images used).
    """

    def __init__(self, intense_mode: bool = False):
        self.intense_mode = intense_mode

    def arrange_sequence(self, item_sequence: List[Dict]) -> List[Dict]:
        arranged = []
        if self.intense_mode:
            # Center all audio, no fancy panning. For images, just show them in a neutral position.
            for item in item_sequence:
                arrangement = {
                    "item": item,
                    "audio_pan": 0.0 if item["type"] == "audio" else None,
                    "image_pos": "center" if item["type"] == "image" else None
                }
                arranged.append(arrangement)
        else:
            # Alternate left/right for audio, random positions for images
            for i, item in enumerate(item_sequence):
                pan = (-0.5 if i % 2 == 0 else 0.5) if item["type"] == "audio" else None
                img_pos = random.choice(["left", "right", "center"]) if item["type"] == "image" else None
                arrangement = {
                    "item": item,
                    "audio_pan": pan,
                    "image_pos": img_pos
                }
                arranged.append(arrangement)

        return arranged
