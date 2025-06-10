document.addEventListener("DOMContentLoaded", function () {
    // تعریف متغیرهای گلوبال
    let isRoutingMode = false;
    let userLocation = null;

    // تعریف منابع و لایه‌ها
    const routeSource = new ol.source.Vector();
    const userLocationSource = new ol.source.Vector();
    const destinationSource = new ol.source.Vector();

    // استایل‌های مختلف برای نمایش
    const routeStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#4CAF50',
            width: 6
        })
    });

    const userLocationStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({ color: '#2196F3' }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
        })
    });

    const destinationStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({ color: '#f44336' }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
        })
    });

    // اضافه کردن لایه‌های مسیریابی به نقشه
    const routeLayer = new ol.layer.Vector({
        source: routeSource,
        style: routeStyle,
        zIndex: 1
    });

    const userLocationLayer = new ol.layer.Vector({
        source: userLocationSource,
        style: userLocationStyle,
        zIndex: 2
    });

    const destinationLayer = new ol.layer.Vector({
        source: destinationSource,
        style: destinationStyle,
        zIndex: 2
    });

    map.addLayer(routeLayer);
    map.addLayer(userLocationLayer);
    map.addLayer(destinationLayer);

    // تعریف توابع کنترلی
    function updateUserLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lon = position.coords.longitude;
                const lat = position.coords.latitude;
                userLocation = [lon, lat];

                userLocationSource.clear();
                const userFeature = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat(userLocation))
                });
                userLocationSource.addFeature(userFeature);
                map.getView().animate({ center: ol.proj.fromLonLat(userLocation), zoom: 15 });
            });
        }
    }

    function clearRoute() {
        routeSource.clear();
        destinationSource.clear();
        document.getElementById('routeInfo').innerHTML = '';
    }

    function calculateRoute(destination) {
        if (!userLocation) {
            alert("لطفاً ابتدا موقعیت خود را مشخص کنید.");
            return;
        }

        const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[0]},${userLocation[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const route = data.routes[0];
                const routeFeature = new ol.format.GeoJSON().readFeature(route.geometry, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
                
                routeSource.clear();
                routeSource.addFeature(routeFeature);

                // نمایش اطلاعات مسیر
                const distance = Math.round(route.distance / 1000 * 10) / 10;
                const duration = Math.round(route.duration / 60);
                document.getElementById('routeInfo').innerHTML = `
                    <strong>اطلاعات مسیر:</strong><br>
                    مسافت: ${distance} کیلومتر<br>
                    زمان تقریبی: ${duration} دقیقه
                `;
            })
            .catch(error => {
                alert("خطا در محاسبه مسیر: " + error);
            });
    }

    // اضافه کردن event listeners
    document.getElementById('locateMe').addEventListener('click', updateUserLocation);

    document.getElementById('startRouting').addEventListener('click', function() {
        isRoutingMode = !isRoutingMode;
        this.classList.toggle('active');
        this.textContent = isRoutingMode ? '🛑 توقف مسیریابی' : '🚗 شروع مسیریابی';
    });

    document.getElementById('clearRoute').addEventListener('click', clearRoute);

    // اضافه کردن event listener برای کلیک روی نقشه
    map.on('click', function(evt) {
        if (!isRoutingMode) return;

        const coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        destinationSource.clear();
        destinationSource.addFeature(new ol.Feature({
            geometry: new ol.geom.Point(evt.coordinate)
        }));

        calculateRoute(coords);
    });
});