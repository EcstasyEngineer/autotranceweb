from themable import Themable, MantraLine

class FilterCriteria:
    def __init__(self, theme: str = None, dominant_whitelist: list[str] = None):
        self.theme = theme
        self.dominant_whitelist = dominant_whitelist

def filter_items(items: list[Themable], criteria: FilterCriteria) -> list[Themable]:
    filtered = []
    for item in items:
        if criteria.theme and item.theme != criteria.theme:
            continue
        if isinstance(item, MantraLine) and criteria.dominant_whitelist:
            if item.dominant and item.dominant not in criteria.dominant_whitelist:
                continue
        filtered.append(item)
    return filtered