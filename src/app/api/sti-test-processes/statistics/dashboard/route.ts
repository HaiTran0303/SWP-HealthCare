import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    const totalTests = 50;
    const pendingResults = 5;

    return NextResponse.json({
      totalTests,
      pendingResults,
    });
  } catch (error) {
    console.error("Error fetching STI test statistics:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
