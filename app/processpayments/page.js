"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase/supabase";

export default function DriverPaymentDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [penalties, setPenalties] = useState({});

  useEffect(() => {
    fetchDrivers();
    fetchPenalties();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("driver_earnings")
      .select(
        `
        id,
        driverid,
        drivername,
        driveremail,
        status,
        earning
      `
      )
      .eq("status", "completed");

    if (error) {
      console.error("Error fetching drivers:", error);
    } else {
      setDrivers(data);
    }
  };

  const fetchPenalties = async () => {
    const { data, error } = await supabase
      .from("driverpenalty")
      .select("driverid, amount");

    if (error) {
      console.error("Error fetching penalties:", error);
    } else {
      const penaltiesMap = data.reduce((acc, penalty) => {
        acc[penalty.driverid] = (acc[penalty.driverid] || 0) + penalty.amount;
        return acc;
      }, {});
      setPenalties(penaltiesMap);
    }
  };

  const handleCheckboxChange = (driverId) => {
    setSelectedDrivers((prev) =>
      prev.includes(driverId)
        ? prev.filter((id) => id !== driverId)
        : [...prev, driverId]
    );
  };

  const processPayments = async () => {
    for (const driverId of selectedDrivers) {
      const { error } = await supabase
        .from("orders")
        .update({ status: "processed" })
        .eq("driverid", driverId)
        .eq("status", "completed");

      if (error) {
        console.error("Error processing payment:", error);
      }
    }
    fetchDrivers();
    setSelectedDrivers([]);
  };

  const changeOrderStatus = async (driverId) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "processed" })
      .eq("driverid", driverId)
      .eq("status", "completed");

    if (error) {
      console.error("Error changing order status:", error);
    } else {
      fetchDrivers();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Payment Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Select</th>
              <th className="py-3 px-6 text-left">Driver</th>
              <th className="py-3 px-6 text-left">Earnings</th>
              <th className="py-3 px-6 text-left">Penalties</th>
              <th className="py-3 px-6 text-left">Net Payment</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {drivers.map((driver) => {
              const totalPenalties = penalties[driver.driverid] || 0;
              const netPayment = driver.earning - totalPenalties;

              return (
                <tr
                  key={driver.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(driver.driverid)}
                      onChange={() => handleCheckboxChange(driver.driverid)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="py-3 px-6 text-left">{driver.drivername}</td>
                  <td className="py-3 px-6 text-left">
                    ${driver.earning.toFixed(2)}
                  </td>
                  <td className="py-3 px-6 text-left">
                    ${totalPenalties.toFixed(2)}
                  </td>
                  <td className="py-3 px-6 text-left">
                    ${netPayment.toFixed(2)}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <button
                      onClick={() => changeOrderStatus(driver.driverid)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Process
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button
          onClick={processPayments}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Process Selected Payments
        </button>
      </div>
    </div>
  );
}
