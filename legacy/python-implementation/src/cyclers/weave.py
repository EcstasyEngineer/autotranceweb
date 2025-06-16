from .base import Cycler
from typing import List, Dict

class WeaveCycler(Cycler):
    """
    WeaveCycler:
    - Psych Use: Interlacing two sets of items can create a subtle interplay of themes (e.g., relaxation image
      followed by obedience audio line). This weaving can prime the mind for complex associations and 
      layered suggestions.

    Splits the items into two halves and weaves them together.
    """

    def get_sequence(self) -> List[Dict]:
        half = len(self.items) // 2
        set_a = self.items[:half]
        set_b = self.items[half:]
        woven = []
        for a, b in zip(set_a, set_b):
            woven.extend([a, b])
        if len(set_a) > len(set_b):
            woven.extend(set_a[len(set_b):])
        else:
            woven.extend(set_b[len(set_a):])
        return woven
