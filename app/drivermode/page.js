"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

// TODO: Move this to a separate file and use environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="p-8 bg-white rounded-lg shadow-xl">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="text-xl font-semibold text-gray-700">
          Checking your location...
        </p>
        <p className="text-sm text-gray-500">
          Please wait while we verify your proximity to the store.
        </p>
      </div>
    </div>
  </div>
);

const LocationDistanceChecker = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LocationDistanceCheckerContent />
    </Suspense>
  );
};

const LocationDistanceCheckerContent = () => {
  const [isNearMall, setIsNearMall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const attendanceRecordCreated = useRef(false);
  const checkDistanceAttempts = useRef(0);

  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        checkDistance();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        checkDistance();
      };

      script.onerror = () => {
        setError("Failed to load Google Maps API");
        setIsLoading(false);
      };
    };

    loadGoogleMapsAPI();

    return () => {
      // Clean up logic if needed
    };
  }, []);

  const checkDistance = () => {
    if (checkDistanceAttempts.current >= 3) {
      setError("Maximum check attempts reached");
      setIsLoading(false);
      return;
    }

    checkDistanceAttempts.current += 1;

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );

        const mallLocation = new google.maps.LatLng(19.0645144, 73.0950144);

        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [userLocation],
            destinations: [mallLocation],
            travelMode: "DRIVING",
            unitSystem: google.maps.UnitSystem.METRIC,
          },
          async (response, status) => {
            if (status === "OK") {
              const distance =
                response.rows[0].elements[0].distance.value / 1000;
              const isNear = distance <= 10;
              setIsNearMall(isNear);
              setIsLoading(false);

              if (isNear && !attendanceRecordCreated.current) {
                await createAttendanceRecord();
              }
            } else {
              console.error("Error calculating distance:", status);
              setError("Error calculating distance");
              setIsLoading(false);
            }
          }
        );
      },
      (error) => {
        console.error("Error getting user location:", error);
        setError("Error getting user location");
        setIsLoading(false);
      }
    );
  };

  const createAttendanceRecord = async () => {
    if (attendanceRecordCreated.current) return;

    attendanceRecordCreated.current = true;

    try {
      const now = new Date();
      const { data, error } = await supabase.from("driverattendance").insert([
        {
          ontime: now.toTimeString().split(" ")[0],
          date: now.toISOString().split("T")[0],
          driveremail: email,
        },
      ]);

      if (error) throw error;

      console.log("Attendance record created successfully:", data);
      // Optionally, you can add a state to show a success message to the user
    } catch (error) {
      console.error("Error creating attendance record:", error);
      attendanceRecordCreated.current = false;
      // Optionally, you can add a state to show an error message to the user
    }
  };

  const handleCloseWindow = () => {
    // Instead of trying to close the window, you could redirect to a "thank you" page
    // or show a message indicating that the user can close the window
    console.log("Thank you for checking in. You can now close this window.");
  };

  const refresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={refresh}
            className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center pt-6 bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Distance Checker</h1>
          </div>
          <div className="p-6">
            {isNearMall ? (
              <p className="text-green-600 font-semibold">
                You are near the Store. Your attendance has been recorded.
              </p>
            ) : (
              <div>
                <p className="text-red-600 font-semibold">
                  You are very far from the Store.
                </p>
                <button
                  className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                  onClick={() =>
                    (window.location.href =
                      "https://www.google.com/maps/dir/19.0715468,73.0995525/dmart+kharghar/@19.060194,73.0664356,14z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x3be7c0b67daa9095:0xe3fa324f9ec2af96!2m2!1d73.0769246!2d19.0421731?entry=ttu")
                  }
                >
                  Navigate to Store
                </button>
              </div>
            )}

            <button
              onClick={refresh}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Refresh page
            </button>
            <button
              onClick={handleCloseWindow}
              className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Close Window ( Login later )
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center pt-6 pb-20 bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Safety check before starting</h1>
          </div>
          <div className="p-6">
            <p className="">1. Wear our brand Tshirt</p>
            <p className="">2. Keep location ON during delivery</p>
            <p className="">3. Drive Safely</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDistanceChecker;
