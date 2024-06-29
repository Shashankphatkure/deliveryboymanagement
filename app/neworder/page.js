"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CustomerOrderPopup from "./CustomerOrderPopup.jsx";

// Initialize Supabase client
const supabase = createClient(
  "https://sxgahulciuptxhpvdkcv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z2FodWxjaXVwdHhocHZka2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0MTAxMjcsImV4cCI6MjAyNDk4NjEyN30.8bUu7eSxcN30rYwtF576HeQnfaBUKVNpHEYPFugQqo8"
);

const RouteOptimizer = () => {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCustomersData, setSelectedCustomersData] = useState([]);

  useEffect(() => {
    fetchDrivers();
    fetchCustomers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, name, city, vehicle, status, phone, email")
      .order("name");

    if (error) {
      console.error("Error fetching drivers:", error);
    } else {
      setDrivers(data || []);
    }
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, city, phone")
      .order("name");

    if (error) {
      console.error("Error fetching customers:", error);
    } else {
      setCustomers(data || []);
    }
  };

  const handleDriverChange = (driverId) => {
    setSelectedDriver(driverId);
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleOptimizeRoutes = async () => {
    if (!selectedDriver) {
      alert("Please select a driver.");
      return;
    }

    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer.");
      return;
    }

    const selectedDriverData = drivers.find(
      (d) => d.id.toString() === selectedDriver
    );
    const customersData = await Promise.all(
      selectedCustomers.map(async (id) => {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, homeaddress, city, phone")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching customer data:", error);
          return null;
        }
        return data;
      })
    );

    setSelectedCustomersData(customersData.filter(Boolean));
    setShowPopup(true);
  };

  const handleCreateOrder = async (sortedCustomers) => {
    const shopAddress = "Panvel, Mumbai";
    const orders = [];

    // Get the selected driver's data
    const selectedDriverData = drivers.find(
      (d) => d.id.toString() === selectedDriver
    );

    // Create a Google Maps Distance Matrix Service
    const distanceMatrixService = new google.maps.DistanceMatrixService();

    for (let i = 0; i <= sortedCustomers.length; i++) {
      const start = i === 0 ? shopAddress : sortedCustomers[i - 1].homeaddress;
      const destination =
        i === sortedCustomers.length
          ? shopAddress
          : sortedCustomers[i].homeaddress;
      const customerId =
        i === sortedCustomers.length ? null : sortedCustomers[i].id;
      const customerName =
        i === sortedCustomers.length ? null : sortedCustomers[i].name;

      if (start !== destination) {
        // Calculate distance and time for this leg
        const { distance, duration } = await getDistanceAndTime(
          distanceMatrixService,
          start,
          destination
        );

        const order = {
          driverid: parseInt(selectedDriver),
          customerid: customerId,
          customername: customerName,
          drivername: selectedDriverData.name,
          driveremail: selectedDriverData.email,
          start,
          destination,
          distance,
          time: duration,
          status: "assigned", // You can set an initial status here
        };
        orders.push(order);
      }
    }

    try {
      const { data, error } = await supabase.from("orders").insert(orders);
      if (error) throw error;
      console.log("Orders created successfully:", data);
      alert("Orders created successfully!");
    } catch (error) {
      console.error("Error creating orders:", error);
      alert("Error creating orders. Please try again.");
    }

    setShowPopup(false);
    setSelectedCustomers([]);
    setSelectedDriver("");
  };

  // Helper function to get distance and time
  const getDistanceAndTime = (service, origin, destination) => {
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: "DRIVING",
        },
        (response, status) => {
          if (status === "OK") {
            const { distance, duration } = response.rows[0].elements[0];
            resolve({
              distance: distance.text,
              duration: duration.text,
            });
          } else {
            reject(
              new Error(
                "Distance Matrix was not successful for the following reason: " +
                  status
              )
            );
          }
        }
      );
    });
  };

  const safeString = (value) => (value || "").toString().toLowerCase();

  const filteredDrivers = drivers.filter(
    (driver) =>
      safeString(driver.name).includes(driverSearch.toLowerCase()) ||
      safeString(driver.city).includes(driverSearch.toLowerCase()) ||
      safeString(driver.phone).includes(driverSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (customer) =>
      safeString(customer.name).includes(customerSearch.toLowerCase()) ||
      safeString(customer.homeaddress).includes(customerSearch.toLowerCase()) ||
      safeString(customer.phone).includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Select Driver</h2>
        <input
          type="text"
          placeholder="Search drivers..."
          value={driverSearch}
          onChange={(e) => setDriverSearch(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <div className="max-h-60 overflow-y-auto border rounded">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="flex items-center justify-between p-2 hover:bg-gray-100"
            >
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="driver"
                  value={driver.id}
                  checked={selectedDriver === driver.id.toString()}
                  onChange={() => handleDriverChange(driver.id.toString())}
                />
                <span>
                  {driver.name || "N/A"} - {driver.city || "N/A"} (
                  {driver.vehicle || "N/A"})
                </span>
              </label>
              <span className="text-sm">
                <span
                  className={`px-2 py-1 rounded ${
                    driver.status === "active" ? "bg-green-200" : "bg-red-200"
                  }`}
                >
                  {driver.status || "N/A"}
                </span>
                <span className="ml-2">{driver.phone || "N/A"}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Select Customers</h2>
        <input
          type="text"
          placeholder="Search customers..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <div className="max-h-60 overflow-y-auto border rounded">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center p-2 hover:bg-gray-100"
            >
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={customer.id}
                  checked={selectedCustomers.includes(customer.id.toString())}
                  onChange={() => handleCustomerChange(customer.id.toString())}
                />
                <span>
                  {customer.name || "N/A"} - {customer.city || "N/A"} (
                  {customer.phone || "N/A"})
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
        onClick={handleOptimizeRoutes}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        Optimize Routes
      </button>

      {showPopup && (
        <CustomerOrderPopup
          customers={selectedCustomersData}
          onClose={() => setShowPopup(false)}
          onCreateOrder={handleCreateOrder}
        />
      )}
    </div>
  );
};

export default RouteOptimizer;
