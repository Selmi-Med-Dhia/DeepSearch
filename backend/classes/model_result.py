from bounding_box import Bounding_box
import json

class Model_result:
    def __init__(self, image_path, bounding_boxes):
        self.image_path: str = image_path
        self.bounding_boxes: list[Bounding_box] = bounding_boxes
    def to_dict(self):
        return({
            "image_path" : self.image_path,
            "bouding_boxes" : [b.to_dict() for b in self.bounding_boxes]
        })
    def jsonify(self):
        return json.dumps(self.to_dict(), indent=4)