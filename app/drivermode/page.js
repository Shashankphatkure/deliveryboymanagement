"use client";

import React, { useState, useEffect } from "react";

const LocationDistanceChecker = () => {
  const [isNearMall, setIsNearMall] = useState(null);

  useEffect(() => {
    // Load Google Maps API script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAaYgd3JAzhFT4mCzQ2CyZClpa9scSE2CI&libraries=geometry`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      checkDistance();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const checkDistance = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          // Seawoods Grand Central Mall coordinates
          const mallLocation = new google.maps.LatLng(19.04939, 79.06527);

          const service = new google.maps.DistanceMatrixService();
          service.getDistanceMatrix(
            {
              origins: [userLocation],
              destinations: [mallLocation],
              travelMode: "DRIVING",
              unitSystem: google.maps.UnitSystem.METRIC,
            },
            (response, status) => {
              if (status === "OK") {
                const distance =
                  response.rows[0].elements[0].distance.value / 1000; // Convert meters to kilometers
                const isNear = distance <= 10;
                setIsNearMall(isNear);
                console.log(
                  isNear
                    ? "User is near the store"
                    : "User is very far from the store"
                );
              } else {
                console.error("Error calculating distance:", status);
              }
            }
          );
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleCloseWindow = () => {
    window.close();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">Distance Checker</h1>
        </div>
        <div className="p-6">
          {isNearMall === null ? (
            <p className="text-gray-600">Checking distance...</p>
          ) : isNearMall ? (
            <p className="text-green-600 font-semibold">
              You are near Seawoods Grand Central Mall (within 10km).
            </p>
          ) : (
            <p className="text-red-600 font-semibold">
              You are very far from Seawoods Grand Central Mall (more than 10km
              away).
            </p>
          )}
          <button
            onClick={handleCloseWindow}
            className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDistanceChecker;
