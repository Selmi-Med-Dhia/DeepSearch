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