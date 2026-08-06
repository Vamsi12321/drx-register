import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/specializations`, {
      cache: "force-cache",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      top: ["General Physician","Cardiology","Dermatology","Pediatrics","Orthopedic Surgery","Obstetrics & Gynecology","Neurology","Psychiatry","Ophthalmology","ENT"],
      ordered: ["General Physician","Cardiology","Dermatology","Pediatrics","Orthopedic Surgery","Obstetrics & Gynecology","Neurology","Psychiatry","Ophthalmology","ENT","Anesthesiology","Cardiothoracic Surgery","Clinical Immunology","Community Medicine","Critical Care Medicine","Dentistry","Emergency Medicine","Endocrinology","Family Medicine","Gastroenterology","General Medicine","General Surgery","Geriatric Medicine","Hematology","Hemato-Oncology","Infectious Diseases","Medical Oncology","Microbiology","Nephrology","Neonatology","Neurosurgery","Nuclear Medicine","Oral & Maxillofacial Surgery","Pain Medicine","Palliative Medicine","Pathology","Pediatric Cardiology","Pediatric Endocrinology","Pediatric Gastroenterology","Pediatric Nephrology","Pediatric Neurology","Pediatric Surgery","Physical Medicine & Rehabilitation","Plastic Surgery","Preventive Medicine","Pulmonology","Radiation Oncology","Radiology","Reproductive Medicine","Rheumatology","Sports Medicine","Surgical Gastroenterology","Surgical Oncology","Transfusion Medicine","Urology","Vascular Surgery","Venereology"],
      total: 59,
    });
  }
}
