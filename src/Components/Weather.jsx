import React from 'react';
import { useState, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

export const WEATHER_API_KEY = '7dfd2fa429e1db3fb36c02f3199edbac';

export default function WeatherDisplay() {
  const inputLocation = useRef(null);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      searchLocation();
    }
  };

  function searchLocation() {
    const searchTerm = inputLocation.current.value;
    if (searchTerm.trim() === '') return;
    
    setError('');
    fetchWeatherData(searchTerm);
  }

  const fetchWeatherData = (city) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
    
    axios.get(weatherUrl)
      .then(response => {
        console.log("Weather data received:", response.data);
        setWeatherData(response.data);
        setShowWeather(true);
      })
      .catch(error => {
        console.error("Error fetching weather data:", error);
        setError("Location not found. Please try another search term.");
        setShowWeather(false);
      });
  };

  function SearchBar() {
    return (
      <Form className='d-flex'>
        <Form.Control
          ref={inputLocation}
          type='search'
          placeholder='Enter city or location'
          className='ms-0 mt-2'
          aria-label='Search'
          onKeyDown={handleKeyDown}
        />
        <Button
          className='ms-2 mt-2 myFont bold'
          gap={1}
          variant='dark'
          onClick={() => searchLocation()}
        >
          Search
        </Button>
      </Form>
    );
  }

  function WeatherInfo() {
    if (!weatherData) return null;
    
    return (
      <div className="weather-display-container mt-4">
        <div className="weather-info p-4 bg-dark text-light rounded">
          <h3 className="mb-3">{weatherData.name}, {weatherData.sys.country}</h3>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-3">{Math.round(weatherData.main.temp)}°C</h2>
              <p className="mb-2">Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
              <p className="mb-2">Humidity: {weatherData.main.humidity}%</p>
              <p className="mb-2">Wind: {weatherData.wind.speed} m/s</p>
              <p className="mb-2">Pressure: {weatherData.main.pressure} hPa</p>
              {weatherData.visibility && (
                <p className="mb-0">Visibility: {(weatherData.visibility / 1000).toFixed(1)} km</p>
              )}
            </div>
            <div className="text-center">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                alt={weatherData.weather[0].description}
                className="weather-icon"
                style={{width: '120px', height: '120px'}}
              />
              <p className="text-capitalize">{weatherData.weather[0].description}</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="mb-0">
              <small>Coordinates: {weatherData.coord.lat.toFixed(4)}, {weatherData.coord.lon.toFixed(4)}</small>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg--div'>
      <h1 className='bold'>Weather Information</h1>
      <SearchBar />
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {showWeather && weatherData && <WeatherInfo />}
    </div>
  );
}