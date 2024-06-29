"use client";

import React, { useState, useRef } from "react";

export default function ShirtVerificationPage() {
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleCapture = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageData) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setResult(
        data.matches ? "The shirt matches!" : "Please wear a new shirt."
      );
    } catch (err) {
      setError("An error occurred while analyzing the image.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shirt Verification</h1>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Open Camera
      </button>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        ref={fileInputRef}
        className="hidden"
      />
      {imageData && (
        <div className="mt-4">
          <img
            src={imageData}
            alt="Captured"
            className="max-w-full h-auto rounded"
          />
          <button
            onClick={analyzeImage}
            disabled={isLoading}
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>
      )}
      {result && (
        <div className="mt-4 p-4 bg-blue-100 border border-blue-500 text-blue-700 rounded">
          <p className="font-bold">Result:</p>
          <p>{result}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-500 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </main>
  );
}
