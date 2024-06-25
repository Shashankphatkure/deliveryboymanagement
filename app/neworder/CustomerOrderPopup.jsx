"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

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
    const shopAddress = "Panvel"; // Replace with your shop's address
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
        const distance = await getDistance(
          distanceMatrixService,
          shopCoords,
          customerCoords
        );
        return { ...customer, distance };
      })
    );

    const sorted = customersWithDistance.sort(
      (a, b) => a.distance - b.duration
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

  const getDistance = (service, origin, destination) => {
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: "DRIVING",
        },
        (response, status) => {
          if (status === "OK") {
            resolve(response.rows[0].elements[0].distance.value);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Customer Order</h2>
        <motion.div layout className="space-y-2">
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
              className="bg-gray-100 p-4 rounded cursor-move"
            >
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm">{customer.homeaddress}</p>
              <p className="text-sm">{customer.phone}</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
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
