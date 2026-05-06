import requests
import time
from datetime import datetime
from pymongo import MongoClient
from config import API_KEY

# ==============================
# 🔹 MongoDB Configuration
# ==============================
MONGO_URI = "mongodb+srv://sanjanascs22_db_user:qmsgkJv8Ao3RmpI7@cluster0.wmxt8s8.mongodb.net/?appName=Cluster0"
DB_NAME = "weatherDB"
COLLECTION_NAME = "weather_data"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# ==============================
# 🔹 Fixed Pond Location
# ==============================
CITY = "Mangalore"

# ==============================
# 🔹 Fetch Weather Data
# ==============================
def fetch_weather():
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        data = response.json()

        # Safety check (important)
        if response.status_code != 200:
            print("❌ API Error:", data)
            return None

        weather_entry = {
            "city": CITY,
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "rainfall": data.get("rain", {}).get("1h", 0),
            "wind_speed": data["wind"]["speed"],
            "weather_condition": data["weather"][0]["main"],
            "timestamp": datetime.utcnow()
        }

        return weather_entry

    except Exception as e:
        print("❌ Fetch Error:", e)
        return None


# ==============================
# 🔹 Store Data in MongoDB
# ==============================
def store_data():
    weather = fetch_weather()

    if weather:
        collection.insert_one(weather)
        print(f"✅ Stored at {weather['timestamp']} → Temp: {weather['temperature']}°C")
    else:
        print("⚠️ Skipping insert (no data)")


# ==============================
# 🔹 Main Loop (Runs Forever)
# ==============================
if __name__ == "__main__":
    print("🚀 Weather data collection started...")

    while True:
        store_data()
        time.sleep(300)  # every 5 minutes