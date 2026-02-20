import { NextResponse } from "next/server";
import { updateStablecoinData } from "@/lib/update-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Optional: Add authentication here
    const authHeader = request.headers.get("authorization");
    const secret = process.env.UPDATE_SECRET || "dev-secret";

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await updateStablecoinData();

    return NextResponse.json({
      success: true,
      message: "Data updated successfully",
    });
  } catch (error) {
    console.error("[API] Update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow GET for testing in development
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    await updateStablecoinData();
    return NextResponse.json({
      success: true,
      message: "Data updated successfully (dev mode)",
    });
  } catch (error) {
    console.error("[API] Update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
