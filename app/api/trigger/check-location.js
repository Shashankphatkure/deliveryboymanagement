// pages/api/check-location.js
import axios from "axios";

export default async function handler(req, res) {
  const { lat, lng, targetLat, targetLng, radius } = req.query;

  if (!lat || !lng || !targetLat || !targetLng || !radius) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const apiKey = AIzaSyAaYgd3JAzhFT4mCzQ2CyZClpa9scSE2CI;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`,
      {
        params: {
          origins: `${lat},${lng}`,
          destinations: `${targetLat},${targetLng}`,
          key: apiKey,
        },
      }
    );

    const distanceInMeters = response.data.rows[0].elements[0].distance.value;
    const isNearby = distanceInMeters <= parseFloat(radius);

    return res.status(200).json({ isNearby });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
