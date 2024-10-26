import { NextResponse } from "next/server";
import { type MapData } from "@/lib";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();

    const response = await fetch(process.env.API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lat, lng }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    const data: MapData[] = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(process.env.API_URL as string, {
      method: "GET",
      cache: "no-cache",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    const data: MapData[] = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
