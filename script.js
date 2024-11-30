const apiKey = "d2386ca5926d937366a974f6c58b0799";
const searchBtn = document.getElementById("search-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const toggleUnitBtn = document.getElementById("toggle-unit-btn");
const cityInput = document.getElementById("city-input");
const currentWeatherDetails = document.getElementById("current-weather-details");
const forecastDetails = document.getElementById("forecast-details");
const historyList = document.getElementById("history-list");

let searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];
let currentUnit = 'metric'; // Default to Celsius (metric)
let unitSymbol = '°C'; // Default Celsius symbol

// fetches weather data through api /weather endpoint
function fetchWeather(city) {
    const unit = currentUnit === 'metric' ? 'metric' : 'imperial';
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`)
      .then(response => {
        if (!response.ok) throw new Error("City not found. Please Try Again!");
        return response.json();
      })
      .then(data => {
        console.log("API Called");
        displayCurrentWeather(data);
        saveSearch(city);
      })
      .catch(error => alert(error.message));
}

// displays fetched weather data in formatted way
function displayCurrentWeather(data) {
    currentWeatherDetails.innerHTML = `
      <p>City: ${data.name}</p>
      <p>Temperature: ${data.main.temp}${unitSymbol}</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${data.wind.speed} m/s</p>
      <img class="weather-icon" src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
      <p>${data.weather[0].description}</p>
    `;

    // Change background color based on weather condition
    document.body.className = ''; // Reset previous classes
    if (data.weather[0].main === 'Rain') {
        document.body.classList.add('rainy');
    } else if (data.weather[0].main === 'Clear') {
        document.body.classList.add('sunny');
    } else if (data.weather[0].main === 'Snow') {
        document.body.classList.add('snowy');
    } else if (data.weather[0].main === 'Clouds') {
        document.body.classList.add("cloudy");
    } else if (data.weather[0].main === 'Wind') {
        data.weather[0].main === 'wind'
    }
}

// fetches weather data through api /forecast endpoint
function fetchForecast(city) {
    const unit = currentUnit === 'metric' ? 'metric' : 'imperial';
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => displayForecast(data));
}

// displays forecast weather data in formatted way
function displayForecast(data) {
    forecastDetails.innerHTML = "";
    // The list array in the API response contains 40 entries (8 readings/day × 5 days = 40 entries).
    data.list.forEach((forecast, index) => {
        // By picking one entry for every 8 intervals (using index % 8 === 0), the code selects one forecast per day, resulting in 5 forecasts.
        if (index % 8 === 0) {
            const forecastCard = document.createElement("div");
            forecastCard.classList.add("forecast-card");
            // Determine the weather type and apply the corresponding text color
            let weatherClass = "";
            const weatherCondition = forecast.weather[0].main.toLowerCase();  // Use main weather type like 'Rain', 'Clear', etc.
            // Assign class based on the weather condition
            if (weatherCondition === "rain") {
                weatherClass = "rainy";
            } else if (weatherCondition === "clear") {
                weatherClass = "sunny";
            } else if (weatherCondition === "snow") {
                weatherClass = "snowy";
            } else if (weatherCondition === "clouds") {
                weatherClass = "cloudy";
            } else if (weatherCondition === "wind") {
                weatherClass = "wind";
            }
            // Set the content of the forecast card
            forecastCard.innerHTML = `
                <h4>${new Date(forecast.dt_txt).toLocaleDateString()}</h4>
                <p>Temp: ${forecast.main.temp}${unitSymbol}</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
                <img src="http://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                <p>${forecast.weather[0].description}</p>
            `;
            // Apply the weatherClass directly to the forecastDetails container's text color
            forecastCard.classList.add(weatherClass);
            // Append the forecast card to the forecast details
            forecastDetails.appendChild(forecastCard);
        }
    });
}


// saves each searched city to searchHistory localStorage
function saveSearch(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
        updateSearchHistory();
    }
}

// updates search history both localStorage and in html by making li elements in UI + each search history element when clicked gets api called for that specific city weather...
function updateSearchHistory() {
    historyList.innerHTML = "";
    searchHistory.forEach(city => {
        const listItem = document.createElement("li");
        listItem.textContent = city;
        listItem.addEventListener("click", () => {
            fetchWeather(city);
            fetchForecast(city);
        });
        historyList.appendChild(listItem);
    });
}

// clears search history from localStorage
function clearHistory() {
    localStorage.removeItem("weatherSearchHistory");
    searchHistory = [];
    updateSearchHistory();
}

// function for toggling of units between F and C along with textContext, necessary for passing it into api conditionally for specified results
function toggleUnit() {
    if (currentUnit === 'metric') {
        currentUnit = 'imperial';
        unitSymbol = '°F';
        toggleUnitBtn.textContent = 'Switch to °C';
    } else {
        currentUnit = 'metric';
        unitSymbol = '°C';
        toggleUnitBtn.textContent = 'Switch to °F';
    }

    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        fetchForecast(city);
    }
    else{
        alert("Please enter a city name");
    }
}


// some click event listeners to make our app working
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        fetchForecast(city);
    } else {
        alert("Please enter a city name");
    }
});

clearHistoryBtn.addEventListener("click", clearHistory);
toggleUnitBtn.addEventListener("click", toggleUnit);

// making sure that our search history is updated after every clear, toggle or search is done
updateSearchHistory();
