// Create OpenLayers Map
const map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
      title: "OpenStreetMap",
      type: "base",
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([69.2075, 34.5553]), // Kabul center
    zoom: 12,
  }),
});

// بررسی نسخه OpenLayers در کنسول
console.log("نسخه OpenLayers:", ol.VERSION);

// تابع برای اضافه کردن لایه WMS از جئوسرور
const geoserverUrl = '/geoserver/';  // Update to use Django proxy

// Fix the WMS layer function syntax
function addWMSLayer(url, layerName, title, visible = true) {
    const wmsSource = new ol.source.TileWMS({
        url: geoserverUrl,
        params: {
            'LAYERS': layerName,
            'TILED': true,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.3.0',
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous'  // Move this inside the source options
    });

    const wmsLayer = new ol.layer.Tile({
        source: wmsSource,
        visible: visible,
        title: title,  // Add title to layer properties
        type: 'wms',   // Add type to layer properties
        name: layerName // Add name to layer properties
    });

    map.addLayer(wmsLayer);
    console.log(`Layer ${title} (${layerName}) added to map`);
    return wmsLayer;
}

// Fix the event listener
document.addEventListener("DOMContentLoaded", function () {
    console.log("Adding WMS layers from:", geoserverUrl);  // Use geoserverUrl instead of GEOSERVER_URL

    // Add WMS layers using the proxy URL
    addWMSLayer(geoserverUrl, "cite:Hospital", "شفاخانه");
    addWMSLayer(geoserverUrl, "cite:Kabul_22District", "۲۲ ناحیه کابل");
    addWMSLayer(geoserverUrl, "cite:Kabul_Area_name", "مناطق کابل");
});

// Create a vector source for the markers
const markerSource = new ol.source.Vector();

// Update the marker layer configuration
const markerLayer = new ol.layer.Vector({
  source: markerSource,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
      src: "/static/kabul/images/marker.svg", // Updated path to marker.svg
      scale: 1,
    }),
  }),
});

// Add the marker layer to the map
map.addLayer(markerLayer);

// Update the addMarkerAtCoordinates function
function addMarkerAtCoordinates(coordinates, showPopup = false) {
  // Clear previous markers
  markerSource.clear();

  // Create a marker feature at the location
  const marker = new ol.Feature({
    geometry: new ol.geom.Point(coordinates),
  });

  // Add the marker to the source
  markerSource.addFeature(marker);

  if (showPopup) {
    // Get the coordinates in longitude/latitude
    const lonLat = ol.proj.transform(coordinates, "EPSG:3857", "EPSG:4326");

    // Show popup with coordinates
    popupContent.innerHTML = `
            <h4>موقعیت انتخاب شده</h4>
            <p>طول جغرافیایی: ${lonLat[0].toFixed(6)}</p>
            <p>عرض جغرافیایی: ${lonLat[1].toFixed(6)}</p>
          `;

    popup.setPosition(coordinates);
  } else {
    // Hide popup if showPopup is false
    popup.setPosition(undefined);
  }
}

// Create overlay for popup
const popupContainer = document.createElement("div");
popupContainer.className = "ol-popup";
popupContainer.style.position = "absolute";
popupContainer.style.backgroundColor = "white";
popupContainer.style.boxShadow = "0 1px 4px rgba(0,0,0,0.2)";
popupContainer.style.padding = "15px";
popupContainer.style.borderRadius = "10px";
popupContainer.style.border = "1px solid #cccccc";
popupContainer.style.bottom = "12px";
popupContainer.style.left = "-50px";
popupContainer.style.minWidth = "150px";
popupContainer.style.zIndex = "1000";

const popupCloser = document.createElement("a");
popupCloser.href = "#";
popupCloser.style.position = "absolute";
popupCloser.style.top = "2px";
popupCloser.style.right = "8px";
popupCloser.style.color = "#999";
popupCloser.style.textDecoration = "none";
popupCloser.innerHTML = "✖";
popupContainer.appendChild(popupCloser);

