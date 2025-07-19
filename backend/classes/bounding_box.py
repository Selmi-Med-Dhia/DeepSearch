import json
class Bounding_box:
    def __init__(self, x_min, y_min, x_max, y_max, object, confidence):
        self.x_min: int = x_min
        self.y_min: int = y_min
        self.x_max: int = x_max
        self.y_max: int = y_max
        self.object: int = object
        self.confidence: float = confidence
    def to_dict(self):
        return({
            "x_min" : self.x_min,
            "y_min" : self.y_min,
            "x_max" : self.x_max,
            "y_max" : self.y_max,
            "object" : self.object,
            "confidence" : self.confidence
        })
    def objectify(self, data, is_json=False):
        dic = data
        if is_json:
            dic = json.loads(data)
        self.x_min = dic["x_min"]
        self.y_min = dic["y_min"]
        self.x_max = dic["x_max"]
        self.y_max = dic["y_max"]
        self.object = dic["object"]
        self.confidence = dic["confidence"]