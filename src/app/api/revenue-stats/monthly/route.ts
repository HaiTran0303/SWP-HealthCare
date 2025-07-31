import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    const totalRevenue = 12500000; // Example revenue
    const percentageChangeFromPreviousMonth = 10; // Example change

    return NextResponse.json({
      totalRevenue,
      percentageChangeFromPreviousMonth,
    });
  } catch (error) {
    console.error("Error fetching monthly revenue statistics:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
