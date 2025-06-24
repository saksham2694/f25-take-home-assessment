from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
from dotenv import load_dotenv
import os
import requests
import uuid

load_dotenv()
WEATHERSTACK_API_KEY = os.environ["WEATHERSTACK_API_KEY"]

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    if not request.date or not request.location:
        raise HTTPException(status_code=400, detail="Date and location are required.")

    params = {
        "access_key": WEATHERSTACK_API_KEY,
        "query": request.location,
    }
    try:
        response = requests.get("http://api.weatherstack.com/current", params=params, timeout=10)
        data = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error contacting WeatherStack API: {str(e)}")

    if not response.ok or "error" in data:
        error_msg = data.get("error", {}).get("info", "Failed to fetch weather data.")
        raise HTTPException(status_code=400, detail=error_msg)

    weather_id = str(uuid.uuid4())

    weather_storage[weather_id] = {
        "id": weather_id,
        "date": request.date,
        "location": request.location,
        "notes": request.notes,
        "weather": data.get("current", {}),
    }

    return {"id": weather_id}

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)