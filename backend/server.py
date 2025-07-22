from flask import Flask, jsonify, request
from flask_cors import CORS
from backend.application import Application

app = Flask(__name__)
CORS(app)

application = Application()

@app.route('/', methods=['GET'])
def get_setup_info():
    return application.jsonify()

@app.route('/cache/size', methods=['GET'])
def get_cache_size():
    return application.get_cache_size_json()

@app.route('/customfolder/remove', methods=['GET'])
def remove_custom_folder():
    application.remove_custom_folder()
    return jsonify(message="ok"), 200

@app.route('/cache/clearall', methods=['GET'])
def clear_all_cache():
    application.clear_all_cache()
    return jsonify(message="ok"), 200

@app.route('/cache/clearbad', methods=['GET'])
def clear_bad_cache():
    application.clear_bad_cache()
    return application.get_cache_size_json()

@app.route('/updatesettings', methods=['POST'])
def update_settings():
    application.update_settings( request.data.decode('utf-8'))
    return jsonify(message="ok"), 200

@app.route('/sendfeedback', methods=['POST'])
def send_feedback():
    application.send_feedback( request.data.decode('utf-8'))
    return jsonify(message="ok"), 200

@app.route('/preset/select', methods=['POST'])
def select_preset():
    application.select_preset( request.data.decode('utf-8'))
    return jsonify(message="ok"), 200

@app.route('/preset/update', methods=['POST'])
def update_preset():
    application.update_preset( request.data.decode('utf-8'))
    return jsonify(message="ok"), 200

@app.route('/customfolder/add', methods=['POST'])
def add_custom_folder():
    application.add_custom_folder( request.data.decode('utf-8'))
    return jsonify(message="ok"), 200

@app.route('/openfolder', methods=['POST'])
def open_folder():
    application.open_folder( request.data.decode('utf-8'))
    return jsonify(message="ok"), 200

@app.route('/search', methods=['POST'])
def search():
    return(application.search( request.data.decode('utf-8')), 200)

@app.route('/are/you/running', methods=['GET'])
def am_I_running():
    return jsonify(message="ok"), 200

if __name__ == "__main__":
    app.run(port=5000)