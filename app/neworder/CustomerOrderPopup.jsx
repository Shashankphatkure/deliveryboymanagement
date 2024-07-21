"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useJsApiLoader } from "@react-google-maps/api";

const CustomerOrderPopup = ({ customers, onClose, onCreateOrder }) => {
  const [sortedCustomers, setSortedCustomers] = useState([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAaYgd3JAzhFT4mCzQ2CyZClpa9scSE2CI",
    libraries: ["places"],
  });

  useEffect(() => {
    if (isLoaded) {
      sortCustomersByDistance();
    }
  }, [isLoaded, customers]);

  const sortCustomersByDistance = async () => {
    const shopAddress = "Panvel, Mumbai";
    const geocoder = new window.google.maps.Geocoder();
    const distanceMatrixService =
      new window.google.maps.DistanceMatrixService();

    const shopCoords = await getCoordinates(geocoder, shopAddress);

    const customersWithDistance = await Promise.all(
      customers.map(async (customer) => {
        const customerCoords = await getCoordinates(
          geocoder,
          customer.homeaddress
        );
        const { distance, duration } = await getDistanceAndTime(
          distanceMatrixService,
          shopCoords,
          customerCoords
        );
        return { ...customer, distance, duration };
      })
    );

    const sorted = customersWithDistance.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );
    setSortedCustomers(sorted);
  };

  const getCoordinates = (geocoder, address) => {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          resolve(results[0].geometry.location);
        } else {
          reject(
            new Error(
              "Geocode was not successful for the following reason: " + status
            )
          );
        }
      });
    });
  };

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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sortedCustomers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSortedCustomers(items);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Customer Order
        </h2>
        <motion.div layout className="space-y-4 max-h-96 overflow-y-auto">
          {sortedCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              layout
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) =>
                onDragEnd({
                  source: { index },
                  destination: { index: Math.round(info.point.y / 50) },
                })
              }
              className="bg-gray-50 p-4 rounded-lg shadow cursor-move"
            >
              <p className="font-semibold text-gray-800">{customer.name}</p>
              <p className="text-sm text-gray-600">{customer.homeaddress}</p>
              <p className="text-sm text-gray-600">{customer.phone}</p>
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <p>Distance: {customer.distance}</p>
                <p>Duration: {customer.duration}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => onCreateOrder(sortedCustomers)}
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderPopup;
