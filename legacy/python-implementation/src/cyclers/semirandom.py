import random
from typing import List, Dict
from .base import Cycler

class SemiRandomCycler(Cycler):
    """
    SemiRandomCycler:
    - Randomly selects from a set of predefined cyclers, each designed to produce content
      sequences according to specific patterns.
    """

    def __init__(self, items: List[Dict]):
        super().__init__(items)
        # Initialize all pattern cyclers with the same items
        self.sub_cyclers = [
            SingleRandomCycler(items),
            BridgingCycler(items),
            StrongLinkCycler(items),
            ThreeLinkCycler(items),
            FourLinkCycler(items)
        ]

    def get_sequence(self) -> List[Dict]:
        chosen_cycler = random.choice(self.sub_cyclers)
        return chosen_cycler.get_sequence()

class SingleRandomCycler(Cycler):
    def get_sequence(self) -> List[Dict]:
        return random.sample(self.items, 1)

class BridgingCycler(Cycler):
    def get_sequence(self) -> List[Dict]:
        if len(self.items) < 3:
            return self.items
        first = self.items[0]
        middle = self.items[1]
        last = self.items[-1]
        return [first, middle, middle, last, last]

class StrongLinkCycler(Cycler):
    def get_sequence(self) -> List[Dict]:
        if len(self.items) < 2:
            return self.items
        return [self.items[0]] * 2 + [self.items[1]] * 5

class ThreeLinkCycler(Cycler):
    def get_sequence(self) -> List[Dict]:
        if len(self.items) < 3:
            return self.items
        return [self.items[0]] * 2 + [self.items[1]] * 4 + [self.items[2]] * 2

class FourLinkCycler(Cycler):
    def get_sequence(self) -> List[Dict]:
        if len(self.items) < 4:
            return self.items
        return [self.items[0]] * 2 + [self.items[1]] + [self.items[2]] + [self.items[3]] * 3


