import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    const totalAppointmentsToday = 25;
    const completedAppointmentsToday = 15;

    return NextResponse.json({
      totalAppointmentsToday,
      completedAppointmentsToday,
    });
  } catch (error) {
    console.error("Error fetching appointment statistics:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
