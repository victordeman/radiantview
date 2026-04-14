import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        studies: true,
        appointments: true,
        orders: true,
      },
    });

    if (!patient) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("[PATIENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { patientId, name, dob, gender } = body;

    const patient = await db.patient.update({
      where: { id },
      data: {
        patientId,
        name,
        dob: dob ? new Date(dob) : undefined,
        gender,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("[PATIENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await db.patient.delete({
      where: { id },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("[PATIENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
