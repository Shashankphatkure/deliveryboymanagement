"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function TransferOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transferredOrders, setTransferredOrders] = useState([]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "assigned");
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
  }

  async function fetchDrivers() {
    const { data, error } = await supabase.from("drivers").select("id, name");
    if (error) console.error("Error fetching drivers:", error);
    else setDrivers(data);
  }

  function handleOrderSelect(orderId) {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }

  function handleTransfer() {
    if (selectedOrders.length > 0 && selectedDriver) {
      setShowConfirmation(true);
    } else {
      alert("Please select orders and a driver to transfer to.");
    }
  }

  async function confirmTransfer() {
    const { data, error } = await supabase
      .from("orders")
      .update({ driverid: selectedDriver })
      .in("id", selectedOrders)
      .select();

    if (error) {
      console.error("Error transferring orders:", error);
      alert("Failed to transfer orders. Please try again.");
    } else {
      setTransferredOrders(data);
      setSelectedOrders([]);
      setSelectedDriver("");
      setShowConfirmation(false);
      fetchOrders();
    }
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Transfer Orders</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Select</th>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">First Driver</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">Destination</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleOrderSelect(order.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </td>
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.drivername}</td>
                <td className="px-4 py-2">{order.customername}</td>
                <td className="px-4 py-2">{order.start}</td>
                <td className="px-4 py-2">{order.destination}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <select
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
          className="border p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 flex-grow"
        >
          <option value="">Select a driver</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleTransfer}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Transfer Selected Orders
        </button>
      </div>

      {transferredOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <h2 className="text-2xl font-bold mb-4 px-4 py-2 bg-green-500 text-white">
            Newly Assigned Orders
          </h2>
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">Destination</th>
              </tr>
            </thead>
            <tbody>
              {transferredOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">{order.id}</td>
                  <td className="px-4 py-2">{order.customername}</td>
                  <td className="px-4 py-2">{order.start}</td>
                  <td className="px-4 py-2">{order.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg mb-4">
              Are you sure you want to transfer the selected orders?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
