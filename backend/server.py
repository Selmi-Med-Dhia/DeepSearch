from flask import Flask, jsonify
from flask_cors import CORS
from backend.application import Application

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "ahla bik mel python server"})

if __name__ == "__main__":
    app.run(port=5000)