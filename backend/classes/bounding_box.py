class Bounding_box:
    def __init__(self, x_min, y_min, x_max, y_max, object, confidence):
        self.x_min: float = x_min
        self.y_min: float = y_min
        self.x_max: float = x_max
        self.y_max: float = y_max
        self.object: int = object
        self.confidence: float = confidence
        