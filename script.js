const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");

const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const apiKey = "162e69d0dad4e256e2b1bcc6da513ebd";

const createWheatherCard = (cityName, weatheritem, index) => {
  if (index === 0) {
    // html for main card
    return `<div class="details">
                <h2>${cityName} ${weatheritem.dt_txt.split(" ")[0]}</h2>
                <h4>Temperature: ${(weatheritem.main.temp - 273.15).toFixed(
                  2
                )}C</h4>
                <h4>Wind: ${weatheritem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatheritem.main.humidity}%</h4>
              </div>
              <div class="icon">
                <img src="https://openweathermap.org/img/wn/${
                  weatheritem.weather[0].icon
                }@4x.png" alt="" />
                <h4>${weatheritem.weather[0].description}</h4>
  </div>`;
  } else {
    // html for other 5 cards
    return ` <li class="card">
              <h3>(${weatheritem.dt_txt.split(" ")[0]})</h3>
              <img src="https://openweathermap.org/img/wn/${
                weatheritem.weather[0].icon
              }@2x.png" alt="" />
              <h4>Temperature: ${(weatheritem.main.temp - 273.15).toFixed(
                2
              )}C</h4>
              <h4>Wind: ${weatheritem.wind.speed} M/S</h4>
              <h4>Humidity: ${weatheritem.main.humidity}%</h4>
        </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(weatherApiUrl)
    .then((res) => res.json())
    .then((data) => {
      //filters the forecasts to get only one forecast per day
      const uniqueForecastDays = [];

      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastData = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastData)) {
          return uniqueForecastDays.push(forecastData);
        }
      });
      // Clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      //creating weather cards and adding them to the dom

      fiveDaysForecast.forEach((weatheritem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML(
            "beforeend",
            createWheatherCard(cityName, weatheritem, index)
          );
        } else {
          weatherCardsDiv.insertAdjacentHTML(
            "beforeend",
            createWheatherCard(cityName, weatheritem, index)
          );
        }
      });
    })
    .catch(() => {
      alert("An error occcured while fetching the the weather forecast");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim(); // get user entered city name and remove empty spaces
  if (!cityName) return;
  const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;

  // get entered city coordinates (latitude, longitude and name) from API
  fetch(geocodingApiUrl)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No Coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occcured while fetching the coordinates");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const reverseGeocoordinatesUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
      // get city name from coordinates using reverse geocoding api

      fetch(reverseGeocoordinatesUrl)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occcured while fetching the city");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Reset location permissin to grant access again");
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);