const popupContent = document.createElement("div");
popupContent.style.direction = "rtl";
popupContainer.appendChild(popupContent);

document.body.appendChild(popupContainer);

const popup = new ol.Overlay({
  element: popupContainer,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

map.addOverlay(popup);

// Close popup when closer is clicked
popupCloser.onclick = function () {
  popup.setPosition(undefined);
  popupCloser.blur();
  return false;
};

// Add marker at the specified coordinates and optionally show popup
function addMarkerAtCoordinates(coordinates, showPopup = false) {
  // Clear previous markers
  markerSource.clear();

  // Create a marker feature at the location
  const marker = new ol.Feature({
    geometry: new ol.geom.Point(coordinates),
  });

  // Add the marker to the source
  markerSource.addFeature(marker);

  if (showPopup) {
    // Get the coordinates in longitude/latitude
    const lonLat = ol.proj.transform(coordinates, "EPSG:3857", "EPSG:4326");

    // Show popup with coordinates
    popupContent.innerHTML = `
            <h4>موقعیت انتخاب شده</h4>
            <p>طول جغرافیایی: ${lonLat[0].toFixed(6)}</p>
            <p>عرض جغرافیایی: ${lonLat[1].toFixed(6)}</p>
          `;

    popup.setPosition(coordinates);
  } else {
    // Hide popup if showPopup is false
    popup.setPosition(undefined);
  }
}

// Handle single click events (only add marker)
map.on("click", function (event) {
  addMarkerAtCoordinates(event.coordinate, false);
});

// Handle double click events (show marker and popup)
map.on("dblclick", function (event) {
  addMarkerAtCoordinates(event.coordinate, true);

  // Prevent the single click event from firing
  event.stopPropagation();
});

// Implement search functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get both search inputs and buttons
  const searchInputs = document.querySelectorAll(".search-input");
  const searchButtons = document.querySelectorAll(".search-button");

  // Function to perform the search
  function performSearch(searchInput, searchButton) {
    const searchText = searchInput.value.trim();
    if (!searchText) return;

    // Show loading state
    searchButton.classList.add("loading");

    // Make a request to Nominatim API
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchText
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Remove loading state
        searchButton.classList.remove("loading");

        if (data && data.length > 0) {
          // Get the first result
          const result = data[0];
          const lon = parseFloat(result.lon);
          const lat = parseFloat(result.lat);

          // Transform to map projection
          const coordinates = ol.proj.transform(
            [lon, lat],
            "EPSG:4326",
            "EPSG:3857"
          );

          // Pan to the location
          map.getView().animate({
            center: coordinates,
            zoom: 15,
            duration: 1000,
          });

          // Add a marker at the found location
          addMarkerAtCoordinates(coordinates, true);
        } else {
          // No results found
          alert("محل مورد نظر پیدا نشد");
        }
      })
      .catch((error) => {
        // Remove loading state
        searchButton.classList.remove("loading");
        console.error("Error during search:", error);
        alert("خطا در جستجو");
      });
  }

  // Add event listeners to all search buttons and inputs
  searchInputs.forEach((searchInput, index) => {
    const searchButton = searchButtons[index];

    // Add click event to button
    searchButton.addEventListener("click", () => {
      performSearch(searchInput, searchButton);
    });

    // Add enter key event to input
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch(searchInput, searchButton);
      }
    });
  });
});

// Add CSS styles for search button loading state
const searchStyles = document.createElement("style");
searchStyles.textContent = `
        .search-button {
          cursor: pointer;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 20px;
          width: 30px;
          height: 30px;
          display: inline-block;
          vertical-align: middle;
        }
        
        .search-button.loading {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>');
        }
        
        .search-input {
          border: 1px solid #ccc;
          padding: 8px;
          border-radius: 4px;
          margin-right: 5px;
          width: 180px;
        }
      `;
document.head.appendChild(searchStyles);
