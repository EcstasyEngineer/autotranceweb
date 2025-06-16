from .base import Cycler
from typing import List, Dict

class ChainCycler(Cycler):
    """
    ChainCycler:
    - Psych Use: Repetitive cycling can reinforce suggestions or images.
      Consistent repetition can anchor certain ideas deep into the subconscious.
      Good for affirmations or repeatedly showing a single hypnotic spiral image.

    Repeats the entire sequence a certain number of times.
    """

    def __init__(self, items: List[Dict], repeats: int = 1):
        super().__init__(items)
        self.repeats = repeats

    def get_sequence(self) -> List[Dict]:
        return self.items * self.repeats
