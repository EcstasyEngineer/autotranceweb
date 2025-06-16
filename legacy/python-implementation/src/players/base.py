from abc import ABC, abstractmethod
from typing import List, Dict

class Player(ABC):
    """
    Abstract base class for Players.
    Players take a sequence of items and decide how they are arranged/spatialized.
    For audio: might assign channels, panning, volume.
    For images: might decide display order, overlay effects, or timing.

    Psychological hints for players:
    - Stereo or tri-channel audio can create immersive soundscapes that disorient and deepen trance.
    - Layered or composite players can overload the senses.
    - Direct players provide a simple, stable baseline, good for straightforward affirmations.
    """

    @abstractmethod
    def arrange_sequence(self, item_sequence: List[Dict]) -> List[Dict]:
        """
        Takes a sequence of items and returns a list of instructions or transformed items that indicate how
        they should be rendered (e.g., {item, pan: -0.5, start_time: ...}).

        For images, might specify display duration and position on screen.
        For audio, might specify pan, volume, etc.
        """
        pass
