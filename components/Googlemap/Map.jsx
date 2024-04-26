// components/Map.js
import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const MapGoogle = ({ address }) => {
  const mapRef = useRef();

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyAaYgd3JAzhFT4mCzQ2CyZClpa9scSE2CI",
      version: "weekly",
      libraries: ["geometry"],
    });

    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 18.975, lng: 72.8258 }, // Panvel coordinates
        zoom: 14,
      });

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          const marker = new google.maps.Marker({
            map,
            position: results[0].geometry.location,
          });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    });
  }, [address]);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default MapGoogle;
