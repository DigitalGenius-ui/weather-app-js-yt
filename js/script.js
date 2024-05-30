const cDegreeBtn = document.querySelector(".cDegree");
const fDegreeBtn = document.querySelector(".fDegree");
const searchInput = document.querySelector(".search");
const searchBtn = document.querySelector(".searchIcon");

const { DateTime } = luxon;

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = "36812f053dbdc170668129cff242f054";
const storedLocation = JSON.parse(localStorage.getItem("location"));
let search = !storedLocation
  ? { q: "brisbane" }
  : { lat: storedLocation.lat, lon: storedLocation.lon };
let units = "metric"; // imperial

// create api url
async function createUrl(weatherType, searchParams) {
  const newUrl = new URL(BASE_URL + "/" + weatherType);
  newUrl.search = new URLSearchParams({
    ...searchParams,
    appid: API_KEY,
  }).toString();

  const item = await fetch(newUrl);
  return await item.json();
}

// get location
function getLocation() {
  if (!storedLocation) {
    navigator.geolocation.getCurrentPosition(
      (data) => {
        const { latitude: lat, longitude: lon } = data.coords;
        localStorage.setItem("location", JSON.stringify({ lat, lon }));
      },
      (err) => {
        console.log(err);
      }
    );
  }
}

// generate data from api
async function generateData(searchParams) {
  const response = await createUrl("weather", searchParams).then(formatAllData);
  return { ...response };
}

function formatAllData(data) {
  const {
    coord: { lat, lon },
    main: { feels_like, humidity, temp, temp_max, temp_min, pressure },
    name,
    dt,
    sys: { country, sunrise, sunset },
    timezone,
    weather: [{ description, icon }],
    wind: { speed },
  } = data;

  return {
    lat,
    lon,
    feels_like,
    humidity,
    temp,
    temp_max,
    temp_min,
    name,
    dt,
    country,
    sunrise,
    sunset,
    timezone,
    description,
    icon,
    speed,
    pressure,
  };
}

const formatTime = (sec, zone, format = "c LLL yyyy | 'Local Time : 'hh : mm a") =>
  DateTime.fromSeconds(sec).setZone(zone).toFormat(format);

// fetch api data

const fetchWeatherData = async () => {
  const response = await generateData({ ...search, units });
  if (response) {
    document.querySelector(".loading").classList.add("remove");
    mainTemp(response);
    highlightUI(response);
  }
};

function changeDegree(degree) {
  degree = units === "metric" ? "C" : "F";
  return degree;
}

const mainTemp = (data) => {
  let degree = "C";
  const temp = `
    <div class="degree">
    <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="weatherIcon">
    <h1>${data.temp.toFixed()}<span>°${changeDegree(degree)}</span></h1>
    </div>
  `;
  const location = `
    <span><i class="bi bi-geo"></i></span>
    <p>${data.name} / ${data.country}</p>
  `;

  const weatherSituation = `
    <span><i class="bi bi-cloud"></i></span>
    <p>${data.description}</p>
  `;
  document.querySelector(".weatherSituation").innerHTML = weatherSituation;
  document.querySelector(".location").innerHTML = location;
  document.querySelector(".weatherDegree").innerHTML = temp;
};

const highlightUI = (data) => {
  let degree = "C";
  const minMax = `
    <h1>Max/Min Temp</h1>
    <div>
        <span class="icon"><i class="bi bi-thermometer-high"></i></span>
        <span>${data.temp_max.toFixed()}°${changeDegree(degree)}</span>
    </div>
    <div>
        <span class="icon"><i class="bi bi-thermometer-low"></i></span>
        <span>${data.temp_min.toFixed()}°${changeDegree(degree)}</span>
    </div>
  `;
  document.querySelector(".minmax").innerHTML = minMax;

  const sunTime = `
    <h1>Sunrise/Sunset</h1>
    <div>
        <span class="icon"><i class="bi bi-sunrise-fill"></i></span>
        <span class="sunrise">${formatTime(data.sunrise, data.timezone, "hh:mm a")}</span>
    </div>
    <div>
        <span class="icon"><i class="bi bi-sunset-fill"></i></span>
        <span class="sunrset">${formatTime(data.sunset, data.timezone, "hh:mm a")}</span>
    </div>
  `;
  document.querySelector(".sunTime").innerHTML = sunTime;

  const feelLike = `
    <span class="icon"><i class="bi bi-thermometer"></i></span>
    <span class="fleeDegree">${data.feels_like.toFixed()}°</span>
  `;
  document.querySelector(".feel-like").innerHTML = feelLike;

  const humidity = `
    <span class="icon"><i class="bi bi-droplet-fill"></i></span>
    <span class="fleeDegree">${data.humidity.toFixed()}<span style="font-size: 1.1rem">%</span></span>
  `;
  document.querySelector(".humidity").innerHTML = humidity;

  const wind = `
    <span class="icon"><i class="bi bi-wind"></i></span>
    <span class="fleeDegree">${data.speed.toFixed(1)}<span style="font-size: 1.1rem">Km/h</span></span>
  `;
  document.querySelector(".wind").innerHTML = wind;

  const pressure = `
    <span class="icon"><i class="bi bi-cloud-haze2-fill"></i></span>
    <span class="fleeDegree">${data.pressure}<span style="font-size: 1.1rem">Km</span></span>
  `;
  document.querySelector(".pressure").innerHTML = pressure;
};

// changing from c to f degree
cDegreeBtn.addEventListener("click", () => {
  cDegreeBtn.classList.add("active");
  fDegreeBtn.classList.remove("active");
  units = "metric";
  fetchWeatherData();
});

// changing from f to c degree
fDegreeBtn.addEventListener("click", () => {
  fDegreeBtn.classList.add("active");
  cDegreeBtn.classList.remove("active");
  units = "imperial";
  fetchWeatherData();
});

// search weather
searchBtn.addEventListener("click", () => {
  search = { q: searchInput.value };
  fetchWeatherData();
  searchInput.value = "";
});

window.addEventListener("DOMContentLoaded", () => {
  fetchWeatherData();
  getLocation();
});
