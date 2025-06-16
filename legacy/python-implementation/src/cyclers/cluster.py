from .base import Cycler
from typing import List, Dict

class ClusterCycler(Cycler):
    """
    ClusterCycler:
    - Psych Use: Presents items in small thematic clusters.
      Clusters can create a mini-narrative or concept reinforcement set before moving on.
      Useful for building patterns like "three lines of relaxation, then three lines of submission".

    Groups items into clusters of a given size.
    """

    def __init__(self, items: List[Dict], cluster_size: int = 3):
        super().__init__(items)
        self.cluster_size = cluster_size

    def get_sequence(self) -> List[Dict]:
        clusters = [self.items[i:i+self.cluster_size] for i in range(0, len(self.items), self.cluster_size)]
        result = []
        for cluster in clusters:
            result.extend(cluster)
        return result
