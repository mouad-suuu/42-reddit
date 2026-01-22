import { NextResponse } from "next/server";
import { getCampuses } from "@/lib/fortytwo-api";

export async function GET() {
    try {
        const campuses = await getCampuses();
        return NextResponse.json({ campuses });
    } catch (error) {
        console.error("Failed to fetch campuses:", error);
        return NextResponse.json({ error: "Failed to fetch campuses" }, { status: 500 });
    }
}
