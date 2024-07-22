// app/api/check-driver-progress/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  Client as GoogleMapsClient,
  DistanceMatrixResponse,
} from "@googlemaps/google-maps-services-js";
import OneSignal from "@onesignal/node-onesignal";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const googleMapsClient = new GoogleMapsClient({});

const oneSignalClient = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID!,
  process.env.ONESIGNAL_REST_API_KEY!
);

export async function POST(request: Request) {
  // Verify internal API key
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, driverId, progress } = await request.json();

    // Fetch specific order
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, drivers(*)")
      .eq("id", orderId)
      .single();

    if (error) throw error;

    const { distance, start, destination, drivers } = order;
    const { currentposition, email } = drivers;

    // Check if driver has crossed half distance
    const hasReachedHalfDistance = await checkHalfDistance(
      currentposition,
      start,
      destination,
      parseFloat(distance) / 2
    );

    // Prepare notification message
    let message;
    if (progress >= 50 && hasReachedHalfDistance) {
      message = "Great job! You're on track with both time and distance.";
    } else if (progress >= 50 && !hasReachedHalfDistance) {
      message =
        "You're more than halfway through the time, but need to speed up to reach the destination.";
    } else if (progress < 50 && hasReachedHalfDistance) {
      message =
        "Excellent progress! You've covered half the distance ahead of schedule.";
    } else {
      message = `You've completed about ${Math.round(
        progress
      )}% of the journey. Keep going!`;
    }

    // Send notification
    await sendNotification(email, message);

    return NextResponse.json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function checkHalfDistance(
  currentPosition: string,
  start: string,
  destination: string,
  halfDistance: number
): Promise<boolean> {
  try {
    const response: DistanceMatrixResponse =
      await googleMapsClient.distancematrix({
        params: {
          origins: [currentPosition],
          destinations: [destination],
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });

    const distanceTraveled =
      response.data.rows[0].elements[0].distance.value / 1000; // Convert meters to kilometers
    return distanceTraveled >= halfDistance;
  } catch (error) {
    console.error("Error calculating distance:", error);
    return false;
  }
}

async function sendNotification(email: string, message: string) {
  try {
    const notification = new OneSignal.Notification();
    notification.app_id = process.env.ONESIGNAL_APP_ID!;
    notification.contents = {
      en: message,
    };
    notification.filters = [{ field: "email", value: email }];

    const response = await oneSignalClient.createNotification(notification);
    console.log("Notification sent:", response.body.id);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
