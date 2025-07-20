import os
import json
from bounding_box import Bounding_box
from model import Model
from model_result import Model_result
from preset import Preset
from settings import Settings
from search import Search
from datetime import datetime

cache_path = os.path.join(os.path.dirname(__file__), "../appdata/data/cache.json")
presets_path = os.path.join(os.path.dirname(__file__), "../appdata/data/presets.json")
searches_path = os.path.join(os.path.dirname(__file__), "../appdata/data/searches.json")
settings_path = os.path.join(os.path.dirname(__file__), "../appdata/data/settings.json")

class File_manager:
    def __init__(self):
        pass
    
    def get_cache():
        with open(cache_path, "r") as f:
            json_data = f.read()
            cache_list = json.loads(json_data)
            cache = [Model_result.objectify(m) for m in cache_list]
        return cache
    
    def add_cache(search_result: Model_result):
        cache = File_manager.get_cache()
        cache.append(search_result)
        cache_json = [ c.to_dict() for c in cache]
        with open(cache_path, "w") as f:
            json.dump(cache_json, f, indent=4)
        return cache
    
    def delete_bad_cache():
        cache = File_manager.get_cache()
        for i, search_result in enumerate(cache):
            if not os.path.exists(search_result.image_path):
                cache.pop(i)
        
        cache_json = [ c.to_dict() for c in cache]
        with open(cache_path, "w") as f:
            json.dump(cache_json, f, indent=4)
        return cache
    
    def delete_all_cache():
        with open(cache_path, "w") as f:
            json.dump([], f)
        return []
    
    def get_history():
        with open(searches_path, "r") as f:
            json_data = f.read()
            searches_list = json.loads(json_data)
            searches = [Search.objectify(s) for s in searches_list]
        return searches
    
    def add_history(search: Search):
        searches = File_manager.get_history()
        searches.append(search)
        searches_json = [ s.to_dict() for s in searches]
        with open(searches_path, "w") as f:
            json.dump(searches_json, f, indent=4)
        return searches
    
    def get_presets():
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