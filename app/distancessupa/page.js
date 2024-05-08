"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getData() {
  // Fetch data from the blogs table
  const { data, error } = await supabase
    .from("bulkordertest_duplicate")
    .select(`customersorderarray`)
    .eq("id", 1);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  return data;
}

export default function MapComponent() {
  const [data, setData] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    getData().then((data) => setData(data));
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyAaYgd3JAzhFT4mCzQ2CyZClpa9scSE2CI&callback=initMap&loading=async";
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
    }
  }, [data]);

  const initMap = async () => {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const map = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: { lat: 19.076, lng: 72.8777 },
    });

    directionsRenderer.setMap(map);

    const addresses = data[0].customersorderarray;
    let waypoints = addresses.map((address) => ({
      location: address,
      stopover: true,
    }));

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
          // Extract distance and info from the response
          const distance =
            response.routes[0].legs.reduce(
              (total, leg) => total + leg.distance.value,
              0
            ) / 1000; // in kilometers
          // Create an array of route segments
          const infoArray = response.routes[0].legs.map(
            (leg) => leg.start_address + " to " + leg.end_address
          );
          // Send data to Supabase
          sendDataToSupabase(distance, infoArray);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  };

  const sendDataToSupabase = async (distance, info) => {
    // Process the info array to extract the part after "to" and the start part
    const afterToArray = info.map((item) => {
      const afterTo = item.split(" to ")[1]; // Split the string and take the second part
      return afterTo;
    });

    const startArray = info.map((item) => {
      const start = item.split(" to ")[0]; // Split the string and take the first part
      return start;
    });

    // Prepare an array of objects to insert into Supabase
    const rowsToInsert = afterToArray.map((afterTo, index) => ({
      status: "pending",
      distance: distance,
      info: info,
      afterTo: afterTo,
      start: startArray[index], // Include the start address
    }));

    // Insert each item of afterToArray as a new row in Supabase
    for (const row of rowsToInsert) {
      const { data, error } = await supabase.from("routes").insert([row]);

      if (error) {
        console.error("Error inserting data:", error);
      } else {
        console.log("Data inserted successfully:", data);
      }
    }

    setTimeout(async () => {
      const { data, error } = await supabase.rpc("delete_duplicate_routes");

      if (error) {
        console.error("Error deleting duplicates:", error);
      } else {
        console.log("Duplicates deleted successfully:", data);
      }
    }, 1000); // 10000 milliseconds = 10 seconds

    const handleCreateOrder = async () => {
      try {
        await Promise.all(
          data.map((item) =>
            supabase
              .from("routes")
              .update({ status: "assigned" })
              .eq("id", item.id)
          )
        );
        setStatus("assigned"); // Update local status
      } catch (error) {
        console.error("Error updating status:", error);
      }
    };
  };

  return (
    <div>
      <div
        id="map"
        ref={mapRef}
        style={{ height: "400px", width: "100%" }}
      ></div>
      <div className="mx-4">
        <b>
          <h2 className="my-3">Customer addresses:</h2>
        </b>
        {data && data[0] && data[0].customersorderarray ? (
          data[0].customersorderarray.map((item, index) => (
            <p key={index}>{item}</p>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>

      <button
        onClick={() => (window.location.href = "/dragdrop")}
        className="btn-style mx-6 my-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
      >
        Drag & Drop
      </button>

      <button
        onClick={() => (window.location.href = "/dragdrop")}
        className="btn-style mx-6 my-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg"
      >
        Cancel Complete Order
      </button>
    </div>
  );
}
