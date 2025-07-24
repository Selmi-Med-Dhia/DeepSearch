# <img width="31" height="31" alt="logo" src="https://github.com/user-attachments/assets/49e32cd6-eaad-49a2-9ed5-8802577764f6" /> DeepSeach

Tired of scrolling through hundreds of unorganized, unlabeled images just to find one picture with a specific object or objects? **DeepSearch** is your solution.

This desktop app uses **object detection** to let you search for one or more objects in a folder full of images — instantly. It can even highlight found objects with bounding boxes and confidence scores, and optionally export result metadata to a JSON file.

---

## ⚙️ Features

- 🔍 **Search by object class** (e.g., "person", "car", "dog")
- 📂 **Works with large folders** containing hundreds of images
- 📦 **Bounding box display** with confidence score
- 🎛️ **Customizable presets** to switch between search modes
- 💾 **Automatic caching** for performance boost on repeated searches
- 🧠 **Parallel processing** support for faster execution
- 📜 **Search history** saved and viewable in-app
- 📁 **Results folder** with matching images and metadata
- 📧 **Built-in feedback sender** via email
- 🧹 **Cache control and settings** management

---

## 🖥️ User Interface

The app is organized into three main sections:

- ### **Main Section**
  - Configure and execute object searches
  - Save and reuse **presets** with custom result folders and options
<img width="1229" height="863" alt="image" src="https://github.com/user-attachments/assets/f3ce0e0c-7132-4121-94f0-8dc22cd2313f" />

- ### **History Section**
  - Click the **clock icon** (top-right) to view previous searches
<img width="1236" height="871" alt="image" src="https://github.com/user-attachments/assets/ef40fc68-ff76-4560-822d-37fdd5f3b011" />

- ### **Settings Section**
  - Click the **gear icon** (top-left) to:
    - Clear full or unuseful cache
    - Choose the number of parallel processes
    - Set custom parent folder for results
    - Toggle automatic JSON report generation
    - Submit feedback through a text area
<img width="1234" height="867" alt="image" src="https://github.com/user-attachments/assets/fab22f2e-d9bc-494d-b437-7ee67f4f036c" />
<img width="1236" height="871" alt="image" src="https://github.com/user-attachments/assets/2e412aed-6735-4271-82c5-a03036e62147" />

---

## 🧱 Architecture

The app uses a hybrid stack combining modern web and Python-based machine learning tools:

- **Electron** — for the desktop interface
- **Flask** — local backend API to run processing
- **Ultralytics YOLO** — for object detection
- **OpenCV (cv2), NumPy** — for image handling and processing
- **Python Multiprocessing (Pool)** — for performance
- **hashlib** — ensures cache integrity
- **dotenv, ssl, smtplib, EmailMessage** — to securely send feedback
- **json, os, platform, subprocess, datetime** — for data and system management

Data is stored in **4 JSON files**:
- `appdata/data/settings.json` – user preferences
- `appdata/data/presets.json` – saved search configurations
- `appdata/data/searches.json` – previous searches
- `appdata/data/cache.json` – cached file metadata

---

## 🖼️ Platform Support

- ✅ **Windows** — fully supported
- ⚠️ **macOS / Linux** — may work, but **not officially tested yet**

---

## 🚧 Status

This app is still under early development. Expect improvements, optimizations, and new features soon. Contributions and suggestions are welcome!

---

## 📬 Feedback

You can send feedback **directly from the app** (via the settings section), or feel free to [open an issue](#) here.

---

