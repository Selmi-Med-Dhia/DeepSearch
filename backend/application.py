import os
import json
from backend.classes.bounding_box import Bounding_box
from backend.classes.model_result import Model_result
from backend.classes.model import Model
from backend.classes.preset import Preset
from backend.classes.settings import Settings
from backend.classes.search import Search
from backend.classes.file_manager import File_manager
from backend.classes.mailer import Mailer
from backend.setup import run_setup
from datetime import datetime

class Application:
    def __init__(self):
        run_setup()
        self.presets : list[Preset] = File_manager.get_presets()
        self.cache : list[Model_result] = File_manager.get_cache()
        self.history : list[Search] = File_manager.get_history()
        self.settings : Settings = Settings.load()
        self.model : Model = Model()
        self.mailer : Mailer = Mailer()
        self.custom_folder = ""
    
    def jsonify(self, indent=4) -> str:
        dic = {}
        dic["presets"] = [ preset.to_dict() for preset in self.presets]
        dic["history"] = [s.to_dict() for s in self.history]
        dic["settings"] = self.settings.to_dict()
        dic["class_names"] = self.model.classes
        return json.dumps(dic, indent=indent)
    
    def update_settings(self, settings_json):
        self.settings = File_manager.update_settings(Settings.objectify(settings_json))
    
    def send_feedback(self, content_json):
        content = json.loads(content_json)["content"]
        self.mailer.send_mail(content)
    
    def get_cache_size_json(self) -> str:
        dic = {
            "all" : File_manager.get_cache_volume(),
            "unuseful" : File_manager.get_bad_cache_volume()
        }
        return json.dumps(dic)
    
    def clear_all_cache(self):
        File_manager.delete_all_cache()
    
    def clear_bad_cache(self):
        File_manager.delete_bad_cache()
    
    def select_preset(self, name_json):
        name = json.loads(name_json)["name"]
        for preset in self.presets:
            if preset.name == name:
                preset.selected = True
            else:
                preset.selected = False
        File_manager.update_presets(self.presets)
    
    def update_preset(self, preset_json):
        preset = Preset.objectify(preset_json, is_json=True)
        for i, p in enumerate(self.presets):
            if preset.name == p.name:
                self.presets.pop(i)
                self.presets.insert(i, preset)
                break
        File_manager.update_presets(self.presets)
    
    def add_custom_folder(self, folder_json):
        self.custom_folder = json.loads(folder_json)["path"]
    
    def remove_custom_folder(self):
        self.custom_folder = ""
    
    def open_folder(self, path_json):
        File_manager.open_folder(json.loads(path_json)["path"])
    
    def search(self, objects_json) -> str:
        objects = json.loads(objects_json)["objects"]
        if len(objects) == 0:
            objects = list(range(0, len(Model.classes)))
        preset = [p for p in self.presets if p.selected][0]
        image_paths = File_manager.get_image_paths(preset.directories)
        model_results, self.cache = self.model.predict(image_paths, self.cache)
        nbr_matches_per_image = [ len([bb for bb in res.bounding_boxes if (bb.object in objects and bb.confidence >= preset.options.minimum_confidence)]) for res in model_results ]
        maching_results = [mr for i, mr in enumerate(model_results) if nbr_matches_per_image[i] != 0]
        nbr_matches_per_image = [n for n in nbr_matches_per_image if n != 0]
        self.history = File_manager.add_history(Search(datetime.now(), preset.name, len(image_paths), len(maching_results), objects))

        if preset.options.sort:
            sorted_list = sorted(enumerate(nbr_matches_per_image), key=lambda n: n[1])
            sorted_list.reverse()
            sorted_indices = [i for i, _ in sorted_list]
            maching_results = [maching_results[i] for i in sorted_indices]

        if preset.options.generate_folder :
            result_folder = self.custom_folder
            if result_folder == "":
                result_folder = os.path.join(self.settings.default_parent_dict, datetime.now().strftime('%Y-%m-%d at %H-%M-%S')+" "+get_first_3(objects))
                dummy = result_folder
                i=0
                while os.path.exists(result_folder):
                    result_folder = dummy+" "+str(i)
                    i += 1
            if preset.options.overlay_bbxs:
                images = Model.generate_images_with_boxes(maching_results, objects, preset.options.minimum_confidence)
            else:
                images = Model.generate_images(maching_results)
            File_manager.save_images([m.image_path for m in maching_results], images, result_folder, keep_order=preset.options.sort)
        if self.settings.always_gen_json :
            json_file_path = os.path.join(self.settings.default_parent_dict, datetime.now().strftime('%Y-%m-%d at %H-%M-%S')+" "+get_first_3(objects)+".json")
            File_manager.generate_JSON_file(json_file_path, maching_results)
        dic = {
            "results" : [m.to_dict() for m in maching_results],
            "history" : [s.to_dict() for s in self.history]
        }

        if preset.options.auto_open:
            File_manager.open_folder(result_folder)
        return json.dumps(dic, indent=0)

def get_first_3(objects: list[int]) -> str:
    if len(objects) == len(Model.classes):
        return "all"
    res = Model.classes[objects[0]]
    if len(objects) == 1:
        return res
    if len(objects) == 2:
        return res + " and " + Model.classes[objects[1]]
    if len(objects) == 3:
        return res + ", "+ Model.classes[objects[1]] + " and " + Model.classes[objects[2]]
    return res + ", "+ Model.classes[objects[1]] + ", " + Model.classes[objects[2]] + "...,"

#a = Application()
#a.presets[0].directories.append("C:\\Users\\monji\\Downloads\\a")
#a.presets[0].options.generate_folder = True
#a.presets[0].options.overlay_bbxs = True
#a.presets[0].options.sort = True
#a.custom_folder = "C:\\Users\\monji\\Downloads\\a"
#print(a.search(json.dumps({"objects": []}, indent=4)))