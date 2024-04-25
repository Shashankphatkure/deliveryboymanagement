"use client";

import React, { useEffect, useRef } from "react";

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAaYgd3JAzhFT4mCzQ2CyZClpa9scSE2CI&callback=initMap";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);

    window.initMap = initMap;

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initMap = () => {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const map = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: { lat: 19.076, lng: 72.8777 },
    });

    directionsRenderer.setMap(map);

    const waypoints = [
      { location: { lat: 19.0062716, lng: 73.1077566 }, stopover: true },
      { location: { lat: 19.0525298, lng: 73.0735111 }, stopover: true },
      { location: { lat: 19.0335938, lng: 73.018164 }, stopover: true },
      { location: { lat: 19.0221923, lng: 73.0187376 }, stopover: true },
    ];

    directionsService.route(
      {
        origin: { lat: 18.9655888, lng: 73.1028813 },
        destination: { lat: 19.075784, lng: 72.9952364 },
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  };

  return (
    <div id="map" ref={mapRef} style={{ height: "400px", width: "100%" }}></div>
  );
};

export default MapComponent;
