// Container for map details
const geoMap = {
  coordinates: [],
  businesses: [],
  mapInstance: {},
  markerInstances: [],

  // Set up Leaflet map
  createMap() {
    this.mapInstance = L.map("map-container", {
      center: this.coordinates,
      zoom: 14.5,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: "4",
    }).addTo(this.mapInstance);

    var userMarker = L.icon({
      iconUrl: "userMarker200.png",
      shadowUrl: "",
      iconSize: [45, 95],
      shadowSize: [50, 64],
      iconAnchor: [22, 94],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -76],
    });

    L.marker(this.coordinates, { icon: userMarker })
      .addTo(this.mapInstance)
      .bindPopup("<p1><b>You are here</b><br></p1>")
      .openPopup();
  },

  // Create markers for businesses
  createMarkers() {
    this.businesses.forEach((business) => {
      let marker = L.marker([business.lat, business.long])
        .bindPopup(`<p1>${business.name}</p1>`)
        .addTo(this.mapInstance);
      this.markerInstances.push(marker);
    });
  },
};

async function getGeolocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  }).then((pos) => [pos.coords.latitude, pos.coords.longitude]);
}

async function queryFoursquare(business) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "fsq3ATzZbmcGhdeFafr73wZcnJ+LlN6bK+4dh19a7ClS4u8=",
    },
  };
  let limit = 5;
  let lat = geoMap.coordinates[0];
  let lon = geoMap.coordinates[1];
  let response = await fetch(
    `https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`,
    options
  );
  let data = await response.text();
  let parsedData = JSON.parse(data);
  return parsedData.results;
}

function parseFoursquareData(results) {
  return results.map((result) => {
    return {
      name: result.name,
      lat: result.geocodes.main.latitude,
      long: result.geocodes.main.longitude,
    };
  });
}

window.addEventListener("load", async () => {
  geoMap.coordinates = await getGeolocation();
  geoMap.createMap();
});

document.getElementById("locate").addEventListener("click", async (event) => {
  event.preventDefault();
  let business = document.getElementById("industry").value;
  let foursquareData = await queryFoursquare(business);
  geoMap.businesses = parseFoursquareData(foursquareData);
  geoMap.createMarkers();
});
