from bounding_box import Bounding_box

class Model_result:
    def __init__(self, image_path, *bounding_boxes):
        self.image_path: str = image_path
        self.bounding_boxes: list[Bounding_box] = bounding_boxes
