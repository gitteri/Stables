import { NextResponse } from "next/server";
import { getAllStablecoinData, getLastUpdateTime } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = getAllStablecoinData();
    const lastUpdate = getLastUpdateTime();

    return NextResponse.json({
      data,
      lastUpdate: lastUpdate?.toISOString() || null,
      count: data.length,
    });
  } catch (error) {
    console.error("[API] Error fetching stablecoin data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stablecoin data" },
      { status: 500 }
    );
  }
}
