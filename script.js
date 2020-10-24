function weatherRun() {
    const city = document.getElementById("enter-city");
    const searchBtn = document.getElementById("search-button");
    const clearBtn = document.getElementById("clear-history");
    const cityResult = document.getElementById("city-name");
    const currentWeatherIcon = document.getElementById("current-pic");
    const currentTemp = document.getElementById("temperature");
    const currentHumidity = document.getElementById("humidity");
    const windSpeed = document.getElementById("wind-speed");
    const uvIndex = document.getElementById("UV-index");
    const history = document.getElementById("history");
    var fiveday = document.getElementById("5dayLook");
    var todayweather = document.getElementById("today-weather");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

 
    const APIKey = "84b79da5e5d7c92085660485702f4ce8";

    function getWeather(cityName) {
        // Initial weather get request from open weather api with axios call
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        axios.get(queryURL)
            .then(function (response) {
                console.log(response);

                todayweather.classList.remove("d-none");

                // Parse response to display current weather
                const currentDate = new Date();
                const day = currentDate.getDate();
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                cityResult.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
                
                let weatherPic = response.data.weather[0].icon;
                currentWeatherIcon.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                currentWeatherIcon.setAttribute("alt", response.data.weather[0].description);
                currentTemp.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
                currentHumidity.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                windSpeed.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
                
                // Get latitude/longitude call for UV
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;
                let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";

                //axios call
                axios.get(UVQueryURL)
                    .then(function (response) {
                        console.log(response.data);
                       
                        let nowUV = document.createElement("span");
                        
                        //  UV Index scale: if good= green, if ok = yellow, if bad = red
                        if (response.data[0].value < 4 ) {
                            nowUV.setAttribute("class", "badge badge-success");
                        }
                        else if (response.data[0].value < 8) {
                            nowUV.setAttribute("class", "badge badge-warning");
                        }
                        else {
                            nowUV.setAttribute("class", "badge badge-danger");
                        }
                        console.log(response.data[0].value)
                        nowUV.innerHTML = response.data[0].value;
                        uvIndex.innerHTML = "UV Index: ";
                        uvIndex.append(nowUV);
                    });
                
                // Get 5 day forecast for this city
                let cityID = response.data.id;
                let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        fiveday.classList.remove("d-none");
                        
                        //  Parse response to display forecast for next 5 days
                        const forecastEls = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            const forecastIndex = i * 8 + 4;
                            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            const forecastDay = forecastDate.getDate();
                            const forecastMonth = forecastDate.getMonth() + 1;
                            const forecastYear = forecastDate.getFullYear();
                            const forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);

                            // Icon for current weather
                            const forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            const forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                            forecastEls[i].append(forecastTempEl);
                            const forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);
                        }
                    })
            });
    }
// previous searches
    searchBtn.addEventListener("click", function () {
        const searchTerm = city.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    // clear button
    clearBtn.addEventListener("click", function () {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    })
// kelvin to farenheit conversion
    function k2f(K) {
        return Math.floor((K - 273.15) * 1.8 + 32);
    }

    function renderSearchHistory() {
        history.innerHTML = "";
        for (let i = 0; i < searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click", function () {
                getWeather(historyItem.value);
            })
            history.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
    
}

weatherRun();