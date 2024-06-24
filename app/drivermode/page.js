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
    <div>
      <h1 style={{ fontWeight: "bold" }} className="mx-4 my-4">
        Distance Checker
      </h1>
      {isNearMall === null ? (
        <p className="mx-4 my-4">Checking distance...</p>
      ) : isNearMall ? (
        <p
          className="mx-4 my-4"
          style={{ color: "indigo", fontWeight: "bold" }}
        >
          You are near Store (within 10km).
        </p>
      ) : (
        <p className="mx-4 my-4">
          You are very far from Store (more than 10km away).{" "}
          <a
            style={{ color: "green", fontWeight: "bold" }}
            href="https://www.google.com/maps/dir//dmart+kharghar/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x3be7c0b67daa9095:0xe3fa324f9ec2af96?sa=X&ved=1t:3061&ictx=111"
          >
            Show Map
          </a>
          .
        </p>
      )}
      <button onClick={handleCloseWindow}>Close Window</button>
    </div>
  );
};

export default LocationDistanceChecker;
