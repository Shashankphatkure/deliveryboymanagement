// app/add-driver-penalty/page.js
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabase";

export default function AddDriverPenaltyPage() {
  const initialFormState = {
    amount: "",
    reason: "",
    name: "",
    driverid: "",
    orderid: null,
    driveremail: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [driverOrders, setDriverOrders] = useState([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, name, email");
    if (error) {
      console.error("Error fetching drivers:", error);
    } else {
      setDrivers(data);
    }
  };

  const fetchDriverOrders = async (driverId) => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, start, destination")
      .eq("driverid", driverId);
    if (error) {
      console.error("Error fetching driver orders:", error);
    } else {
      setDriverOrders(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "driverid") {
      const selectedDriver = drivers.find(
        (driver) => driver.id === parseInt(value)
      );
      if (selectedDriver) {
        setFormData((prevState) => ({
          ...prevState,
          name: selectedDriver.name,
          driveremail: selectedDriver.email,
          orderid: null,
        }));
        fetchDriverOrders(selectedDriver.id);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submissionData = { ...formData };
      if (!submissionData.orderid) {
        delete submissionData.orderid;
      }

      const { data, error } = await supabase
        .from("driverpenalty")
        .insert([submissionData]);

      if (error) throw error;

      setSuccessMessage("Driver penalty added successfully!");
      setFormData(initialFormState);
      setDriverOrders([]);
    } catch (error) {
      console.error("Error adding driver penalty:", error);
      alert("Failed to add driver penalty. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData(initialFormState);
    setSuccessMessage("");
    setDriverOrders([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Add Driver Penalty
          </h1>
          {successMessage && (
            <div
              className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
              role="alert"
            >
              <p>{successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="driverid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Driver
                </label>
                <select
                  name="driverid"
                  id="driverid"
                  value={formData.driverid}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="orderid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Order (Optional)
                </label>
                <select
                  name="orderid"
                  id="orderid"
                  value={formData.orderid || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={!formData.driverid}
                >
                  <option value="">Select an order (optional)</option>
                  {driverOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id} - {order.start} to {order.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reason
                </label>
                <textarea
                  name="reason"
                  id="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleAddAnother}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Another
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? "Adding..." : "Add Penalty"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
