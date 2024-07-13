import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST(request) {
  try {
    // Check for a secret key to ensure the request is from your cron job
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("key");

    if (secretKey !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("update_driver_status");

    if (error) throw error;

    return NextResponse.json(
      { message: "Driver statuses updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update driver statuses:", error);
    return NextResponse.json(
      { error: "Failed to update driver statuses" },
      { status: 500 }
    );
  }
}
