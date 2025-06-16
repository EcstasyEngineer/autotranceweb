import json
from themable import MantraLine, PictureItem
from filters import FilterCriteria
from filters import filter_items

class ThemePool:
    def __init__(self):
        self.items = []

    def add_items(self, new_items):
        self.items.extend(new_items)

    def subset(self, criteria: FilterCriteria) -> "ThemePool":
        new_pool = ThemePool()
        new_pool.items = filter_items(self.items, criteria)
        return new_pool

def load_json_into_pool(file_path: str, pool: ThemePool, is_picture=False):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    new_items = []
    for item in data:
        if not is_picture:
            new_items.append(MantraLine(
                line_type=item.get("type"),
                line_text=item.get("line"),
                theme=item.get("theme"),
                difficulty=item.get("difficulty"),
                dominant=item.get("dominant"),
                submissive=item.get("subject")
            ))
        else:
            new_items.append(PictureItem(
                file_name=item.get("file_name"),
                theme=item.get("theme"),
                difficulty=item.get("difficulty")
            ))
    pool.add_items(new_items)