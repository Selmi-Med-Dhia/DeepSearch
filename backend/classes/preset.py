import json
class _Options:
    def __init__(self):
        self.generate_folder: bool = True
        self.overlay_bbxs: bool = False
        self.sort: bool = False
        self.auto_open: bool = True
        self.minimum_confidence: float = 0.5
    def to_dict(self):
        return ({
            "generate_folder": self.generate_folder,
            "overlay_bbxs": self.overlay_bbxs,
            "sort": self.sort,
            "auto_open": self.auto_open,
            "minimum_confidence": self.minimum_confidence
        })

class Preset:
    def __init__(self, name):
        self.name = name
        self.directories: list[str] = []
        self.options: _Options = _Options()
    def to_dict(self):
        return ({
            "name" : self.name,
            "directories": self.directories,
            "options": self.options.to_dict()
        })
    def jsonify(self):
        return json.dumps(self.to_dict(), indent=4)