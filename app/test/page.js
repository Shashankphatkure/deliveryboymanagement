"use client";

import React from "react";

const CheckProgressPage = () => {
  const handleCheckProgress = async () => {
    try {
      const response = await fetch("/api/check-driver-progress", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("API Response:", data);
      alert("Working from page.js");
    } catch (error) {
      console.error("Not working from page.js", error);
      alert("Error checking from page.js");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Check Driver Progress</h1>
      <button
        onClick={handleCheckProgress}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
      >
        Check Progress
      </button>
    </div>
  );
};

export default CheckProgressPage;
