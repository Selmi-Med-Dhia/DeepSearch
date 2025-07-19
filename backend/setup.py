import os
import json
from classes.preset import Preset
from classes.settings import Settings

#//////////////////// appdata/data
data_path = os.path.join(os.path.dirname(__file__), "appdata/data")
if not os.path.exists(data_path):
    os.mkdir(data_path)

#//////////////////// Searches, Cache
files = ["searches", "cache"]
paths = [os.path.join(os.path.dirname(__file__), "appdata/data/" + f + ".json") for f in files]
for path in paths:
    if not os.path.exists(path):
        with open(path, "w") as f:
            json.dump([], f)

#//////////////////// Presets
presets_path = os.path.join(os.path.dirname(__file__), "appdata/data/presets.json")
if not os.path.exists(presets_path):
    presets = [Preset("preset" + str(i)) for i in range(1, 9)]

    presets[0].selected = True

    presets_json = [ preset.to_dict() for preset in presets]

    with open(presets_path, "w") as f:
        json.dump(presets_json, f, indent=4)

#//////////////////// Settings
settings_path = os.path.join(os.path.dirname(__file__), "appdata/data/settings.json")
if not os.path.exists(settings_path):
    settings = Settings()

    settings_json = settings.to_dict()

    with open(settings_path, "w") as f:
        json.dump(settings_json, f, indent=4)