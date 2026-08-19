import { NextResponse } from "next/server";
import { API_BASE } from "../_config";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/specializations`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      top: ["General Physician","Cardiology","Dermatology","Pediatrics","Orthopedic Surgery","Obstetrics & Gynecology","Neurology","Psychiatry","Ophthalmology","ENT"],
      ordered: ["General Physician","Cardiology","Dermatology","Pediatrics","Orthopedic Surgery","Obstetrics & Gynecology","Neurology","Psychiatry","Ophthalmology","ENT"],
      total: 10,
    });
  }
}
