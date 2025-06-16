class Themable:
    def __init__(self, theme: str, difficulty: str):
        self.theme = theme
        self.difficulty = difficulty

class MantraLine(Themable):
    def __init__(self, line_type: str, line_text: str, theme: str, difficulty: str, dominant: str = None, submissive: str = None):
        super().__init__(theme, difficulty)
        self.line_type = line_type
        self.line_text = line_text
        self.dominant = dominant
        self.submissive = submissive

class PictureItem(Themable):
    def __init__(self, file_name: str, theme: str, difficulty: str):
        super().__init__(theme, difficulty)
        self.file_name = file_name
        
