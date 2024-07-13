import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  console.log("API route called");

  try {
    const { title, description } = await req.json();
    console.log("Received data:", { title, description });

    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    console.log("OneSignal App ID:", ONESIGNAL_APP_ID);
    console.log(
      "OneSignal REST API Key:",
      ONESIGNAL_REST_API_KEY ? "Set" : "Not set"
    );

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error(
        "OneSignal credentials are not set in environment variables"
      );
    }

    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        contents: { en: description },
        headings: { en: title },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
      }
    );

    console.log("OneSignal API Response:", response.data);
    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Detailed error:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send notification",
        details: error.message,
        serverError: error.response ? error.response.data : null,
      },
      { status: 500 }
    );
  }
}
