import json
import os

class Settings:
    def __init__(self):
        self.thread_count: int = 1
        self.default_parent_dict: str = os.path.join(os.path.dirname(__file__), "../appdata/results")
        self.always_gen_json: bool = False
    def to_dict(self):
        return ({
            "thread_count": self.thread_count,
            "default_parent_dict": self.default_parent_dict,
            "always_gen_json": self.always_gen_json
        })
    def jsonify(self, indent=4):
        return json.dumps(self.to_dict(), indent=indent)
    def objectify(self, data):
        dic = json.loads(data)
        self.thread_count = dic["thread_count"]
        self.default_parent_dict = dic["default_parent_dict"]
        self.always_gen_json = dic["always_gen_json"]
    def load(self):
        with open(os.path.join(os.path.dirname(__file__), "../appdata/data/settings.json"), "r") as f:
            json_data = f.read()
            self.objectify(json_data)