from .base import Cycler
from typing import List, Dict

class AdaptiveCycler(Cycler):
    """
    AdaptiveCycler:
    - Psych Use: Great for sessions that react to user state or time.
      For example, early in a session, shorter or simpler lines/images to ease in.
      Later, more intense or complex content as the subject deepens.
    - Current Implementation: If 'adapt' is True, only return half the items.
      This simulates a simple adaptation.

    TODO: Integrate user feedback or time-based logic.
    """

    def __init__(self, items: List[Dict], adapt: bool = False):
        super().__init__(items)
        self.adapt = adapt

    def get_sequence(self) -> List[Dict]:
        if self.adapt:
            half = len(self.items) // 2
            return self.items[:half]
        else:
            return self.items
