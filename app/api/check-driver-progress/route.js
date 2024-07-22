// File: app/api/check-driver-progress/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OneSignal from "@onesignal/node-onesignal";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    // Fetch current orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, drivers(*)")
      .eq("status", "current");

    if (error) throw error;

    for (const order of orders) {
      const { distance, time, start, destination, drivers, created_at } = order;
      const { email: driverEmail } = drivers;

      // Parse distance and time
      const totalDistance = parseFloat(distance);
      const totalTime = parseInt(time); // Assuming time is in minutes

      // Calculate progress
      const halfDistance = totalDistance / 2;
      const halfTime = totalTime / 2;
      const currentTime = new Date().getTime();
      const startTime = new Date(created_at).getTime();
      const elapsedTime = (currentTime - startTime) / (1000 * 60); // in minutes

      // Check if driver has crossed half distance
      const currentProgress = await checkDriverProgress(start, destination);

      let message;
      if (currentProgress >= halfDistance) {
        message = "Great! You have crossed half the distance.";
      } else if (elapsedTime > halfTime) {
        message = "Hurry up! You're behind schedule.";
      } else {
        continue; // Skip if neither condition is met
      }

      // Send notification using OneSignal
      await sendNotification(driverEmail, message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function checkDriverProgress(start, destination) {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      start
    )}&destination=${encodeURIComponent(destination)}&key=${
      process.env.GOOGLE_MAPS_API_KEY
    }`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const totalDistance = route.legs.reduce(
        (acc, leg) => acc + leg.distance.value,
        0
      );
      return totalDistance / 1000; // Convert to kilometers
    }

    throw new Error("No routes found");
  } catch (error) {
    console.error("Error calculating distance:", error);
    return 0; // Return 0 if there's an error
  }
}

async function sendNotification(driverEmail, message) {
  try {
    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      throw new Error("OneSignal credentials are not properly configured");
    }

    const configuration = OneSignal.createConfiguration({
      appKey: ONESIGNAL_API_KEY,
    });

    const client = new OneSignal.DefaultApi(configuration);

    const notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;
    notification.contents = {
      en: message,
    };
    notification.filters = [
      { field: "tag", key: "email", relation: "=", value: driverEmail },
    ];

    const { id } = await client.createNotification(notification);
    console.log("Notification sent:", id);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
