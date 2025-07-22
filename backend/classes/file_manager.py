import os
import json
import platform
import subprocess
from backend.classes.bounding_box import Bounding_box
from backend.classes.model_result import Model_result
from backend.classes.preset import Preset
from backend.classes.settings import Settings
from backend.classes.search import Search
from datetime import datetime
import hashlib
import cv2

cache_path = os.path.join(os.path.dirname(__file__), "../appdata/data/cache.json")
presets_path = os.path.join(os.path.dirname(__file__), "../appdata/data/presets.json")
searches_path = os.path.join(os.path.dirname(__file__), "../appdata/data/searches.json")
settings_path = os.path.join(os.path.dirname(__file__), "../appdata/data/settings.json")

class File_manager:
    def __init__(self):
        pass
    
    def get_cache() -> list[Model_result]:
        with open(cache_path, "r") as f:
            json_data = f.read()
            cache_list = json.loads(json_data)
            cache = [Model_result.objectify(m) for m in cache_list]
        return cache
    
    def add_cache(search_results: list[Model_result]) -> list[Model_result]:
        cache = File_manager.get_cache()
        cache += search_results
        cache_json = [ c.to_dict() for c in cache]
        with open(cache_path, "w") as f:
            json.dump(cache_json, f, indent=4)
        return cache
    
    def delete_bad_cache() -> list[Model_result]:
        cache = File_manager.get_cache()
        for i, search_result in enumerate(cache):
            if not os.path.exists(search_result.image_path) or File_manager.sha256(search_result.image_path) != search_result.sha256 :
                cache.pop(i)
        
        cache_json = [ c.to_dict() for c in cache]
        with open(cache_path, "w") as f:
            json.dump(cache_json, f, indent=4)
        return cache
    
    def delete_all_cache() -> list[Model_result]:
        with open(cache_path, "w") as f:
            json.dump([], f)
        return []
    
    def get_cache_volume() -> float:
        return os.path.getsize(cache_path)/1024.0
    
    def get_bad_cache_volume() -> float:
        cache = File_manager.get_cache()
        total_size = len(cache)
        if total_size == 0:
            return 0.0
        for i, search_result in enumerate(cache):
            if not os.path.exists(search_result.image_path) or File_manager.sha256(search_result.image_path) != search_result.sha256 :
                cache.pop(i)
        bad_size = float(total_size - len(cache))
        return File_manager.get_cache_volume()*(bad_size/total_size)

    def get_history() -> list[Search]:
        with open(searches_path, "r") as f:
            json_data = f.read()
            searches_list = json.loads(json_data)
            searches = [Search.objectify(s) for s in searches_list]
        return searches
    
    def add_history(search: Search) -> list[Search]:
        searches = File_manager.get_history()
        searches.append(search)
        searches_json = [ s.to_dict() for s in searches]
        with open(searches_path, "w") as f:
            json.dump(searches_json, f, indent=4)
        return searches
    
    def get_presets() -> list[Preset]:
        with open(presets_path, "r") as f:
            json_data = f.read()
            preset_list = json.loads(json_data)
            presets = [Preset.objectify(preset) for preset in preset_list]
        return presets
    
    def update_presets(presets: list[Preset]):
        presets_json = [ preset.to_dict() for preset in presets]
        with open(presets_path, "w") as f:
            json.dump(presets_json, f, indent=4)
    
    def update_settings(settings: Settings):
        settings_json = settings.to_dict()
        with open(settings_path, "w") as f:
            json.dump(settings_json, f, indent=4)
    
    def sha256(filepath: str)  -> str:
        hash_sha256 = hashlib.sha256()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def save_images(image_paths, images, directory, keep_order=False):
        file_index = 1
        if not os.path.exists(directory):
            os.mkdir(directory)
        
        for image_path, image in zip(image_paths, images):
            filename = os.path.basename(image_path)
            name, ext = os.path.splitext(filename)
            if not keep_order:
                i=1
                basename = name
                new_path = os.path.join(directory, filename)
                while( os.path.exists(new_path) ):
                    name = basename+str(i)
                    new_path = os.path.join(directory, basename+str(i)+ext)
                    i+=1
            else:
                new_path = os.path.join(directory, str(file_index)+ext)
                file_index += 1
            cv2.imwrite(new_path, image)
    
    def generate_JSON_file(path, search_results):
        results_json = [ s.to_dict() for s in search_results]
        with open(path, "w") as f:
            json.dump(results_json, f, indent=4)
    
    def get_image_paths(directories) -> list[str]:
        image_paths = []
        dirs = directories.copy()
        i = 0
        while i < len(dirs):
            if (os.path.exists(dirs[i])):
                paths = os.listdir(dirs[i])
                dirs += [os.path.join(dirs[i], p) for p in paths if os.path.isdir(os.path.join(dirs[i], p))]
                image_paths += [os.path.join(dirs[i], p) for p in paths if p.lower().endswith(".jpg") or p.lower().endswith(".jpeg") or p.lower().endswith(".png") or p.lower().endswith(".bmp") or p.lower().endswith(".tif") or p.lower().endswith(".tiff")]
            i += 1
        return image_paths
    
    def open_folder(path):
        if platform.system() == "Windows":
            os.startfile(path)
        elif platform.system() == "Darwin":
            subprocess.run(["open", path])
        else:
            subprocess.run(["xdg-open", path])