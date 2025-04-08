import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../app.css';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.css';
import refresh from '../images/refresh.svg';

export const WEATHER_API_KEY = '7dfd2fa429e1db3fb36c02f3199edbac';

export default function Home() {
  const [data, setData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState('Bhubaneswar');
  const [inputCity, setInputCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);


  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

  useEffect(() => {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    getWeatherByCity(weatherUrl);
    getForecastData(forecastUrl);
    
    if (city) {
      updateSearchHistory(city);
    }
  }, [city]);

  const updateSearchHistory = (newCity) => {
    setSearchHistory(prevHistory => {

      const filteredHistory = prevHistory.filter(item => item.toLowerCase() !== newCity.toLowerCase());
      
      const updatedHistory = [newCity, ...filteredHistory].slice(0, 5);
      
      localStorage.setItem('weatherSearchHistory', JSON.stringify(updatedHistory));
      
      return updatedHistory;
    });
  };

  function getWeatherByCity(url) {
    setLoading(true);
    setError(null);
    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching weather data:', error);
        setError('City not found. Please try again.');
        setLoading(false);
      });
  }

  function getForecastData(url) {
    setForecastLoading(true);
    axios
      .get(url)
      .then((response) => {
        const forecastList = response.data.list;
        const processedData = processForecastData(forecastList);
        setForecastData(processedData);
        setForecastLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching forecast data:', error);
        setForecastLoading(false);
      });
  }

  const processForecastData = (forecastList) => {
    const dailyData = [];
    const today = new Date().getDate();
    
    const dailyMap = new Map();
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.getDate();
      
      if (day === today) return;
      
      const dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      const hour = date.getHours();
      if (!dailyMap.has(dateKey) || (hour >= 12 && hour <= 14)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          temp: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind: item.wind.speed
        });
      }
    });
    
    dailyMap.forEach(value => {
      dailyData.push(value);
    });
    
    return dailyData.slice(0, 5);
  };

  const handleCityInputChange = (e) => {
    setInputCity(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity);
      setInputCity('');
    }
  };

  const selectCityFromHistory = (selectedCity) => {
    setCity(selectedCity);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getTimeOfDay = () => {
    if (!data.sys) return '';
    const now = new Date();
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    
    if (now > sunrise && now < sunset) {
      return 'day';
    } else {
      return 'night';
    }
  }
  
  const timeOfDay = getTimeOfDay();
  
  const getTempCategory = () => {
    if (!data.main) return '';
    const temp = data.main.temp;
    if (temp < 10) return 'cold';
    if (temp < 20) return 'cool';
    if (temp < 30) return 'warm';
    return 'hot';
  }

  const getThemeStyles = () => {
    if (isDarkMode) {
      return {
        bgColor: "linear-gradient(to bottom, #121212, #2c3e50)",
        cardBg: "rgba(30, 30, 30, 0.9)",
        textColor: "#f5f5f5",
        detailBg: "rgba(50, 50, 50, 0.7)",
        mutedText: "#adb5bd",
        borderColor: "rgba(80, 80, 80, 0.3)"
      };
    } else {
      return {
        bgColor: data.main ? 
          (getTempCategory() === 'cold' ? 'linear-gradient(to bottom, #a8c0ff, #3f4c6b)' : 
          getTempCategory() === 'cool' ? 'linear-gradient(to bottom, #89f7fe, #66a6ff)' :
          getTempCategory() === 'warm' ? 'linear-gradient(to bottom, #ffd194, #ff9a44)' :
          'linear-gradient(to bottom, #ff7e5f, #feb47b)') : 
          'linear-gradient(to bottom, #6a11cb, #2575fc)',
        cardBg: "rgba(255, 255, 255, 0.85)",
        textColor: "#333",
        detailBg: "rgba(26, 115, 232, 0.1)",
        mutedText: "#6c757d",
        borderColor: "rgba(255, 255, 255, 0.18)"
      };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <>
      <div className={`bg--div ${timeOfDay} ${getTempCategory()}`} style={{
        background: themeStyles.bgColor,
        minHeight: '100vh',
        padding: '20px',
        fontFamily: '"Poppins", sans-serif',
        color: themeStyles.textColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease'
      }}>
        <div className="container py-4 px-3" style={{
          backgroundColor: themeStyles.cardBg,
          borderRadius: "16px",
          boxShadow: isDarkMode ? 
            "0 8px 32px rgba(0, 0, 0, 0.5)" : 
            "0 8px 32px rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${themeStyles.borderColor}`,
          padding: "25px",
          transition: 'all 0.3s ease'
        }}>
          {/* Theme toggle switch */}
          <div className="d-flex justify-content-end mb-3">
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="themeSwitch" 
                onChange={toggleTheme}
                checked={isDarkMode}
                style={{ cursor: 'pointer', width: '50px', height: '24px' }}
              />
              <label className="form-check-label ms-2" htmlFor="themeSwitch" style={{ cursor: 'pointer' }}>
                {isDarkMode ? '🌙 Dark' : '☀️ Light'}
              </label>
            </div>
          </div>

          <h1 className='text-center mb-4' style={{
            fontWeight: '700',
            color: isDarkMode ? '#64b5f6' : '#1a73e8',
            fontSize: '2.5rem',
            textShadow: isDarkMode ? 
              '2px 2px 4px rgba(0,0,0,0.3)' : 
              '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span style={{position: 'relative'}}>
              Weather<span style={{color: isDarkMode ? '#ff8a80' : '#ff6b6b'}}>Check</span>
              <span style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                fontSize: '1rem',
                color: isDarkMode ? '#ff8a80' : '#ff6b6b'
              }}>✦</span>
            </span>
          </h1>
          
          <div className='mb-4 px-4'>
            <form onSubmit={handleSubmit} className="d-flex">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search for any city in India"
                value={inputCity}
                onChange={handleCityInputChange}
                style={{
                  borderRadius: "30px 0 0 30px",
                  padding: "12px 20px",
                  border: "none",
                  backgroundColor: isDarkMode ? '#333' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#333',
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  fontSize: "1rem",
                  transition: 'all 0.3s ease'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{
                borderRadius: "0 30px 30px 0",
                padding: "0 25px",
                backgroundColor: isDarkMode ? "#64b5f6" : "#1a73e8",
                border: "none",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease"
              }}>
                <i className="fas fa-search"></i> Check
              </button>
            </form>
          </div>
          
          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <div className="recent-searches mb-4 px-4">
              <h6 style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>Recent Searches:</h6>
              <div className="d-flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    className="btn btn-sm"
                    onClick={() => selectCityFromHistory(item)}
                    style={{
                      backgroundColor: isDarkMode ? '#444' : '#e9ecef',
                      color: isDarkMode ? '#f5f5f5' : '#495057',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '5px 15px',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" 
                role="status" 
                style={{ color: isDarkMode ? '#64b5f6' : '#1a73e8' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Fetching weather data...</p>
            </div>
          ) : (
            data.main && (
              <div className='weather-container'>
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card h-100" style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: isDarkMode ? 
                        "0 10px 15px rgba(0,0,0,0.3)" : 
                        "0 10px 15px rgba(0,0,0,0.1)",
                      border: "none",
                      backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
                      color: isDarkMode ? '#f5f5f5' : '#333',
                      transition: 'all 0.3s ease'
                    }}>
                      <div className="card-body text-center">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h2 className="m-0 font-weight-bold">
                            {data.name}, {data.sys.country}
                          </h2>
                          <button className='btn rounded-circle p-2' 
                            onClick={() => getWeatherByCity(weatherUrl)}
                            style={{
                              backgroundColor: isDarkMode ? '#444' : '#f8f9fa',
                              color: isDarkMode ? '#f5f5f5' : '#333',
                            }}>
                            <img src={refresh} width='24' alt='refresh' />
                          </button>
                        </div>
                        
                        <div className="weather-icon-container mb-3">
                          <img
                            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`}
                            alt={data.weather[0].description}
                            style={{width: "150px", margin: "-20px"}}
                          />
                          <h3 className="text-capitalize">{data.weather[0].description}</h3>
                        </div>
                        
                        <div className="temperature-display">
                          <h1 className='temp display-1 font-weight-bold mb-0' style={{
                            color: isDarkMode ? 
                              (getTempCategory() === 'cold' ? '#81d4fa' : 
                              getTempCategory() === 'cool' ? '#64b5f6' :
                              getTempCategory() === 'warm' ? '#ffb74d' : '#ff8a80') :
                              (getTempCategory() === 'cold' ? '#3f4c6b' : 
                              getTempCategory() === 'cool' ? '#1a73e8' :
                              getTempCategory() === 'warm' ? '#ff9a44' : '#ff5e62')
                          }}>
                            {Math.round(data.main.temp)}
                            <sup style={{fontSize: "40%", top: "-1.5em"}}>°C</sup>
                          </h1>
                          <p className="lead">
                            Feels like <strong>{Math.round(data.main.feels_like)}°C</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <div className="card h-100" style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: isDarkMode ? 
                        "0 10px 15px rgba(0,0,0,0.3)" : 
                        "0 10px 15px rgba(0,0,0,0.1)",
                      border: "none",
                      backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
                      color: isDarkMode ? '#f5f5f5' : '#333',
                      transition: 'all 0.3s ease'
                    }}>
                      <div className="card-body">
                        <h4 className="card-title mb-4">Weather Details</h4>
                        
                        <div className="weather-details">
                          <div className="detail-item d-flex justify-content-between align-items-center mb-3 p-3" style={{
                            backgroundColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : 'rgba(26, 115, 232, 0.1)',
                            borderRadius: "10px",
                            transition: 'all 0.3s ease'
                          }}>
                            <span>Temperature Range</span>
                            <span className="font-weight-bold">
                              {Math.round(data.main.temp_min)}°C - {Math.round(data.main.temp_max)}°C
                            </span>
                          </div>
                          
                          <div className="detail-item d-flex justify-content-between align-items-center mb-3 p-3" style={{
                            backgroundColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : 'rgba(26, 115, 232, 0.1)',
                            borderRadius: "10px",
                            transition: 'all 0.3s ease'
                          }}>
                            <span>Humidity</span>
                            <span className="font-weight-bold">
                              {Math.round(data.main.humidity)}%
                            </span>
                          </div>
                          
                          <div className="detail-item d-flex justify-content-between align-items-center mb-3 p-3" style={{
                            backgroundColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : 'rgba(26, 115, 232, 0.1)',
                            borderRadius: "10px",
                            transition: 'all 0.3s ease'
                          }}>
                            <span>Wind Speed</span>
                            <span className="font-weight-bold">
                              {Math.round(data.wind.speed)} m/s
                            </span>
                          </div>
                          
                          <div className="detail-item d-flex justify-content-between align-items-center p-3" style={{
                            backgroundColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : 'rgba(26, 115, 232, 0.1)',
                            borderRadius: "10px",
                            transition: 'all 0.3s ease'
                          }}>
                            <span>Pressure</span>
                            <span className="font-weight-bold">
                              {data.main.pressure} hPa
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer border-0 text-center" style={{
                        backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
                        transition: 'all 0.3s ease'
                      }}>
                        <small style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>
                          Coordinates: {data.coord.lat.toFixed(2)}, {data.coord.lon.toFixed(2)}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 5-Day Forecast Section */}
                <div className="forecast-section mt-4">
                  <h4 className="mb-4" style={{
                    color: isDarkMode ? '#f5f5f5' : '#333',
                  }}>5-Day Forecast</h4>
                  
                  {forecastLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span className="ms-2">Loading forecast...</span>
                    </div>
                  ) : (
                    <div className="row">
                      {forecastData.map((day, index) => (
                        <div className="col-md-20 col-6 mb-3" key={index}>
                          <div className="card forecast-card h-100" style={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: isDarkMode ? 
                              "0 5px 10px rgba(0,0,0,0.3)" : 
                              "0 5px 10px rgba(0,0,0,0.1)",
                            border: "none",
                            backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
                            color: isDarkMode ? '#f5f5f5' : '#333',
                            transition: 'all 0.3s ease'
                          }}>
                            <div className="card-body p-3 text-center">
                              <h6 className="card-title mb-2">{day.date}</h6>
                              <img 
                                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                                alt={day.description}
                                style={{ width: "60px", margin: "-10px" }}
                              />
                              <p className="mb-1 text-capitalize" style={{ fontSize: "0.85rem" }}>
                                {day.description}
                              </p>
                              <h5 className="mb-1">{day.temp}°C</h5>
                              <p className="mb-0" style={{ 
                                fontSize: "0.8rem", 
                                color: isDarkMode ? '#adb5bd' : '#6c757d' 
                              }}>
                                Humidity: {day.humidity}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
        
        <footer className="py-3 text-center" style={{
          color: isDarkMode ? "#adb5bd" : "#fff", 
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
          marginTop: "20px",
          transition: 'all 0.3s ease'
        }}>
          <p>
            Made with <span style={{ color: isDarkMode ? "#ff8a80" : "#ff6b6b" }}>❤</span> by Swapnil Raj
          </p>
        </footer>
      </div>
    </>
  );
}