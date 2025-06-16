from abc import ABC, abstractmethod
from typing import List, Dict

class Cycler(ABC):
    """
    Abstract base class for Cyclers.
    Cyclers produce a sequence of media items (audio, images) from a given list.

    Each cycler might be psychologically tuned for certain types of hypnotic effects:
    - Some reinforce consistency and predictability (good for anchoring a trance state).
    - Others provide variety or disorientation (good for overload induction).
    """

    def __init__(self, items: List[Dict]):
        """
        items: A list of media items. Each item may be:
          {
            "type": "audio" or "image",
            "line": "optional text content",
            "theme": "...",
            "filepath": "path/to/media"
          }
        """
        self.items = items

    @abstractmethod
    def get_sequence(self) -> List[Dict]:
        pass
