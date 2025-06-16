import random
from typing import List, Dict
from .base import Cycler

class RandomCycler(Cycler):
    """
    RandomCycler:
    - Psych Use: Randomization can create an unpredictable environment that overloads the conscious mind,
      making it easier for suggestions or subliminal images to slip into the subconscious.
      Good for 'overload induction' where you bombard the subject with unpredictable stimuli.

    Picks a random subset of items.
    """

    def __init__(self, items: List[Dict], num_items: int):
        super().__init__(items)
        self.num_items = num_items

    def get_sequence(self) -> List[Dict]:
        if not self.items:
            return []
        return random.sample(self.items, min(self.num_items, len(self.items)))
