"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase/supabase";

export default function DriverPaymentDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [activePenalties, setActivePenalties] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [netPayment, setNetPayment] = useState(0);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, name, email, phone, bankaccountno, bankifsccode");

    if (error) {
      console.error("Error fetching drivers:", error);
    } else {
      setDrivers(data);
    }
  };

  const fetchDriverDetails = async (driverId) => {
    const { data: orders, error: ordersError } = await supabase
      .from("driver_earnings")
      .select("id, created_at, start, destination, distance, earning, status")
      .eq("driverid", driverId)
      .eq("status", "completed");

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    } else {
      setCompletedOrders(orders);
    }

    const { data: penalties, error: penaltiesError } = await supabase
      .from("driverpenalty")
      .select("id, amount, reason")
      .eq("driverid", driverId)
      .eq("status", "active");

    if (penaltiesError) {
      console.error("Error fetching penalties:", penaltiesError);
    } else {
      setActivePenalties(penalties);
    }
  };

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    fetchDriverDetails(driver.id);
  };

  const openConfirmationModal = () => {
    if (!selectedDriver) return;

    const totalEarnings = completedOrders.reduce(
      (sum, order) => sum + order.earning,
      0
    );
    const totalPenalties = activePenalties.reduce(
      (sum, penalty) => sum + penalty.amount,
      0
    );
    const calculatedNetPayment = totalEarnings - totalPenalties;
    setNetPayment(calculatedNetPayment);
    setIsConfirmationOpen(true);
  };

  const processPayment = async () => {
    if (!selectedDriver) return;

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "processed" })
      .eq("driverid", selectedDriver.id)
      .eq("status", "completed");

    if (orderError) {
      console.error("Error updating orders:", orderError);
      return;
    }

    const { error: penaltyError } = await supabase
      .from("driverpenalty")
      .update({ status: "paid" })
      .eq("driverid", selectedDriver.id)
      .eq("status", "active");

    if (penaltyError) {
      console.error("Error updating penalties:", penaltyError);
      return;
    }

    alert(
      `Payment of $${netPayment.toFixed(2)} processed for ${
        selectedDriver.name
      }`
    );

    setIsConfirmationOpen(false);
    fetchDriverDetails(selectedDriver.id);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Driver Payment Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <label className="block mb-2 font-semibold text-gray-700">
            Select Driver:
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) =>
              handleDriverSelect(
                drivers.find((d) => d.id === parseInt(e.target.value))
              )
            }
          >
            <option value="">Select a driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>

        {selectedDriver && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedDriver.name}'s Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="text-lg font-semibold">{selectedDriver.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Bank Account No.</p>
                <p className="text-lg font-semibold">
                  {selectedDriver.bankaccountno}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Bank IFSC Code</p>
                <p className="text-lg font-semibold">
                  {selectedDriver.bankifsccode}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Completed Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Earning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {completedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {order.start}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {order.destination}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {order.distance}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          ${order.earning.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Active Penalties
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activePenalties.map((penalty) => (
                      <tr key={penalty.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-500">
                          ${penalty.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {penalty.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    $
                    {completedOrders
                      .reduce((sum, order) => sum + order.earning, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 mb-1">Total Penalties</p>
                  <p className="text-2xl font-bold text-red-600">
                    $
                    {activePenalties
                      .reduce((sum, penalty) => sum + penalty.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 mb-1">Net Payment</p>
                  <p className="text-2xl font-bold text-blue-600">
                    $
                    {(
                      completedOrders.reduce(
                        (sum, order) => sum + order.earning,
                        0
                      ) -
                      activePenalties.reduce(
                        (sum, penalty) => sum + penalty.amount,
                        0
                      )
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={openConfirmationModal}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Process Payment
            </button>
          </div>
        )}

        {/* Tailwind CSS Modal */}
        {isConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Confirm Payment</h3>
              <p className="mb-4">
                Please verify the following details before processing the
                payment:
              </p>
              <div className="mb-4">
                <p className="text-xl font-bold">
                  Total Amount: ${netPayment.toFixed(2)}
                </p>
              </div>
              <div className="mb-2">
                <p className="text-lg">
                  Bank Account: {selectedDriver?.bankaccountno}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-lg">
                  IFSC Code: {selectedDriver?.bankifsccode}
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsConfirmationOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
