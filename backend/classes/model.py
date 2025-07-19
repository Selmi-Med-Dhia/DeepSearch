import PIL.Image
from ultralytics import YOLO
from model_result import Model_result
from bounding_box import Bounding_box
import os
import cv2

os.environ["ULTRALYTICS_HUB"] = "False"

class Model:
    def __init__(self):
        self.real_model = YOLO(os.path.join(os.path.dirname(__file__), '../appdata/model/yolov8s.pt'))
        self.classes = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 
                        'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 
                        'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 
                        'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 
                        'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 
                        'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 
                        'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 
                        'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 
                        'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 
                        'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 
                        'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 
                        'toothbrush']
        self.class_colors = [
                        (230, 25, 75), (60, 180, 75), (255, 225, 25), (0, 130, 200),
                        (245, 130, 48), (145, 30, 180), (70, 240, 240), (240, 50, 230),
                        (210, 245, 60), (250, 190, 190), (0, 128, 128), (230, 190, 255),
                        (170, 110, 40), (255, 250, 200), (128, 0, 0), (170, 255, 195),
                        (128, 128, 0), (255, 215, 180), (0, 0, 128), (128, 128, 128),
                        (255, 255, 255), (0, 0, 0), (255, 99, 71), (100, 149, 237),
                        (255, 140, 0), (64, 224, 208), (199, 21, 133), (154, 205, 50),
                        (255, 105, 180), (30, 144, 255), (222, 184, 135), (255, 165, 0),
                        (46, 139, 87), (147, 112, 219), (50, 205, 50), (255, 20, 147),
                        (0, 191, 255), (205, 92, 92), (255, 182, 193), (70, 130, 180),
                        (218, 165, 32), (189, 183, 107), (186, 85, 211), (188, 143, 143),
                        (95, 158, 160), (0, 255, 127), (255, 160, 122), (106, 90, 205),
                        (176, 224, 230), (173, 255, 47), (255, 228, 225), (72, 209, 204),
                        (238, 130, 238), (152, 251, 152), (127, 255, 212), (135, 206, 235),
                        (255, 239, 213), (221, 160, 221), (240, 230, 140), (175, 238, 238),
                        (244, 164, 96), (233, 150, 122), (250, 128, 114), (0, 250, 154),
                        (127, 255, 0), (245, 222, 179), (176, 196, 222), (255, 222, 173),
                        (124, 252, 0), (255, 228, 181), (255, 218, 185), (216, 191, 216),
                        (238, 232, 170), (152, 251, 152), (255, 228, 196), (255, 245, 238),
                        (240, 255, 240), (245, 245, 220), (255, 240, 245), (255, 250, 205)
                    ]
    def predict(self, image_paths):
        results = self.real_model.predict(image_paths)
        model_results = []
        for i, result in enumerate(results):
            bounding_boxes = [ Bounding_box(int(bb[0]), int(bb[1]), int(bb[2]), int(bb[3]), int(cls.item()), conf.item()) for bb, conf, cls in zip(result.boxes.xyxy, result.boxes.conf, result.boxes.cls)]
            model_results.append(Model_result(image_paths[i], bounding_boxes))
        return model_results
    def generate_images_with_boxes(self, model_results):
        images = []
        for model_result in model_results:
            img = cv2.imread(model_result.image_path)
            for bb in model_result.bounding_boxes:
                cv2.rectangle(img, (bb.x_min, bb.y_min), (bb.x_max, bb.y_max), color=self.class_colors[bb.object], thickness=2)
                label = f"{self.classes[bb.object]}: {bb.confidence:.2f}"
                (text_width, text_height), _ = cv2.getTextSize(label, fontFace=cv2.FONT_HERSHEY_SIMPLEX, fontScale=0.5, thickness=4)
                cv2.rectangle(img, (bb.x_min, bb.y_min - text_height - 4), (bb.x_min + text_width, bb.y_min), color=self.class_colors[bb.object], thickness=-1)
                cv2.putText(img, label, (bb.x_min, bb.y_min - 2), fontFace=cv2.FONT_HERSHEY_SIMPLEX, fontScale=0.5, color=(0, 0, 0), thickness=1)
            images.append(img)
        return images
    def save_images(self, image_paths, images, directory):
        for image_path, image in zip(image_paths, images):
            filename = os.path.basename(image_path)
            name, ext = os.path.splitext(filename)
            i=1
            basename = name
            new_path = os.path.join(directory, filename)
            while( os.path.exists(new_path) ):
                name = basename+str(i)
                new_path = os.path.join(directory, basename+str(i)+ext)
                i+=1
            cv2.imwrite(new_path, image)

#m = Model()
#l = []
#l.append(os.path.join(os.path.dirname(__file__), 'img.jpg'))
#results = m.predict(l)
#images = m.generate_images_with_boxes(results)
#m.save_images(l, images, "C:\\Users\\monji\\OneDrive\\Bureau\\A")