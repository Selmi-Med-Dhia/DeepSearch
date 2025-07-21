from backend.classes.bounding_box import Bounding_box
import json
import hashlib

def sha256f(filepath: str)  -> str:
    hash_sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

class Model_result:
    def __init__(self, image_path, bounding_boxes, sha256=None):
        if sha256==None:
            self.image_path: str = image_path
            self.sha256: str = sha256f(image_path)
            self.bounding_boxes: list[Bounding_box] = bounding_boxes
        else:
            self.image_path: str = image_path
            self.sha256: str = sha256
            self.bounding_boxes: list[Bounding_box] = bounding_boxes
    def to_dict(self) -> dict:
        return({
            "image_path" : self.image_path,
            "sha256" : self.sha256,
            "bounding_boxes" : [b.to_dict() for b in self.bounding_boxes]
        })
    def objectify(data, is_json=False):
        dic = data
        if is_json:
            dic = json.loads(data)
        return Model_result(
                            dic["image_path"],
                            [Bounding_box.objectify(bb) for bb in dic["bounding_boxes"]],
                            dic["sha256"],
                            )
    def jsonify(self, indent=4) -> str:
        return json.dumps(self.to_dict(), indent=indent)