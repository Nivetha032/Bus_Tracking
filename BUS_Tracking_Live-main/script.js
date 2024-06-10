document.addEventListener("DOMContentLoaded", function() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjFpc3IwNTciLCJhIjoiY2x2a2swZTNxMXd2ZTJpbzRvcW95amRtMSJ9.rkkQ3GsFRB4DKOCdj_bc0w';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11', // Default style
        center: [77.5, 11.23], // Default view at 11.23°N 77.5°E (Erode)
        zoom: 12
    });

    // Define destination (Kongu Engineering College)
    var destination = [77.6070, 11.2742];

    // Define starting locations for buses
    var startingLocations = [
        { id: "65", coordinates: [77.5047, 11.2425] }, // Vijayamangalam
        { id: "43", coordinates: [77.7172, 11.3428] }, // Erode
        { id: "20", coordinates: [77.6511, 11.1654] }, // Stopping 1 for Bus 69
        { id: "12", coordinates: [77.6772, 11.3205] }  // Stopping 2 for Bus 69
    ];

    // Add bus markers
    var busMarkers = [];
    startingLocations.forEach(function(location) {
        var el = document.createElement('div');
        el.className = 'bus-marker';

        var marker = new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .addTo(map);

        busMarkers.push(marker);
    });

    // Function to move buses towards destination
    function moveBuses() {
        busMarkers.forEach(function(busMarker) {
            var currentLngLat = busMarker.getLngLat();

            // Fetch route information using Mapbox Directions API
            var directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/driving/' +
                currentLngLat.lng + ',' + currentLngLat.lat + ';' + destination[0] + ',' + destination[1] +
                '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

            axios.get(directionsRequest)
                .then(response => {
                    var route = response.data.routes[0];
                    var leg = route.legs[0];
                    var steps = leg.steps;

                    var routeCoordinates = [];

                    // Extract coordinates from each step of the route
                    steps.forEach(step => {
                        var coordinates = step.geometry.coordinates;
                        routeCoordinates = routeCoordinates.concat(coordinates);
                    });

                    // Move bus along the route
                    var i = 0;
                    var interval = setInterval(function() {
                        if (i >= routeCoordinates.length) {
                            clearInterval(interval);
                            return;
                        }

                        var newPosition = routeCoordinates[i];
                        busMarker.setLngLat(newPosition);
                        i++;
                    }, 1000); // Adjust the interval for slower/faster movement
                })
                .catch(error => console.error('Error fetching directions:', error));
        });
    }

    // Start moving the buses
    moveBuses();
});
