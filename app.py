from flask import Flask, jsonify, render_template
from pymongo import MongoClient
from datetime import datetime, timedelta

app = Flask(__name__)

# ==============================
# 🔹 MongoDB Configuration
# ==============================
MONGO_URI = "mongodb+srv://sanjanascs22_db_user:qmsgkJv8Ao3RmpI7@cluster0.wmxt8s8.mongodb.net/?appName=Cluster0"  # ← replace this

client = MongoClient(MONGO_URI)
db = client["weatherDB"]
collection = db["weather_data"]

# ==============================
# 🔹 Route: Home (optional)
# ==============================
@app.route("/")
def home():
    return render_template("weather.html")

# ==============================
# 🔹 Route: Weather Page (Frontend)
# ==============================
@app.route("/weather")
def weather_page():
    return render_template("weather.html")

# ==============================
# 🔹 Route: API (Fetch Data)
# ==============================
@app.route("/weather-data", methods=["GET"])
def get_weather_data():
    try:
        # Last 24 hours
        last_24_hours = datetime.utcnow() - timedelta(hours=24)

        data = list(collection.find(
            {"timestamp": {"$gte": last_24_hours}},
            {"_id": 0}
        ).sort("timestamp", 1))

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# 🔹 Run App
# ==============================
if __name__ == "__main__":
    app.run(debug=True)