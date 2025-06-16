from .base import Cycler
from typing import List, Dict
import random

class RecursiveCycler(Cycler):
    """
    RecursiveCycler:
    - Psych Use: By nesting multiple patterns, you can create a complex, evolving hypnotic journey.
      This can keep the subject engaged and continuously surprised, leading to deeper trance.

    Chooses another cycler internally at runtime. Allows for multi-layered complexity.
    """

    def __init__(self, items: List[Dict], sub_cyclers: List[Cycler]):
        super().__init__(items)
        self.sub_cyclers = sub_cyclers

    def get_sequence(self) -> List[Dict]:
        chosen_cycler = random.choice(self.sub_cyclers)
        chosen_cycler.items = self.items  # give it the same items
        return chosen_cycler.get_sequence()
