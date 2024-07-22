// app/api/cron-check-drivers/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  // Verify the request is coming from BetterStack
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.BETTERSTACK_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch active orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, driverid, time, created_at")
      .eq("status", "active");

    if (error) throw error;

    const currentTime = new Date();

    // Process each order
    for (const order of orders) {
      const orderCreationTime = new Date(order.created_at);
      const orderDuration = parseInt(order.time); // Assuming time is in minutes
      const timePassed =
        (currentTime.getTime() - orderCreationTime.getTime()) / (1000 * 60); // Convert to minutes
      const progress = (timePassed / orderDuration) * 100;

      // Call the driver progress check API
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/check-driver-progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({
            orderId: order.id,
            driverId: order.driverid,
            progress,
          }),
        }
      );
    }

    return NextResponse.json({ message: `Processed ${orders.length} orders` });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
