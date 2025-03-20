import React from 'react'

interface WeatherCardProps {
  location: string
  temperature: number
  condition: string
  humidity: number
}

export function WeatherCard({ location, temperature, condition, humidity }: WeatherCardProps) {
  // Function to determine which weather icon to display based on condition
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase()
    
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return '☀️'
    } else if (lowerCondition.includes('cloud')) {
      return '☁️'
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
      return '🌧️'
    } else if (lowerCondition.includes('snow')) {
      return '❄️'
    } else if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
      return '⛈️'
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return '🌫️'
    } else if (lowerCondition.includes('wind')) {
      return '💨'
    } else {
      return '🌤️' // Default partly cloudy
    }
  }
  
  return (
    <div className="weather-card">
      <h3 className="text-xl font-bold mb-2">{location}</h3>
      <div className="weather-icon">{getWeatherIcon(condition)}</div>
      <div className="weather-temp">{temperature}°C</div>
      <div className="weather-condition">{condition}</div>
      
      <div className="weather-details">
        <div className="weather-detail">
          <span className="weather-detail-label">Humidity</span>
          <span className="weather-detail-value">{humidity}%</span>
        </div>
      </div>
    </div>
  )
}
