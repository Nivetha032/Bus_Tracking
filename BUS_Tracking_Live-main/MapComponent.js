// MapComponent.js
import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapComponent = ({ buses }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([currentLocation?.lat || 0, currentLocation?.lng || 0], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    buses.forEach((bus, index) => {
      // Define the coordinates for the bus route
      const busRoute = [
        [bus.start.lat, bus.start.lng],
        [bus.end.lat, bus.end.lng],
      ];

      // Create a polyline for the bus route
      L.polyline(busRoute, { color: 'red' }).addTo(mapRef.current);

      // Add a marker for the current location of the bus
      L.marker([bus.current.lat, bus.current.lng]).addTo(mapRef.current);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentLocation, buses]);

  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100vw' }} />;
};

export default MapComponent;
