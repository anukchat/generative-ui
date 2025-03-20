import os
import asyncio
from typing import Dict, Any, Optional
from langchain_core.tools import tool
import python_weather
from python_weather.enums import Units

@tool
def get_weather_info(location: str) -> Dict[str, Any]:
    """
    Get current weather information for a given location.
    
    Args:
        location: The city or location to get weather for (e.g., "New York", "London")
        
    Returns:
        A dictionary containing weather information including temperature, condition, and humidity.
    """
    try:
        # Run the asynchronous function to get weather data
        weather_data = asyncio.run(_get_weather_async(location))
        return weather_data
    
    except Exception as e:
        return {"error": f"Error retrieving weather information: {str(e)}"}

async def _get_weather_async(location: str) -> Dict[str, Any]:
    """
    Asynchronous function to get weather data using python_weather library.
    """
    # Initialize the client with metric units (Celsius)
    async with python_weather.Client(unit=Units.METRIC) as client:
        try:
            # Fetch weather data for the specified location
            weather = await client.get(location)
            
            # Extract current weather information
            current = weather.current
            
            # Create response with UI component data
            result = {
                "location": location,
                "temperature": current.temperature,
                "condition": current.description,
                "humidity": current.humidity,
                "wind_speed": current.wind_speed,
                "ui_component": {
                    "type": "weather_card",
                    "data": {
                        "location": location,
                        "temperature": current.temperature,
                        "condition": current.description,
                        "humidity": current.humidity
                    }
                }
            }
            
            # Add forecast data
            forecasts = []
            for forecast in weather.forecasts[:5]:  # Get next 5 days
                forecasts.append({
                    "date": str(forecast.date),
                    "temperature": forecast.temperature,
                    "description": forecast.description
                })
            
            result["forecast"] = forecasts
            
            return result
        
        except Exception as e:
            return {"error": f"Could not retrieve weather for {location}: {str(e)}"}
