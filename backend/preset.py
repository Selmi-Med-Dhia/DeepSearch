class _Options:
    def __init__(self):
        self.generate_folder: bool = True
        self.overlay_bbxs: bool = False
        self.sort: bool = False
        self.auto_open: bool = True
        self.minimum_confidence: float = 0.5

class Preset:
    def __init__(self):
        self.directories: list[str] = []
        self.options: _Options = _Options()