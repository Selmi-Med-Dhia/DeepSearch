from datetime import datetime
import json

class Search:
    def __init__(self, _datetime, preset, input_count, result_count, filters):
        self.datetime: datetime = _datetime
        self.preset_name: str = preset
        self.input_count: int = input_count
        self.result_count: int = result_count
        self.filters: list[int] = filters
    def to_dict(self) -> dict:
        return ({
            "datetime" : datetime_to_dict(self.datetime),
            "preset_name" : self.preset_name,
            "input_count" : self.input_count,
            "result_count" : self.result_count,
            "filters" : self.filters,
        })
    def jsonify(self, indent=4) -> str:
        return json.dumps(self.to_dict(), indent=indent)
    
    def objectify(data, is_json=False):
        dic = data
        if is_json:
            dic = json.loads(data)
        return Search(datetime(dic["datetime"]["year"], 
                                 dic["datetime"]["month"], 
                                 dic["datetime"]["day"], 
                                 dic["datetime"]["hour"], 
                                 dic["datetime"]["minute"], 
                                 dic["datetime"]["second"]
                                ),
                      dic["preset_name"],
                      dic["input_count"],
                      dic["result_count"],
                      dic["filters"]    )

def datetime_to_dict(_datetime) -> dict:
    return ({
        'year': _datetime.year,
        'month': _datetime.month,
        'day': _datetime.day,
        'hour': _datetime.hour,
        'minute': _datetime.minute,
        'second': _datetime.second,
    })
