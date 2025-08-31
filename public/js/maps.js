// Your listing data from backend
const placeName = listingLocation; 
const title = listingTitle;
const apiKey = maptoken; //  key

// Step 1: Create a map instance (default view: world)
const map = L.map("map").setView([20, 0], 2);

// Step 2: Add Geoapify tile layer (background map)
L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`, {
  maxZoom: 20
}).addTo(map);

// Step 3: Use Geoapify Geocoding API to convert location → lat/lon
fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(placeName)}&apiKey=${apiKey}`)
  .then(res => res.json())
  .then(result => {
    console.log(result.json())
    if (result.features.length > 0) {
      const coords = result.features[0].geometry.coordinates;
      console.log(coords);
      const lat = coords[1], lon = coords[0];

      // Step 4: Move map to that location
      map.setView([lat, lon], 12);

      // Step 5: Add marker (pointer) on the map
      L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${title}</b><br>${placeName}`)
        .openPopup();
    } else {
      // Show friendly message in the page
      const msgBox = document.getElementById("map-message");
      if (msgBox) {
        msgBox.innerText = `❌ Location "${placeName}" not found on map !! Please enter a Valid Location`;
        msgBox.style.color = "red";
        msgBox.style.fontWeight = "bold";
        // msgBox.style.margin = "10px";
        msgBox.style.fontSize = "20px"
      }
    }
  })
  .catch(err => {
    console.error(err);
    const msgBox = document.getElementById("map-message");
    if (msgBox) {
      msgBox.innerText = "⚠️ Error loading location !! API not Working 😞 Please try again later.";
      msgBox.style.color = "orange";
      msgBox.style.fontWeight = "bold";
    //   msgBox.style.marginTop = "10px";
    }
  });


