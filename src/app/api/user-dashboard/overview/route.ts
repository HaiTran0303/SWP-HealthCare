import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    const totalUsers = 150;

    return NextResponse.json({
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching user overview:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
