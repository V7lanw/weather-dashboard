// There are too many options of API in OpenWeather... I am in allodoxaphobia now. 
// To make things easy, I will attach the ref doc link as comments before I use any API.
const openWeatherAPIKey = "1e97ee70630096d453c30282fbd39878";
const openWeatherAPIDomainName = "http://api.openweathermap.org";
// Call 5 day / 3 hour forecast data, here comes the doc:
// https://openweathermap.org/forecast5#5days
// const openWeather5Day3HourAPIURL =
//     `api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherAPIKey}`;
const searchInput = $("#search-input");
const searchForm = $("#search-form");
let searchHistory = [];
let searchHistoryContainer = $("#history");
let forecastContainer = $("#forecast");
let todayContainer = $("#today");

const renderSearchHistory = function () {
    searchHistoryContainer.html("");
    for (let i = 0; i < searchHistory.length; i++) {
        let btn = $("<button>");
        btn.attr("type", "button");
        btn.addClass("history-btn btn-history");
        btn.attr("data-search", searchHistory[i]);
        btn.text(searchHistory[i]);
        searchHistoryContainer.prepend(btn);
    }
};

const prependSearchHistory = function (city) {
    if (searchHistory.indexOf(city) !== -1) {
        return;
    }
    searchHistory.unshift(city);
    localStorage.setItem("search-history", JSON.stringify(searchHistory));
    renderSearchHistory();
};

const renderCurrentWeather = function (cityName, weatherData) {
    let date = moment().format("D/M/YYYY");
    // JS bracket notation
    let temperatureCelsius = weatherData["main"]["temp"];
    let windSpeedMeterPerSecond = weatherData["wind"]["speed"];
    let humidityPercentage = weatherData["main"]["humidity"];
    // Weather Icon: https://openweathermap.org/weather-conditions
    let iconURL = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    let iconDescription = weatherData.weather[0].description || weatherData[0].main;
    let card = $("<div>");
    let cardBody = $("<div>");
    let weatherIcon = $("<img>");
    let heading = $("<h2>");
    let temperatureEl = $("<p>");
    let windEl = $("<p>");
    let humidityEl = $("<p>");
    card.attr("class", "card");
    cardBody.attr("class", "card-body");
    card.append(cardBody);
    heading.attr("class", "h3 card-title");
    temperatureEl.attr("class", "card-text");
    windEl.attr("class", "card-text");
    humidityEl.attr("class", "card-text");
    heading.text(`${cityName} (${date})`);
    weatherIcon.attr("src", iconURL);
    weatherIcon.attr("alt", iconDescription);
    heading.append(weatherIcon);
    // List of all API parameters with units: https://openweathermap.org/weather-data
    // Using ".html" rather than ".text", or some special characters may not displayed correctly.
    temperatureEl.html(`Temperature: ${temperatureCelsius} <span>&#8451;</span>`);
    windEl.text(`Wind speed: ${windSpeedMeterPerSecond} m/s`);
    humidityEl.text(`Humidity: ${humidityPercentage} %`);
    cardBody.append(heading, temperatureEl, windEl, humidityEl);
    todayContainer.html("");
    todayContainer.append(card);
};

const renderForecast = function (weatherData) {
    let headingCol = $("<div>");
    let heading = $("<h4>");
    headingCol.attr("class", "col-12");
    heading.text("5 day forecast at noon");
    headingCol.append(heading);
    forecastContainer.html("");
    forecastContainer.append(headingCol);
    console.log(weatherData);
    let futureForecast = weatherData.filter(function (forecast) {
        // Carefully setting the filter parameters, if just using "12", 
        // data like "2023-02-12 88:88:88" will be chosen multiple times.
        return forecast.dt_txt.includes("12:00:00");
    });
    console.log(futureForecast);
    for (let i = 0; i < futureForecast.length; i++) {
        let iconURL = `http://openweathermap.org/img/wn/${futureForecast[i].weather[0].icon}@2x.png`;
        console.log(iconURL);
        let iconDescription = futureForecast[i].weather[0].description;
        let tempC = futureForecast[i].main.temp;
        let humidity = futureForecast[i].main.humidity;
        let windKph = futureForecast[i].wind.speed;
        let col = $("<div>");
        let card = $("<div>");
        let cardBody = $("<div>");
        let cardTitle = $("<h5>");
        let weatherIcon = $("<img>");
        let tempEl = $("<p>");
        let windEl = $("<p>");
        let humidityEl = $("<p>");
        col.append(card);
        card.append(cardBody);
        cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

        col.attr("class", "col-md");
        card.attr("class", "card bg-primary h-100 text-white");
        cardTitle.attr("class", "card-title");
        tempEl.attr("class", "card-text");
        windEl.attr("class", "card-text");
        humidityEl.attr("class", "card-text");
        cardTitle.text(moment(futureForecast[i].dt_txt).format("D/M/YYYY"));
        weatherIcon.attr("src", iconURL);
        weatherIcon.attr("alt", iconDescription);
        // Using ".html" rather than ".text", or some special characters may not displayed correctly.
        tempEl.html(`Temp ${tempC} <span>&#8451;</span>`);
        windEl.html(`Wind: ${windKph} KPH`);
        humidityEl.html(`Humidity ${humidity} %`);

        forecastContainer.append(col);
    }
};

const fetchWeather = function (location) {
    console.log(location);
    let latitude = location.lat;
    let longitude = location.lon;
    let city = location.name;
    let queryWeatherURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${openWeatherAPIKey}`;
    // List of all API parameters with units: https://openweathermap.org/weather-data
    // Here the units is set to be metric!!!
    console.log(queryWeatherURL);
    // Notice!!!
    // If you use ajax like me, make sure your query URL starts with "http://" or "https://", 
    // or the URL will concatenate sth else at the beginning. I am sure it will be "http://127.0.0.1:5500/index.html" + query URL
    // or GitHub pages URL + query URL. 
    $.ajax({
        url: queryWeatherURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        renderCurrentWeather(city, response.list[0]);
        renderForecast(response.list);
    });
};

const fetchCoordinates = function (cityName) {
    const queryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=10&appid=${openWeatherAPIKey}`;
    fetch(queryURL, { method: "GET" }).then(function (data) {
        return data.json();
    }).then(function (response) {
        if (!response[0]) {
            console.log("Location not found");
        } else {
            prependSearchHistory(cityName);
            fetchWeather(response[0]);
        }
        console.log(response);
    });
};

const initializeHistory = function () {
    let storedHistory = localStorage.getItem("search-history");
    if (storedHistory) {
        searchHistory = JSON.parse(storedHistory);
    }
    renderSearchHistory();
};

const submitSearchForm = function (event) {
    event.preventDefault();
    const searchItem = $.trim(searchInput.val());
    fetchCoordinates(searchItem);
    searchInput.val("")
};

const clickSearchHistory = function (event) {
    if (!$(event.target).hasClass("btn-history")) {
        return;
    }
    let search = $(event.target).attr("data-search");
    fetchCoordinates(search);
    searchInput.val("");
};

initializeHistory();
searchForm.on("submit", submitSearchForm);
searchHistoryContainer.on("click", clickSearchHistory);