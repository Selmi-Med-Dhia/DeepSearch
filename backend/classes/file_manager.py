import os
import json
from bounding_box import Bounding_box
from model import Model
from model_result import Model_result
from preset import Preset
from settings import Settings

cache_path = os.path.join(os.path.dirname(__file__), "../appdata/data/cache.json")
presets_path = os.path.join(os.path.dirname(__file__), "../appdata/data/presets.json")
searches_path = os.path.join(os.path.dirname(__file__), "../appdata/data/searches.json")
settings_path = os.path.join(os.path.dirname(__file__), "../appdata/data/settings.json")

class File_manager:
    def __init__(self):
        pass
    def get_cache():
        pass
    def add_cache(search_results):
        pass
    def delete_bad_cache():
        pass
    def delete_all_cache():
        pass
    def get_history():
        pass
    def add_history(search):
        pass
    def get_presets():
        with open(presets_path, "r") as f:
            json_data = f.read()
            preset_list = json.loads(json_data)
            presets = [Preset().objectify(preset) for preset in preset_list]
        return presets
    def update_presets(presets):
        pass
    def update_settings(settings):
        pass
File_manager.get_presets()