from .base import Cycler
from typing import List, Dict

class BridgeCycler(Cycler):
    """
    BridgeCycler:
    - Psych Use: Useful for transitioning gradually between states/themes.
      For example, bridging from relaxation to obedience lines creates a smooth
      narrative, reducing resistance and easing the subject deeper.

    Current Implementation:
    - Takes the first and last item as 'start' and 'end' and tries to fill in the
      middle. More sophisticated bridging (semantic) is TODO.
    """

    def get_sequence(self) -> List[Dict]:
        if len(self.items) < 3:
            return self.items
        start = self.items[0]
        end = self.items[-1]
        middle = self.items[1:-1]
        # TODO: Actually find bridging items via semantic similarity
        return [start] + middle + [end]
