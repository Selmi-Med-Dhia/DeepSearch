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
    def __init__(self, name=""):
        self.name: str = name
        self.selected: bool = False
        self.directories: list[str] = []
        self.options: _Options = _Options()
    def to_dict(self):
        return ({
            "name" : self.name,
            "selected" : self.selected,
            "directories": self.directories,
            "options": self.options.to_dict()
        })
    def jsonify(self, indent=4):
        return json.dumps(self.to_dict(), indent=indent)
    def objectify(self, data, is_json=False):
        dic = data
        if is_json:
            dic = json.loads(data)
        self.name = dic["name"]
        self.selected = dic["selected"]
        self.directories = dic["directories"]
        self.options.auto_open = dic["options"]["auto_open"]
        self.options.overlay_bbxs = dic["options"]["overlay_bbxs"]
        self.options.sort = dic["options"]["sort"]
        self.options.generate_folder = dic["options"]["generate_folder"]
        self.options.minimum_confidence = dic["options"]["minimum_confidence"]
        return self